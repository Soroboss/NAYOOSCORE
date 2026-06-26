"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/app/actions/admin";
import { createInsforgeAdminClient } from "@/lib/insforge-server";

export type PricingActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

const planSchema = z.object({
  id: z
    .string()
    .min(2)
    .regex(/^[a-z0-9_]+$/, "Identifiant : lettres minuscules, chiffres et _"),
  category: z.enum(["institution", "pme"]),
  name: z.string().min(2),
  description: z.string().min(2),
  monthly_price: z.coerce.number().min(0),
  yearly_price: z.coerce.number().min(0).optional(),
  max_pme: z.coerce.number().int().positive().optional(),
  max_programs: z.coerce.number().int().positive().optional(),
  max_users: z.coerce.number().int().positive().optional(),
  for_whom: z.string().optional(),
  features: z.string().min(2),
  highlighted: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().optional(),
});

function parseFeaturesInput(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function upsertPricingPlanAction(
  _prev: PricingActionState,
  formData: FormData
): Promise<PricingActionState> {
  await requireAdmin();

  const parsed = planSchema.safeParse({
    id: formData.get("id"),
    category: formData.get("category"),
    name: formData.get("name"),
    description: formData.get("description"),
    monthly_price: formData.get("monthly_price"),
    yearly_price: formData.get("yearly_price") || undefined,
    max_pme: formData.get("max_pme") || undefined,
    max_programs: formData.get("max_programs") || undefined,
    max_users: formData.get("max_users") || undefined,
    for_whom: formData.get("for_whom") || undefined,
    features: formData.get("features"),
    highlighted: formData.get("highlighted") === "on",
    active: formData.get("active") !== "off",
    sort_order: formData.get("sort_order") || 0,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const data = parsed.data;
  const client = createInsforgeAdminClient();

  const payload = {
    id: data.id,
    category: data.category,
    name: data.name,
    description: data.description,
    monthly_price: data.monthly_price,
    yearly_price: data.yearly_price ?? null,
    max_pme: data.max_pme ?? null,
    max_programs: data.max_programs ?? null,
    max_users: data.max_users ?? null,
    for_whom: data.for_whom ?? null,
    features: parseFeaturesInput(data.features),
    highlighted: data.highlighted ?? false,
    active: data.active ?? true,
    sort_order: data.sort_order ?? 0,
  };

  const { error } = await client.database
    .from("pricing_plans")
    .upsert(payload, { onConflict: "id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/subscriptions");
  revalidatePath("/signup/plans");
  revalidatePath("/");
  return { success: true, message: `Plan « ${data.name} » enregistré.` };
}

export async function deletePricingPlanAction(
  planId: string
): Promise<PricingActionState> {
  await requireAdmin();
  const client = createInsforgeAdminClient();
  const { error } = await client.database
    .from("pricing_plans")
    .update({ active: false })
    .eq("id", planId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/subscriptions");
  return { success: true, message: "Plan désactivé." };
}
