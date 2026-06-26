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
import {
  canAccessInstitution,
  canAccessPme,
} from "@/lib/permissions";
import { createInsforgeAdminClient, createInsforgeServerClient } from "@/lib/insforge-server";
import { upsertProfile } from "@/lib/profiles";
import type { UserRole } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user-display";
import {
  checkRateLimit,
  RATE_LIMITS,
  rateLimitErrorMessage,
} from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/request-ip";
import { forgotPasswordSchema, loginSchema, registerSchema } from "@/lib/validations";
import { getAuthRedirectUrl, getSignupVerificationMessage } from "@/lib/auth-flow";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { getInstitutionForUser } from "@/lib/institution-context";
import {
  provisionInstitutionSignup,
  provisionPmeSignup,
} from "@/lib/signup-provision";
import {
  buildPendingSignupFromFormData,
  clearPendingSignupCookie,
  mergePendingSignup,
  parseInstitutionFieldsFromFormData,
  readPendingSignupCookie,
  setPendingSignupCookie,
  type PendingSignupData,
} from "@/lib/signup-pending";
import { z } from "zod";
import {
  isSignupCategory,
  isValidPlanForCategory,
  type SignupCategory,
} from "@/lib/signup-flow";

export type SignupPendingPayload = Omit<PendingSignupData, "category" | "plan">;

export type AuthActionState = {
  success: boolean;
  error?: string;
  message?: string;
  needsEmailVerification?: boolean;
  email?: string;
  redirectTo?: string;
  pendingSignup?: SignupPendingPayload;
};

const verifySignupSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, "Code requis").max(8),
  category: z.enum(["pme", "institution"]),
  plan: z.string().min(2),
  full_name: z.string().min(2),
  institution_name: z.string().optional(),
  institution_type: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function resolvePostAuthRedirect(
  userId: string,
  accessToken: string,
  email: string,
  displayName: string,
  requestedRedirect?: string | null
): Promise<string> {
  const authedClient = createInsforgeServerClient(accessToken);
  const { data: profile } = await authedClient.database
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  let role = (profile?.role as UserRole | undefined) ?? null;

  const admin = createInsforgeAdminClient();
  const { data: instLink } = await admin.database
    .from("institution_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (instLink?.role && canAccessInstitution(instLink.role as UserRole)) {
    if (!role || !canAccessInstitution(role)) {
      role = instLink.role as UserRole;
      await upsertProfile(
        {
          id: userId,
          full_name: displayName,
          email,
          role,
        },
        accessToken
      );
    }
  } else if (!profile && !role) {
    await upsertProfile(
      {
        id: userId,
        full_name: displayName,
        email,
        role: "PME_OWNER",
      },
      accessToken
    );
    role = "PME_OWNER";
  }

  const effectiveRole = role ?? (profile?.role as UserRole) ?? "PME_OWNER";

  if (requestedRedirect) {
    const safe = getSafeRedirectPath(requestedRedirect, "");
    if (safe && canAccessRoute(effectiveRole, safe)) {
      return safe;
    }
  }

  if (canAccessInstitution(effectiveRole)) {
    const institution = await getInstitutionForUser(userId, accessToken);
    if (institution) return "/institution/dashboard";
    return "/login?error=no_institution";
  }

  if (canAccessPme(effectiveRole)) {
    return getPmeRedirectPath(userId);
  }

  return getRedirectPathForRole(effectiveRole);
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
  const requestedRedirect = String(formData.get("redirect") ?? "").trim() || null;

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

  const redirectPath = await resolvePostAuthRedirect(
    data.user.id,
    data.accessToken,
    email,
    getUserDisplayName(data.user, email),
    requestedRedirect
  );

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
    const institution = parseInstitutionFieldsFromFormData(formData);

    if (
      !institution.institution_name ||
      !institution.institution_type ||
      !institution.country ||
      !institution.city
    ) {
      return { success: false, error: "Informations institution incomplètes." };
    }
  }

  const pendingSignup = buildPendingSignupFromFormData(
    formData,
    category,
    plan,
    full_name,
    email
  );

  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    name: full_name,
    redirectTo: getAuthRedirectUrl("/login"),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data?.requireEmailVerification) {
    await setPendingSignupCookie(pendingSignup);
    return {
      success: true,
      needsEmailVerification: true,
      email,
      message: getSignupVerificationMessage(),
      pendingSignup: {
        email: pendingSignup.email,
        full_name: pendingSignup.full_name,
        institution_name: pendingSignup.institution_name,
        institution_type: pendingSignup.institution_type,
        country: pendingSignup.country,
        city: pendingSignup.city,
        phone: pendingSignup.phone ?? undefined,
      },
    };
  }

  if (!data?.accessToken || !data?.refreshToken || !data.user) {
    return {
      success: false,
      error: "Compte créé mais session introuvable. Connectez-vous avec votre mot de passe.",
    };
  }

  await setAuthCookies(
    data.accessToken,
    data.refreshToken,
    data.user.emailVerified ?? true
  );

  let redirectTo: string;
  try {
    if (category === "institution") {
      await provisionInstitutionSignup({
        userId: data.user.id,
        accessToken: data.accessToken,
        full_name,
        email,
        phone: pendingSignup.phone ?? null,
        institution_name: pendingSignup.institution_name!,
        institution_type: pendingSignup.institution_type!,
        country: pendingSignup.country!,
        city: pendingSignup.city!,
        plan,
      });
      await clearPendingSignupCookie();
      redirectTo = "/institution/dashboard";
    } else {
      await provisionPmeSignup({
        userId: data.user.id,
        accessToken: data.accessToken,
        full_name,
        email,
      });
      redirectTo = await getPmeRedirectPath(data.user.id);
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Finalisation du compte impossible.",
    };
  }

  redirect(redirectTo);
}

