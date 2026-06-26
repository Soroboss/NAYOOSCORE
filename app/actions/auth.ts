"use server";

import { redirect } from "next/navigation";
import {
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/auth-cookies";
import {
  canAccessRoute,
  getPmeRedirectPath,
  getRedirectPathForRole,
} from "@/lib/auth";
import { createInsforgeServerClient, createInsforgeAdminClient } from "@/lib/insforge-server";
import { upsertProfile } from "@/lib/profiles";
import type { UserRole } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user-display";
import { getPlanPrice } from "@/lib/pricing";
import {
  checkRateLimit,
  RATE_LIMITS,
  rateLimitErrorMessage,
} from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/request-ip";
import { forgotPasswordSchema, loginSchema, registerSchema } from "@/lib/validations";
import {
  isSignupCategory,
  isValidPlanForCategory,
  type SignupCategory,
} from "@/lib/signup-flow";

export type AuthActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIpFromHeaders();
  const rate = checkRateLimit(
    `auth:signin:${ip}`,
    RATE_LIMITS.auth.limit,
    RATE_LIMITS.auth.windowMs
  );
  if (!rate.success) {
    return { success: false, error: rateLimitErrorMessage(rate.retryAfter) };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const { email, password } = parsed.data;

  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error:
        error.statusCode === 403
          ? "Email non vérifié. Consultez votre boîte mail."
          : error.message,
    };
  }

  if (!data?.accessToken || !data?.refreshToken) {
    return { success: false, error: "Connexion impossible." };
  }

  const emailVerified = data.user?.emailVerified ?? true;
  await setAuthCookies(data.accessToken, data.refreshToken, emailVerified);

  if (!emailVerified) {
    redirect("/verify-email");
  }

  const authedClient = createInsforgeServerClient(data.accessToken);
  const { data: profile } = await authedClient.database
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = (profile?.role as UserRole | undefined) ?? "PME_OWNER";

  if (!profile) {
    await upsertProfile(
      {
        id: data.user.id,
        full_name: getUserDisplayName(data.user, email),
        email,
        role: "PME_OWNER",
      },
      data.accessToken
    );
  }

  const redirectPath =
    role === "PME_OWNER" || role === "PME_STAFF" || role === "VIEWER"
      ? await getPmeRedirectPath(data.user.id)
      : getRedirectPathForRole(role);

  redirect(redirectPath);
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIpFromHeaders();
  const rate = checkRateLimit(
    `auth:signup:${ip}`,
    RATE_LIMITS.auth.limit,
    RATE_LIMITS.auth.windowMs
  );
  if (!rate.success) {
    return { success: false, error: rateLimitErrorMessage(rate.retryAfter) };
  }

  const categoryRaw = String(formData.get("category") ?? "pme");
  const plan = String(formData.get("plan") ?? "");

  const parsed = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const { full_name, email, password } = parsed.data;

  if (!isSignupCategory(categoryRaw) || !isValidPlanForCategory(categoryRaw, plan)) {
    return { success: false, error: "Parcours d'inscription invalide." };
  }

  const category = categoryRaw as SignupCategory;

  if (category === "institution") {
    const institution_name = String(formData.get("institution_name") ?? "").trim();
    const institution_type = String(formData.get("institution_type") ?? "");
    const country = String(formData.get("country") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim() || null;

    if (!institution_name || !institution_type || !country || !city) {
      return { success: false, error: "Informations institution incomplètes." };
    }

    const client = createInsforgeServerClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      name: full_name,
      redirectTo: `${getAppUrl()}/login`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.requireEmailVerification) {
      return {
        success: true,
        message:
          "Compte créé. Vérifiez votre email pour activer votre accès institution.",
      };
    }

    if (!data?.accessToken || !data?.refreshToken || !data.user) {
      return {
        success: true,
        message: "Compte créé. Connectez-vous pour accéder à votre espace.",
      };
    }

    await setAuthCookies(
      data.accessToken,
      data.refreshToken,
      data.user?.emailVerified ?? true
    );
    await upsertProfile(
      {
        id: data.user.id,
        full_name,
        email,
        role: "INSTITUTION_ADMIN",
        phone,
      },
      data.accessToken
    );

    const admin = createInsforgeAdminClient();
    const { data: institution, error: instError } = await admin.database
      .from("institutions")
      .insert({
        name: institution_name,
        type: institution_type,
        country,
        city,
        email,
        phone,
        status: "active",
      })
      .select("id")
      .single();

    if (instError || !institution) {
      return {
        success: false,
        error: instError?.message ?? "Impossible de créer l'institution.",
      };
    }

    const { error: linkError } = await admin.database.from("institution_users").insert({
      institution_id: institution.id,
      user_id: data.user.id,
      role: "INSTITUTION_ADMIN",
    });

    if (linkError) {
      return { success: false, error: linkError.message };
    }

    const monthlyAmount = getPlanPrice(plan);
    await admin.database.from("subscriptions").insert({
      institution_id: institution.id,
      plan_name: plan,
      status: "active",
      amount: monthlyAmount,
    });

    redirect("/institution/dashboard");
  }

  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    name: full_name,
    redirectTo: `${getAppUrl()}/login`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.requireEmailVerification) {
    return {
      success: true,
      message:
        "Compte créé. Vérifiez votre email pour activer votre accès, puis connectez-vous.",
    };
  }

  if (!data?.accessToken || !data?.refreshToken || !data.user) {
    return {
      success: true,
      message: "Compte créé. Vous pouvez maintenant vous connecter.",
    };
  }

  await setAuthCookies(
    data.accessToken,
    data.refreshToken,
    data.user?.emailVerified ?? true
  );
  await upsertProfile(
    {
      id: data.user.id,
      full_name,
      email,
      role: "PME_OWNER",
    },
    data.accessToken
  );

  redirect(await getPmeRedirectPath(data.user.id));
}

