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
  sale_type: z.enum(["product", "service", "subscription", "mixed"]),
  item_name: z.string().optional(),
  quantity: z.coerce.number().positive().optional(),
  unit: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Montant invalide"),
  category: z.string().min(2),
  expense_type: z.string().optional(),
  description: z.string().min(2),
  expense_date: z.string().min(1),
  payment_method: z.string().optional(),
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
    sale_type: formData.get("sale_type") || "service",
    item_name: formData.get("item_name") || undefined,
    quantity: formData.get("quantity") || undefined,
    unit: formData.get("unit") || undefined,
    payment_method: formData.get("payment_method") || undefined,
    notes: formData.get("notes") || undefined,
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
    sale_type: parsed.data.sale_type,
    item_name: parsed.data.item_name ?? null,
    quantity: parsed.data.quantity ?? 1,
    unit: parsed.data.unit ?? null,
    payment_method: parsed.data.payment_method ?? null,
    notes: parsed.data.notes ?? null,
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
    expense_type: formData.get("expense_type") || formData.get("category"),
    description: formData.get("description"),
    expense_date: formData.get("expense_date"),
    payment_method: formData.get("payment_method") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("expenses").insert({
    company_id: company.id,
    amount: parsed.data.amount,
    category: parsed.data.category,
    expense_type: parsed.data.expense_type ?? parsed.data.category,
    description: parsed.data.description,
    expense_date: parsed.data.expense_date,
    payment_method: parsed.data.payment_method ?? null,
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
  monthly_salary: z.coerce.number().nonnegative().optional(),
  phone: z.string().optional(),
});

const bonusSchema = z.object({
  employee_id: z.string().uuid(),
  amount: z.coerce.number().positive(),
  bonus_date: z.string().min(1),
  bonus_type: z.string().min(2),
  description: z.string().optional(),
});

const marketingSchema = z.object({
  title: z.string().min(2),
  channel: z.string().min(2),
  budget_amount: z.coerce.number().nonnegative().optional(),
  spent_amount: z.coerce.number().nonnegative().optional(),
  start_date: z.string().min(1),
  end_date: z.string().optional(),
  status: z.string().min(2),
  target_audience: z.string().optional(),
  notes: z.string().optional(),
});