export async function verifySignupEmailAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIpFromHeaders();
  const rate = checkRateLimit(
    `auth:verify-signup:${ip}`,
    RATE_LIMITS.forgotPassword.limit,
    RATE_LIMITS.forgotPassword.windowMs
  );
  if (!rate.success) {
    return { success: false, error: rateLimitErrorMessage(rate.retryAfter) };
  }

  const parsed = verifySignupSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    category: formData.get("category"),
    plan: formData.get("plan"),
    full_name: formData.get("full_name"),
    institution_name: formData.get("institution_name") || undefined,
    institution_type: formData.get("institution_type") || undefined,
    country: formData.get("country") || undefined,
    city: formData.get("city") || undefined,
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const data = parsed.data;
  const cookiePending = await readPendingSignupCookie();
  const fromForm: PendingSignupData = {
    category: data.category,
    plan: data.plan,
    email: data.email,
    full_name: data.full_name,
    institution_name: data.institution_name?.trim(),
    institution_type: data.institution_type?.trim(),
    country: data.country?.trim(),
    city: data.city?.trim(),
    phone: data.phone?.trim() || null,
  };
  const pending = mergePendingSignup(fromForm, cookiePending);

  if (
    pending.category === "institution" &&
    (!pending.institution_name ||
      !pending.institution_type ||
      !pending.country ||
      !pending.city)
  ) {
    return {
      success: false,
      error:
        "Informations institution incomplètes. Revenez à l'étape précédente et renseignez le nom de votre structure.",
    };
  }

  if (!isValidPlanForCategory(pending.category, pending.plan)) {
    return { success: false, error: "Forfait invalide." };
  }

  const client = createInsforgeServerClient();
  const { data: verifyData, error } = await client.auth.verifyEmail({
    email: pending.email,
    otp: data.code.trim(),
  });

  if (error || !verifyData?.accessToken || !verifyData?.refreshToken || !verifyData.user) {
    return {
      success: false,
      error: error?.message ?? "Code invalide ou expiré. Renvoyez un nouveau code.",
    };
  }

  await setAuthCookies(
    verifyData.accessToken,
    verifyData.refreshToken,
    true
  );

  let redirectTo: string;
  try {
    if (pending.category === "institution") {
      await provisionInstitutionSignup({
        userId: verifyData.user.id,
        accessToken: verifyData.accessToken,
        full_name: pending.full_name,
        email: pending.email,
        phone: pending.phone ?? null,
        institution_name: pending.institution_name!,
        institution_type: pending.institution_type!,
        country: pending.country!,
        city: pending.city!,
        plan: pending.plan,
      });
      await clearPendingSignupCookie();
      redirectTo = "/institution/dashboard";
    } else {
      await provisionPmeSignup({
        userId: verifyData.user.id,
        accessToken: verifyData.accessToken,
        full_name: pending.full_name,
        email: pending.email,
      });
      await clearPendingSignupCookie();
      redirectTo = await getPmeRedirectPath(verifyData.user.id);
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Finalisation du compte impossible.",
    };
  }

  redirect(redirectTo);
}

export async function resendSignupVerificationAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIpFromHeaders();
  const rate = checkRateLimit(
    `auth:verify-resend:${ip}`,
    RATE_LIMITS.forgotPassword.limit,
    RATE_LIMITS.forgotPassword.windowMs
  );
  if (!rate.success) {
    return { success: false, error: rateLimitErrorMessage(rate.retryAfter) };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { success: false, error: "Email requis." };
  }

  const client = createInsforgeServerClient();
  const { error } = await client.auth.resendVerificationEmail({
    email,
    redirectTo: getAuthRedirectUrl("/login"),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Nouveau code envoyé. Vérifiez votre boîte mail (et les spams).",
  };
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
    redirectTo: getAuthRedirectUrl("/login"),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Nouveau code envoyé. Vérifiez votre boîte mail (et les spams).",
  };
}

export async function verifyEmailCodeAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIpFromHeaders();
  const rate = checkRateLimit(
    `auth:verify-code:${ip}`,
    RATE_LIMITS.forgotPassword.limit,
    RATE_LIMITS.forgotPassword.windowMs
  );
  if (!rate.success) {
    return { success: false, error: rateLimitErrorMessage(rate.retryAfter) };
  }

  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!email || !code) {
    return { success: false, error: "Email et code requis." };
  }

  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.verifyEmail({ email, otp: code });

  if (error || !data?.accessToken || !data?.refreshToken) {
    return {
      success: false,
      error: error?.message ?? "Code invalide ou expiré.",
    };
  }

  await setAuthCookies(data.accessToken, data.refreshToken, true);

  const profileClient = createInsforgeServerClient(data.accessToken);
  const { data: profile } = await profileClient.database
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = (profile?.role as UserRole | undefined) ?? "PME_OWNER";
  const redirectPath = canAccessPme(role)
    ? await getPmeRedirectPath(data.user.id)
    : getRedirectPathForRole(role);

  redirect(redirectPath);
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
    error: "Email non encore vérifié. Saisissez le code reçu par email.",
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
