import { createInsforgeAdminClient } from "@/lib/insforge-server";
import { upsertProfile } from "@/lib/profiles";
import type { UserRole } from "@/lib/constants";
import { getPlanPrice } from "@/lib/pricing";

export type InstitutionSignupData = {
  userId: string;
  accessToken: string;
  full_name: string;
  email: string;
  phone: string | null;
  institution_name: string;
  institution_type: string;
  country: string;
  city: string;
  plan: string;
};

export async function provisionInstitutionSignup(data: InstitutionSignupData) {
  await upsertProfile(
    {
      id: data.userId,
      full_name: data.full_name,
      email: data.email,
      role: "INSTITUTION_ADMIN" as UserRole,
      phone: data.phone,
    },
    data.accessToken
  );

  const admin = createInsforgeAdminClient();

  const { data: existingLink } = await admin.database
    .from("institution_users")
    .select("institution_id")
    .eq("user_id", data.userId)
    .maybeSingle();

  if (existingLink?.institution_id) {
    return existingLink.institution_id;
  }

  const { data: institution, error: instError } = await admin.database
    .from("institutions")
    .insert({
      name: data.institution_name,
      type: data.institution_type,
      country: data.country,
      city: data.city,
      email: data.email,
      phone: data.phone,
      status: "active",
    })
    .select("id")
    .single();

  if (instError || !institution) {
    throw new Error(instError?.message ?? "Impossible de créer l'institution.");
  }

  const { error: linkError } = await admin.database.from("institution_users").insert({
    institution_id: institution.id,
    user_id: data.userId,
    role: "INSTITUTION_ADMIN",
  });

  if (linkError) throw new Error(linkError.message);

  const monthlyAmount = getPlanPrice(data.plan);
  const { error: subError } = await admin.database.from("subscriptions").insert({
    institution_id: institution.id,
    plan_name: data.plan,
    status: "active",
    amount: monthlyAmount,
  });

  if (subError) {
    console.error("subscription insert failed during signup:", subError.message);
  }

  return institution.id;
}

export async function provisionPmeSignup(data: {
  userId: string;
  accessToken: string;
  full_name: string;
  email: string;
}) {
  await upsertProfile(
    {
      id: data.userId,
      full_name: data.full_name,
      email: data.email,
      role: "PME_OWNER",
    },
    data.accessToken
  );
}
