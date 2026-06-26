import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  EMAIL_VERIFIED_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth-cookies";
import {
  checkRateLimit,
  RATE_LIMITS,
  rateLimitErrorMessage,
} from "@/lib/rate-limit";
import { getClientIpFromRequest } from "@/lib/request-ip";
import { securityHeaders } from "@/lib/security-headers";

const protectedPrefixes = ["/admin", "/institution", "/pme"];

function applySecurityHeaders(response: NextResponse) {
  for (const header of securityHeaders) {
    response.headers.set(header.key, header.value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const emailVerifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;

  // Limite uniquement les appels API auth (POST) — pas les visites des pages login/register.
  // Les Server Actions appliquent déjà un rate limit sur les soumissions de formulaires.
  if (pathname.startsWith("/api/auth") && request.method === "POST") {
    const ip = getClientIpFromRequest(request);
    const result = checkRateLimit(
      `mw:api-auth:${ip}`,
      RATE_LIMITS.forgotPassword.limit,
      RATE_LIMITS.forgotPassword.windowMs
    );

    if (!result.success) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: rateLimitErrorMessage(result.retryAfter) },
          {
            status: 429,
            headers: {
              "Retry-After": String(result.retryAfter ?? 60),
            },
          }
        )
      );
    }
  }

  if (pathname.startsWith("/api/institution") && !accessToken) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    );
  }

  if (pathname.startsWith("/api/institution")) {
    const ip = getClientIpFromRequest(request);
    const result = checkRateLimit(
      `api:export:${ip}`,
      RATE_LIMITS.apiExport.limit,
      RATE_LIMITS.apiExport.windowMs
    );
    if (!result.success) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: rateLimitErrorMessage(result.retryAfter) },
          {
            status: 429,
            headers: { "Retry-After": String(result.retryAfter ?? 60) },
          }
        )
      );
    }
  }

  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !accessToken) {
    if (refreshToken) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", pathname);
      return applySecurityHeaders(NextResponse.redirect(refreshUrl));
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (
    isProtected &&
    accessToken &&
    emailVerifiedCookie === "0" &&
    !pathname.startsWith("/verify-email")
  ) {
    const verifyUrl = new URL("/verify-email", request.url);
    verifyUrl.searchParams.set("redirect", pathname);
    return applySecurityHeaders(NextResponse.redirect(verifyUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
  ],
};
