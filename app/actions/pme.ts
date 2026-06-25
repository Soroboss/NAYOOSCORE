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

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  is_recurring: z.enum(["yes", "no"]).optional(),
});

const supplierSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

const employeeSchema = z.object({
  full_name: z.string().min(2),
  role: z.string().optional(),
  hire_date: z.string().optional(),
});

const treasurySchema = z.object({
  amount: z.coerce.number().positive(),
  entry_date: z.string().min(1),
  type: z.enum(["inflow", "outflow"]),
  description: z.string().optional(),
});

const fundingSchema = z.object({
  institution_id: z.string().uuid(),
  amount_requested: z.coerce.number().positive(),
  purpose: z.string().min(10),
});

export async function addCustomerAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
    is_recurring: formData.get("is_recurring") || "no",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const client = await getAuthedServerClient();
  const { error } = await client.database.from("customers").insert({
    company_id: company.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone ?? null,
    is_recurring: parsed.data.is_recurring === "yes",
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/customers");
  return { success: true, message: "Client ajouté." };
}

export async function addSupplierAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const client = await getAuthedServerClient();
  const { error } = await client.database.from("suppliers").insert({
    company_id: company.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone ?? null,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/suppliers");
  return { success: true, message: "Fournisseur ajouté." };
}

export async function addEmployeeAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = employeeSchema.safeParse({
    full_name: formData.get("full_name"),
    role: formData.get("role") || undefined,
    hire_date: formData.get("hire_date") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const client = await getAuthedServerClient();
  const { error } = await client.database.from("employees").insert({
    company_id: company.id,
    full_name: parsed.data.full_name,
    role: parsed.data.role ?? null,
    hire_date: parsed.data.hire_date ?? null,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/employees");
  return { success: true, message: "Employé ajouté." };
}

export async function addTreasuryEntryAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = treasurySchema.safeParse({
    amount: formData.get("amount"),
    entry_date: formData.get("entry_date"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const client = await getAuthedServerClient();
  const { error } = await client.database.from("treasury_entries").insert({
    company_id: company.id,
    amount: parsed.data.amount,
    entry_date: parsed.data.entry_date,
    type: parsed.data.type,
    description: parsed.data.description ?? null,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/treasury");
  revalidatePath("/pme/dashboard");
  return { success: true, message: "Mouvement enregistré." };
}

export async function submitFundingRequestAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = fundingSchema.safeParse({
    institution_id: formData.get("institution_id"),
    amount_requested: formData.get("amount_requested"),
    purpose: formData.get("purpose"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const client = await getAuthedServerClient();
  const { error } = await client.database.from("funding_requests").insert({
    company_id: company.id,
    institution_id: parsed.data.institution_id,
    amount_requested: parsed.data.amount_requested,
    purpose: parsed.data.purpose,
    status: "submitted",
    submitted_at: new Date().toISOString(),
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/funding-request");
  return { success: true, message: "Demande soumise à l'institution." };
}

export async function uploadDocumentAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { user, company } = await requirePmeCompany();
  const file = formData.get("file");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Fichier requis." };
  }
  if (!name) return { success: false, error: "Nom du document requis." };

  const client = await getAuthedServerClient();
  const storageKey = `${company.id}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const blob = new Blob([await file.arrayBuffer()], {
    type: file.type || "application/octet-stream",
  });

  const { data: uploadData, error: uploadError } = await client.storage
    .from("pme-documents")
    .upload(storageKey, blob);

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const { error: dbError } = await client.database.from("documents").insert({
    company_id: company.id,
    name,
    category: category || null,
    storage_key: uploadData?.key ?? storageKey,
    storage_url: uploadData?.url ?? null,
    uploaded_by: user.id,
  });

  if (dbError) return { success: false, error: dbError.message };
  revalidatePath("/pme/documents");
  return { success: true, message: "Document téléversé." };
}

export async function generateRecommendationsAction(): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const accessToken = await getAccessToken();
  if (!accessToken) return { success: false, error: "Session expirée." };

  const { error } = await invokeEdgeFunction(
    "generate-ai-recommendations",
    { company_id: company.id },
    accessToken
  );
  if (error) return { success: false, error };
  revalidatePath("/pme/recommendations");
  return { success: true, message: "Recommandations générées." };
}