const fieldActionSchema = z.object({
  title: z.string().min(2),
  location: z.string().optional(),
  employee_id: z.string().uuid().optional().or(z.literal("")),
  action_date: z.string().min(1),
  end_date: z.string().optional(),
  status: z.string().min(2),
  objective: z.string().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  revenue_generated: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional(),
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
    monthly_salary: formData.get("monthly_salary") || undefined,
    phone: formData.get("phone") || undefined,
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
    monthly_salary: parsed.data.monthly_salary ?? null,
    phone: parsed.data.phone ?? null,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/employees");
  return { success: true, message: "Employé ajouté." };
}

export async function addEmployeeBonusAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = bonusSchema.safeParse({
    employee_id: formData.get("employee_id"),
    amount: formData.get("amount"),
    bonus_date: formData.get("bonus_date"),
    bonus_type: formData.get("bonus_type"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { data: employee } = await client.database
    .from("employees")
    .select("full_name")
    .eq("id", parsed.data.employee_id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!employee) {
    return { success: false, error: "Employé introuvable." };
  }

  const { error: bonusError } = await client.database.from("employee_bonuses").insert({
    company_id: company.id,
    employee_id: parsed.data.employee_id,
    amount: parsed.data.amount,
    bonus_date: parsed.data.bonus_date,
    bonus_type: parsed.data.bonus_type,
    description: parsed.data.description ?? null,
  });

  if (bonusError) return { success: false, error: bonusError.message };

  await client.database.from("expenses").insert({
    company_id: company.id,
    amount: parsed.data.amount,
    expense_date: parsed.data.bonus_date,
    category: "Primes & bonus",
    expense_type: "bonus",
    description: `Prime — ${employee.full_name}${parsed.data.description ? ` : ${parsed.data.description}` : ""}`,
  });

  revalidatePath("/pme/employees");
  revalidatePath("/pme/expenses");
  revalidatePath("/pme/dashboard");
  return { success: true, message: "Prime enregistrée." };
}

export async function addMarketingAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = marketingSchema.safeParse({
    title: formData.get("title"),
    channel: formData.get("channel"),
    budget_amount: formData.get("budget_amount") || 0,
    spent_amount: formData.get("spent_amount") || 0,
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date") || undefined,
    status: formData.get("status") || "planned",
    target_audience: formData.get("target_audience") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("marketing_actions").insert({
    company_id: company.id,
    ...parsed.data,
    end_date: parsed.data.end_date ?? null,
    target_audience: parsed.data.target_audience ?? null,
    notes: parsed.data.notes ?? null,
  });

  if (error) return { success: false, error: error.message };

  if ((parsed.data.spent_amount ?? 0) > 0) {
    await client.database.from("expenses").insert({
      company_id: company.id,
      amount: parsed.data.spent_amount,
      expense_date: parsed.data.start_date,
      category: "Marketing & publicité",
      expense_type: "marketing",
      description: `Marketing — ${parsed.data.title}`,
    });
  }

  revalidatePath("/pme/marketing");
  revalidatePath("/pme/expenses");
  revalidatePath("/pme/dashboard");
  return { success: true, message: "Action marketing enregistrée." };
}

export async function addFieldAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const employeeId = String(formData.get("employee_id") ?? "");
  const parsed = fieldActionSchema.safeParse({
    title: formData.get("title"),
    location: formData.get("location") || undefined,
    employee_id: employeeId || undefined,
    action_date: formData.get("action_date"),
    end_date: formData.get("end_date") || undefined,
    status: formData.get("status") || "planned",
    objective: formData.get("objective") || undefined,
    cost: formData.get("cost") || 0,
    revenue_generated: formData.get("revenue_generated") || 0,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("field_actions").insert({
    company_id: company.id,
    title: parsed.data.title,
    location: parsed.data.location ?? null,
    employee_id: parsed.data.employee_id || null,
    action_date: parsed.data.action_date,
    end_date: parsed.data.end_date ?? null,
    status: parsed.data.status,
    objective: parsed.data.objective ?? null,
    cost: parsed.data.cost ?? 0,
    revenue_generated: parsed.data.revenue_generated ?? 0,
    notes: parsed.data.notes ?? null,
  });

  if (error) return { success: false, error: error.message };

  if ((parsed.data.cost ?? 0) > 0) {
    await client.database.from("expenses").insert({
      company_id: company.id,
      amount: parsed.data.cost,
      expense_date: parsed.data.action_date,
      category: "Actions terrain & déplacements",
      expense_type: "field",
      description: `Terrain — ${parsed.data.title}`,
    });
  }

  if ((parsed.data.revenue_generated ?? 0) > 0) {
    await client.database.from("sales").insert({
      company_id: company.id,
      amount: parsed.data.revenue_generated,
      sale_date: parsed.data.action_date,
      customer_name: "Vente terrain",
      sale_type: "service",
      item_name: parsed.data.title,
      notes: parsed.data.objective ?? null,
    });
  }

  revalidatePath("/pme/field-ops");
  revalidatePath("/pme/sales");
  revalidatePath("/pme/expenses");
  revalidatePath("/pme/dashboard");
  return { success: true, message: "Action terrain enregistrée." };
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

const inventorySchema = z.object({
  name: z.string().min(2),
  quantity: z.coerce.number().nonnegative(),
  unit: z.string().optional(),
});

const inventoryAdjustSchema = z.object({
  item_id: z.string().uuid(),
  delta: z.coerce.number(),
  reason: z.string().optional(),
});

export async function addInventoryItemAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = inventorySchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("inventory_items").insert({
    company_id: company.id,
    name: parsed.data.name,
    quantity: parsed.data.quantity,
    unit: parsed.data.unit ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/inventory");
  return { success: true, message: "Article ajouté au stock." };
}

export async function adjustInventoryAction(
  _prev: PmeActionState,
  formData: FormData
): Promise<PmeActionState> {
  const { company } = await requirePmeCompany();
  const parsed = inventoryAdjustSchema.safeParse({
    item_id: formData.get("item_id"),
    delta: formData.get("delta"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { data: item } = await client.database
    .from("inventory_items")
    .select("id, quantity, name")
    .eq("id", parsed.data.item_id)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!item) return { success: false, error: "Article introuvable." };

  const newQty = Number(item.quantity) + parsed.data.delta;
  if (newQty < 0) {
    return { success: false, error: "Stock insuffisant pour cette sortie." };
  }

  const { error } = await client.database
    .from("inventory_items")
    .update({ quantity: newQty })
    .eq("id", item.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/pme/inventory");
  return {
    success: true,
    message: `Stock mis à jour : ${item.name} → ${newQty}`,
  };
}
