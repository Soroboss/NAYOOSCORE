"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/app/actions/auth";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { getPlanPrice } from "@/lib/pricing";
import { canAccessAdmin, canManagePricingPlans } from "@/lib/permissions";

export type AdminActionState = { success: boolean; error?: string; message?: string };

export async function requireAdmin() {
  return requireAuth(canAccessAdmin);
}

const institutionSchema = z.object({
  name: z.string().min(2),
  type: z.enum([
    "ministry",
    "ngo",
    "bank",
    "fund",
    "incubator",
    "accelerator",
    "private_company",
  ]),
  country: z.string().min(2),
  city: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function createInstitutionAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = institutionSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    country: formData.get("country"),
    city: formData.get("city"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("institutions").insert({
    ...parsed.data,
    phone: parsed.data.phone ?? null,
    status: "active",
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/institutions");
  revalidatePath("/admin/dashboard");
  return { success: true, message: "Institution créée." };
}

const subscriptionSchema = z.object({
  institution_id: z.string().uuid(),
  plan_name: z.enum(["starter", "pro", "enterprise"]),
  amount: z.coerce.number().positive().optional(),
});

export async function assignSubscriptionAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const user = await requireAdmin();
  if (!canManagePricingPlans(user.role)) {
    return {
      success: false,
      error: "Permission refusée : attribution d'abonnement réservée aux gestionnaires.",
    };
  }

  const amountRaw = formData.get("amount");
  const parsed = subscriptionSchema.safeParse({
    institution_id: formData.get("institution_id"),
    plan_name: formData.get("plan_name"),
    amount: amountRaw ? Number(amountRaw) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { institution_id, plan_name, amount } = parsed.data;

  const { data: existing } = await client.database
    .from("subscriptions")
    .select("id")
    .eq("institution_id", institution_id)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: "Cette institution a déjà un abonnement actif. Désactivez-le d'abord.",
    };
  }

  const monthlyAmount = amount ?? getPlanPrice(plan_name);

  const { error } = await client.database.from("subscriptions").insert({
    institution_id,
    plan_name,
    status: "active",
    amount: monthlyAmount,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/institutions");
  return { success: true, message: "Abonnement activé avec succès." };
}
