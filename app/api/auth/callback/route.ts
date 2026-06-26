import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  CODE_VERIFIER_COOKIE,
  applyAuthCookiesToResponse,
} from "@/lib/auth-cookies";
import { getPmeRedirectPath, getRedirectPathForRole } from "@/lib/auth";
import { canAccessPme } from "@/lib/permissions";
import { createInsforgeServerClient } from "@/lib/insforge-server";
import { upsertProfile } from "@/lib/profiles";
import type { UserRole } from "@/lib/constants";
import { getUserDisplayName } from "@/lib/user-display";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("insforge_code");
  const error = params.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${error ?? "oauth_failed"}`, request.url)
    );
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(CODE_VERIFIER_COOKIE)?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL("/login?error=missing_verifier", request.url)
    );
  }

  const client = createInsforgeServerClient();
  const { data, error: exchangeError } = await client.auth.exchangeOAuthCode(
    code,
    codeVerifier
  );

  if (exchangeError || !data?.accessToken || !data.refreshToken) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${exchangeError?.message ?? "exchange_failed"}`,
        request.url
      )
    );
  }

  const authedClient = createInsforgeServerClient(data.accessToken);
  const { data: profile } = await authedClient.database
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    await upsertProfile({
      id: data.user.id,
      full_name: getUserDisplayName(data.user),
      email: data.user.email,
      role: "PME_OWNER",
    });
  }

  const role = (profile?.role as UserRole | undefined) ?? "PME_OWNER";
  const emailVerified = data.user?.emailVerified ?? true;

  if (!emailVerified) {
    const response = NextResponse.redirect(new URL("/verify-email", request.url));
    applyAuthCookiesToResponse(response, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      emailVerified: false,
    });
    response.cookies.delete(CODE_VERIFIER_COOKIE);
    return response;
  }

  const redirectPath = canAccessPme(role)
    ? await getPmeRedirectPath(data.user.id)
    : getRedirectPathForRole(role);

  const response = NextResponse.redirect(new URL(redirectPath, request.url));
  applyAuthCookiesToResponse(response, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    emailVerified: true,
  });
  response.cookies.delete(CODE_VERIFIER_COOKIE);
  return response;
}
