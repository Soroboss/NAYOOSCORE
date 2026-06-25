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
import { createInsforgeServerClient } from "@/lib/insforge-server";
import { upsertProfile } from "@/lib/profiles";
import type { UserRole } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user-display";

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
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis." };
  }

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

  await setAuthCookies(data.accessToken, data.refreshToken);

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
  const full_name = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!full_name || !email || !password) {
    return { success: false, error: "Tous les champs sont requis." };
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

  await setAuthCookies(data.accessToken, data.refreshToken);
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
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { success: false, error: "Email requis." };
  }

  const client = createInsforgeServerClient();
  const { error } = await client.auth.sendResetPasswordEmail({
    email,
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

export async function requireAuth(
  check: (role: UserRole) => boolean
) {
  const { getCurrentUser } = await import("@/lib/auth");
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
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (!canAccessRoute(user.role, pathname)) {
    redirect(getRedirectPathForRole(user.role));
  }

  return user;
}
