import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  applyAuthCookiesToResponse,
} from "@/lib/auth-cookies";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createInsforgeServerClient } from "@/lib/insforge-server";

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const redirectParam = request.nextUrl.searchParams.get("redirect");

  if (!refreshToken) {
    const loginUrl = new URL("/login", request.url);
    if (redirectParam) {
      loginUrl.searchParams.set("redirect", redirectParam);
    }
    return NextResponse.redirect(loginUrl);
  }

  const client = createInsforgeServerClient();
  const { data, error } = await client.auth.refreshSession({ refreshToken });

  if (error || !data?.accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "session_expired");
    if (redirectParam) {
      loginUrl.searchParams.set("redirect", redirectParam);
    }
    return NextResponse.redirect(loginUrl);
  }

  const destination = getSafeRedirectPath(redirectParam, "/");
  const response = NextResponse.redirect(new URL(destination, request.url));

  return applyAuthCookiesToResponse(response, {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? refreshToken,
    emailVerified: data.user?.emailVerified ?? true,
  });
}