export async function signOutAction() {
  const client = createInsforgeServerClient();
  await client.auth.signOut();
  await clearAuthCookies();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIpFromHeaders();
  const rate = checkRateLimit(
    `auth:forgot:${ip}`,
    RATE_LIMITS.forgotPassword.limit,
    RATE_LIMITS.forgotPassword.windowMs
  );
  if (!rate.success) {
    return { success: false, error: rateLimitErrorMessage(rate.retryAfter) };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Email invalide.",
    };
  }

  const client = createInsforgeServerClient();
  const { error } = await client.auth.sendResetPasswordEmail({
    email: parsed.data.email,
    redirectTo: `${getAppUrl()}/forgot-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Si un compte existe, un email de réinitialisation a été envoyé.",
  };
}

export async function resendVerificationAction(
  _prev: AuthActionState = { success: false }
): Promise<AuthActionState> {
  const ip = await getClientIpFromHeaders();
  const rate = checkRateLimit(
    `auth:verify:${ip}`,
    RATE_LIMITS.forgotPassword.limit,
    RATE_LIMITS.forgotPassword.windowMs
  );
  if (!rate.success) {
    return { success: false, error: rateLimitErrorMessage(rate.retryAfter) };
  }

  const { getAccessToken } = await import("@/lib/auth-cookies");
  const { syncEmailVerifiedFromAuth } = await import("@/lib/auth");
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: "Session expirée. Reconnectez-vous." };
  }

  const client = createInsforgeServerClient(token);
  const { data: current } = await client.auth.getCurrentUser();
  const email = current?.user?.email;

  if (!email) {
    return { success: false, error: "Impossible de récupérer votre email." };
  }

  if (current?.user?.emailVerified) {
    await syncEmailVerifiedFromAuth(token);
    return { success: true, message: "Votre email est déjà vérifié." };
  }

  const { error } = await client.auth.resendVerificationEmail({
    email,
    redirectTo: `${getAppUrl()}/login`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Email de vérification renvoyé. Consultez votre boîte mail.",
  };
}

export async function checkVerificationAction(
  _prev: AuthActionState = { success: false }
): Promise<AuthActionState> {
  const { getAccessToken } = await import("@/lib/auth-cookies");
  const { syncEmailVerifiedFromAuth } = await import("@/lib/auth");
  const token = await getAccessToken();
  if (!token) {
    return { success: false, error: "Session expirée." };
  }

  const verified = await syncEmailVerifiedFromAuth(token);
  if (verified) {
    return { success: true, message: "Email vérifié. Redirection en cours…" };
  }

  return {
    success: false,
    error: "Email non encore vérifié. Cliquez sur le lien reçu par mail.",
  };
}

export async function requireAuth(
  check: (role: UserRole) => boolean
) {
  const { getCurrentUser, requireVerifiedEmail } = await import("@/lib/auth");
  await requireVerifiedEmail();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!check(user.role)) {
    redirect(getRedirectPathForRole(user.role));
  }

  return user;
}

export async function requireAuthForPath(pathname: string) {
  const { getCurrentUser, requireVerifiedEmail } = await import("@/lib/auth");
  await requireVerifiedEmail(pathname);
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (!canAccessRoute(user.role, pathname)) {
    redirect(getRedirectPathForRole(user.role));
  }

  return user;
}
