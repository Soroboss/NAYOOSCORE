"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CODE_VERIFIER_COOKIE } from "@/lib/auth-cookies";
import { createInsforgeServerClient } from "@/lib/insforge-server";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function initiateOAuthAction(provider: "google" | "github") {
  const client = createInsforgeServerClient();

  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    redirectTo: `${getAppUrl()}/api/auth/callback`,
    skipBrowserRedirect: true,
  });

  if (error || !data?.url || !data.codeVerifier) {
    redirect("/login?error=oauth_init_failed");
  }

  const cookieStore = await cookies();
  cookieStore.set(CODE_VERIFIER_COOKIE, data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(data.url);
}

export async function signInWithGoogleAction() {
  return initiateOAuthAction("google");
}
