"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePmeCompany } from "@/app/actions/company";
import { getAccessToken } from "@/lib/auth-cookies";
import { invokeEdgeFunction } from "@/lib/functions";
import { getAuthedServerClient } from "@/lib/insforge-server";

export type PmeActionState = { success: boolean; error?: string; message?: string };

const saleSchema = z.object({
  amount: z.coerce.number().positive("Montant invalide"),
  customer_name: z.string().min(2),
  sale_date: z.string().min(1),
});

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Montant invalide"),
  category: z.string().min(2),
  description: z.string().min(2),
  expense_date: z.string().min(1),
});

export async function addSaleAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = saleSchema.safeParse({
    amount: formData.get("amount"),
    customer_name: formData.get("customer_name"),
    sale_date: formData.get("sale_date"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("sales").insert({
    company_id: company.id,
    amount: parsed.data.amount,
    customer_name: parsed.data.customer_name,
    sale_date: parsed.data.sale_date,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/sales");
  revalidatePath("/pme/dashboard");
  return { success: true, message: "Vente enregistrée." };
}

export async function addExpenseAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    description: formData.get("description"),
    expense_date: formData.get("expense_date"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("expenses").insert({
    company_id: company.id,
    amount: parsed.data.amount,
    category: parsed.data.category,
    description: parsed.data.description,
    expense_date: parsed.data.expense_date,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/expenses");
  revalidatePath("/pme/dashboard");
  return { success: true, message: "Dépense enregistrée." };
}

export async function calculateScoreAction(): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, error: "Session expirée." };
  }

  const { error } = await invokeEdgeFunction(
    "calculate-company-score",
    { company_id: company.id },
    accessToken
  );

  if (error) {
    return { success: false, error };
  }

  revalidatePath("/pme/score");
  revalidatePath("/pme/dashboard");
  return { success: true, message: "Score recalculé." };
}
