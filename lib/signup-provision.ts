import { revalidatePath } from "next/cache";
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

/**
 * Crée l'institution, le lien utilisateur, l'abonnement puis le profil.
 * Toutes les écritures passent par le client admin (service role) pour garantir
 * la cohérence même si le profil existait déjà ou si la RLS bloque l'utilisateur.
 */
export async function provisionInstitutionSignup(data: InstitutionSignupData) {
  const admin = createInsforgeAdminClient();

  const { data: existingLink, error: linkLookupError } = await admin.database
    .from("institution_users")
    .select("institution_id")
    .eq("user_id", data.userId)
    .maybeSingle();

  if (linkLookupError) {
    throw new Error(linkLookupError.message);
  }

  let institutionId = existingLink?.institution_id ?? null;

  const institutionPayload = {
    name: data.institution_name.trim(),
    type: data.institution_type,
    country: data.country.trim(),
    city: data.city.trim(),
    email: data.email,
    phone: data.phone,
    status: "active" as const,
  };

  if (!institutionId) {
    const { data: institution, error: instError } = await admin.database
      .from("institutions")
      .insert(institutionPayload)
      .select("id")
      .single();

    if (instError || !institution) {
      throw new Error(instError?.message ?? "Impossible de créer l'institution.");
    }

    institutionId = institution.id;

    const { error: linkError } = await admin.database.from("institution_users").insert({
      institution_id: institutionId,
      user_id: data.userId,
      role: "INSTITUTION_ADMIN",
    });

    if (linkError) {
      throw new Error(linkError.message);
    }

    const monthlyAmount = getPlanPrice(data.plan);
    const { error: subError } = await admin.database.from("subscriptions").insert({
      institution_id: institutionId,
      plan_name: data.plan,
      status: "active",
      amount: monthlyAmount,
    });

    if (subError) {
      throw new Error(
        `Institution créée mais abonnement impossible : ${subError.message}`
      );
    }
  } else {
    const { error: updateError } = await admin.database
      .from("institutions")
      .update(institutionPayload)
      .eq("id", institutionId);

    if (updateError) {
      throw new Error(
        `Impossible de mettre à jour l'institution : ${updateError.message}`
      );
    }
  }

  const { error: profileError } = await admin.database.from("profiles").upsert(
    {
      id: data.userId,
      full_name: data.full_name,
      email: data.email,
      role: "INSTITUTION_ADMIN",
      phone: data.phone,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Synchronise aussi via le token utilisateur (lecture côté app)
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

  revalidatePath("/admin/institutions");
  revalidatePath("/institution/dashboard");

  return institutionId;
}

export async function provisionPmeSignup(data: {
  userId: string;
  accessToken: string;
  full_name: string;
  email: string;
}) {
  const admin = createInsforgeAdminClient();

  const { error: profileError } = await admin.database.from("profiles").upsert(
    {
      id: data.userId,
      full_name: data.full_name,
      email: data.email,
      role: "PME_OWNER",
      phone: null,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

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
