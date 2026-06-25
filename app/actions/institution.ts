"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/app/actions/auth";
import {
  getInstitutionCompanyDetail,
  getInstitutionForUser,
} from "@/lib/institution-context";
import { getAuthedServerClient } from "@/lib/insforge-server";
import { canAccessInstitution } from "@/lib/permissions";

export type InstitutionActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function requireInstitution() {
  const user = await requireAuth(canAccessInstitution);
  const institution = await getInstitutionForUser(user.id);

  if (!institution) {
    redirect("/login?error=no_institution");
  }

  return { user, institution };
}

export async function requireInstitutionAdmin() {
  const ctx = await requireInstitution();
  if (ctx.institution.member_role !== "INSTITUTION_ADMIN" && ctx.user.role !== "SUPER_ADMIN") {
    redirect("/institution/dashboard");
  }
  return ctx;
}

const programSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().optional(),
  objective: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export async function createProgramAction(
  _prev: InstitutionActionState,
  formData: FormData
): Promise<InstitutionActionState> {
  const { institution } = await requireInstitutionAdmin();
  const parsed = programSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    objective: formData.get("objective") || undefined,
    start_date: formData.get("start_date") || undefined,
    end_date: formData.get("end_date") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { error } = await client.database.from("programs").insert({
    institution_id: institution.id,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    objective: parsed.data.objective ?? null,
    start_date: parsed.data.start_date ?? null,
    end_date: parsed.data.end_date ?? null,
    status: "active",
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/institution/programs");
  revalidatePath("/institution/dashboard");
  return { success: true, message: "Programme créé." };
}

const fundingDecisionSchema = z.object({
  funding_request_id: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "observe"]),
  amount_approved: z.coerce.number().optional(),
  reason: z.string().min(5, "Motif requis"),
});

export async function decideFundingAction(
  _prev: InstitutionActionState,
  formData: FormData
): Promise<InstitutionActionState> {
  const { user, institution } = await requireInstitution();
  const parsed = fundingDecisionSchema.safeParse({
    funding_request_id: formData.get("funding_request_id"),
    decision: formData.get("decision"),
    amount_approved: formData.get("amount_approved") || undefined,
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const client = await getAuthedServerClient();
  const { data: request } = await client.database
    .from("funding_requests")
    .select("id, institution_id, amount_requested")
    .eq("id", parsed.data.funding_request_id)
    .eq("institution_id", institution.id)
    .maybeSingle();

  if (!request) {
    return { success: false, error: "Demande introuvable." };
  }

  const amountApproved =
    parsed.data.decision === "approved"
      ? (parsed.data.amount_approved ?? Number(request.amount_requested))
      : null;

  const { error: decisionError } = await client.database.from("funding_decisions").insert({
    funding_request_id: request.id,
    decision: parsed.data.decision,
    amount_approved: amountApproved,
    reason: parsed.data.reason,
    decided_by: user.id,
  });

  if (decisionError) return { success: false, error: decisionError.message };

  const newStatus =
    parsed.data.decision === "approved"
      ? "approved"
      : parsed.data.decision === "rejected"
        ? "rejected"
        : "under_review";

  const { error: updateError } = await client.database
    .from("funding_requests")
    .update({ status: newStatus })
    .eq("id", request.id);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/institution/funding-decisions");
  revalidatePath("/institution/dashboard");
  return { success: true, message: "Décision enregistrée." };
}

export async function assignCompanyToProgramAction(
  companyId: string,
  programId: string
): Promise<InstitutionActionState> {
  const { institution } = await requireInstitutionAdmin();
  const detail = await getInstitutionCompanyDetail(institution.id, companyId);
  if (!detail) return { success: false, error: "Entreprise introuvable." };

  const client = await getAuthedServerClient();
  const { data: program } = await client.database
    .from("programs")
    .select("id")
    .eq("id", programId)
    .eq("institution_id", institution.id)
    .maybeSingle();

  if (!program) return { success: false, error: "Programme introuvable." };

  const { error } = await client.database
    .from("companies")
    .update({ program_id: programId })
    .eq("id", companyId)
    .eq("institution_id", institution.id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/institution/companies/${companyId}`);
  revalidatePath("/institution/companies");
  return { success: true, message: "PME rattachée au programme." };
}
