"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/app/actions/auth";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { canAccessAdmin } from "@/lib/permissions";

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
