import { cookies } from "next/headers";

export const ACCESS_COOKIE = "insforge_access_token";
export const REFRESH_COOKIE = "insforge_refresh_token";
export const CODE_VERIFIER_COOKIE = "insforge_code_verifier";
export const EMAIL_VERIFIED_COOKIE = "insforge_email_verified";

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const ACCESS_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  emailVerified = true
) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...authCookieOptions,
    maxAge: ACCESS_MAX_AGE,
  });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...authCookieOptions,
    maxAge: REFRESH_MAX_AGE,
  });
  cookieStore.set(EMAIL_VERIFIED_COOKIE, emailVerified ? "1" : "0", {
    ...authCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function setEmailVerifiedCookie(emailVerified: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(EMAIL_VERIFIED_COOKIE, emailVerified ? "1" : "0", {
    ...authCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  cookieStore.delete(EMAIL_VERIFIED_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
}

export async function isEmailVerifiedCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(EMAIL_VERIFIED_COOKIE)?.value === "1";
}
