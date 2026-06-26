import { cookies } from "next/headers";
import type { SignupCategory } from "@/lib/signup-flow";

export const PENDING_SIGNUP_COOKIE = "nayoo_pending_signup";
const MAX_AGE = 60 * 60;

export type PendingSignupData = {
  category: SignupCategory;
  plan: string;
  email: string;
  full_name: string;
  institution_name?: string;
  institution_type?: string;
  country?: string;
  city?: string;
  phone?: string | null;
};

export function parseInstitutionFieldsFromFormData(formData: FormData) {
  return {
    institution_name: String(formData.get("institution_name") ?? "").trim(),
    institution_type: String(formData.get("institution_type") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
  };
}

export function buildPendingSignupFromFormData(
  formData: FormData,
  category: SignupCategory,
  plan: string,
  full_name: string,
  email: string
): PendingSignupData {
  const base: PendingSignupData = { category, plan, email, full_name };

  if (category !== "institution") {
    return base;
  }

  const institution = parseInstitutionFieldsFromFormData(formData);
  return {
    ...base,
    institution_name: institution.institution_name,
    institution_type: institution.institution_type,
    country: institution.country,
    city: institution.city,
    phone: institution.phone,
  };
}

export async function setPendingSignupCookie(data: PendingSignupData) {
  const store = await cookies();
  store.set(PENDING_SIGNUP_COOKIE, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function readPendingSignupCookie(): Promise<PendingSignupData | null> {
  const store = await cookies();
  const raw = store.get(PENDING_SIGNUP_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingSignupData;
  } catch {
    return null;
  }
}

export async function clearPendingSignupCookie() {
  const store = await cookies();
  store.delete(PENDING_SIGNUP_COOKIE);
}

export function mergePendingSignup(
  formData: PendingSignupData,
  cookie: PendingSignupData | null
): PendingSignupData {
  if (!cookie || cookie.email !== formData.email) {
    return formData;
  }

  if (formData.category !== "institution") {
    return formData;
  }

  return {
    ...cookie,
    ...formData,
    institution_name: formData.institution_name || cookie.institution_name,
    institution_type: formData.institution_type || cookie.institution_type,
    country: formData.country || cookie.country,
    city: formData.city || cookie.city,
    phone: formData.phone ?? cookie.phone,
    full_name: formData.full_name || cookie.full_name,
  };
}
