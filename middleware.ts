import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  EMAIL_VERIFIED_COOKIE,
} from "@/lib/auth-cookies";
import {
  checkRateLimit,
  RATE_LIMITS,
  rateLimitErrorMessage,
} from "@/lib/rate-limit";
import { getClientIpFromRequest } from "@/lib/request-ip";
import { securityHeaders } from "@/lib/security-headers";

const protectedPrefixes = ["/admin", "/institution", "/pme"];
const rateLimitedPrefixes = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth",
];

function applySecurityHeaders(response: NextResponse) {
  for (const header of securityHeaders) {
    response.headers.set(header.key, header.value);
  }
  return response;
}

function isRateLimitedPath(pathname: string): boolean {
  return rateLimitedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const emailVerifiedCookie = request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value;

  if (isRateLimitedPath(pathname)) {
    const ip = getClientIpFromRequest(request);
    const limit =
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/api/auth")
        ? RATE_LIMITS.forgotPassword
        : RATE_LIMITS.auth;
    const result = checkRateLimit(
      `mw:${pathname}:${ip}`,
      limit.limit,
      limit.windowMs
    );

    if (!result.success) {
      if (pathname.startsWith("/api/")) {
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

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "rate_limit");
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
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
