import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  setAuthCookies,
} from "@/lib/auth-cookies";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { createInsforgeServerClient } from "@/lib/insforge-server";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
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

  await setAuthCookies(
    data.accessToken,
    data.refreshToken ?? refreshToken,
    data.user?.emailVerified ?? true
  );

  const destination = getSafeRedirectPath(redirectParam, "/");
  return NextResponse.redirect(new URL(destination, request.url));
}
