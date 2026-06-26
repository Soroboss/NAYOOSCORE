"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/app/actions/auth";
import { requireInstitution } from "@/app/actions/institution";
import { requirePmeCompany } from "@/app/actions/company";
import { getAccessToken } from "@/lib/auth-cookies";
import { getCurrentUser } from "@/lib/auth";
import {
  createInsforgeAdminClient,
  createInsforgeServerClient,
} from "@/lib/insforge-server";
import { canAccessAdmin, canAccessInstitution, canManageCollaborators, resolveInstitutionRole } from "@/lib/permissions";
import { getSettingsPath } from "@/lib/settings-path";
import type { UserRole } from "@/lib/constants";
import {
  ADMIN_INVITE_ROLES,
  INSTITUTION_INVITE_ROLES,
  PME_INVITE_ROLES,
} from "@/lib/collaborators";

export type SettingsActionState = {
  success: boolean;
  error?: string;
  message?: string;
};

const profileSchema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  phone: z.string().optional(),
});

const passwordCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, "Code requis"),
  new_password: z.string().min(8, "8 caractères minimum"),
  confirm_password: z.string().min(8),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirm_password"],
});

const collaboratorSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  role: z.string().min(2),
});

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function generateTempPassword() {
  return `Nayoo${randomBytes(4).toString("hex")}!`;
}

export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non connecté." };

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const token = await getAccessToken();
  const client = createInsforgeServerClient(token);
  const { error } = await client.database
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone ?? null,
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath(getSettingsPath(user.role));
  return { success: true, message: "Profil mis à jour." };
}

export async function requestPasswordResetCodeAction(
  _prev: SettingsActionState
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non connecté." };

  const client = createInsforgeServerClient();
  const { error } = await client.auth.sendResetPasswordEmail({
    email: user.email,
    redirectTo: `${getAppUrl()}${getSettingsPath(user.role)}`,
  });

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    message: "Code envoyé par email. Saisissez-le ci-dessous avec votre nouveau mot de passe.",
  };
}

export async function changePasswordWithCodeAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non connecté." };

  const parsed = passwordCodeSchema.safeParse({
    email: user.email,
    code: formData.get("code"),
    new_password: formData.get("new_password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const client = createInsforgeServerClient();
  const { data: exchange, error: exchangeError } =
    await client.auth.exchangeResetPasswordToken({
      email: parsed.data.email,
      code: parsed.data.code,
    });

  if (exchangeError || !exchange?.token) {
    return {
      success: false,
      error: exchangeError?.message ?? "Code invalide ou expiré.",
    };
  }

  const { error } = await client.auth.resetPassword({
    newPassword: parsed.data.new_password,
    otp: exchange.token,
  });

  if (error) return { success: false, error: error.message };

  return { success: true, message: "Mot de passe mis à jour. Reconnectez-vous si nécessaire." };
}

export async function inviteCollaboratorAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non connecté." };

  const parsed = collaboratorSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    };
  }

  const { full_name, email, role } = parsed.data;

  if (canAccessAdmin(user.role)) {
    if (!canManageCollaborators(user.role)) {
      return { success: false, error: "Vous n'avez pas le droit d'inviter des collaborateurs." };
    }
    if (!ADMIN_INVITE_ROLES.includes(role as UserRole)) {
      return { success: false, error: "Rôle admin invalide." };
    }
  } else if (canAccessInstitution(user.role)) {
    const { institution } = await requireInstitution();
    const effectiveRole = resolveInstitutionRole(user.role, institution.member_role);
    if (!canManageCollaborators(effectiveRole)) {
      return { success: false, error: "Réservé aux administrateurs institution." };
    }
    if (!INSTITUTION_INVITE_ROLES.includes(role as UserRole)) {
      return { success: false, error: "Rôle institution invalide." };
    }
  } else {
    await requirePmeCompany();
    if (!canManageCollaborators(user.role)) {
      return { success: false, error: "Réservé au dirigeant PME." };
    }
    if (!PME_INVITE_ROLES.includes(role as UserRole)) {
      return { success: false, error: "Rôle PME invalide." };
    }
  }

  const tempPassword = generateTempPassword();
  const admin = createInsforgeAdminClient();

  const { data: signUpData, error: signUpError } = await admin.auth.signUp({
    email,
    password: tempPassword,
    name: full_name,
    redirectTo: `${getAppUrl()}/login`,
  });

  if (signUpError) {
    return { success: false, error: signUpError.message };
  }

  const newUserId = signUpData?.user?.id;
  if (!newUserId) {
    return {
      success: false,
      error: "Compte créé mais identifiant introuvable. Vérifiez l'email de vérification.",
    };
  }

  await admin.database.from("profiles").upsert({
    id: newUserId,
    full_name,
    email,
    role: role as UserRole,
    phone: null,
  });

  if (canAccessInstitution(user.role)) {
    const { institution } = await requireInstitution();
    const { error: linkError } = await admin.database.from("institution_users").insert({
      institution_id: institution.id,
      user_id: newUserId,
      role,
    });
    if (linkError) return { success: false, error: linkError.message };
  } else if (!canAccessAdmin(user.role)) {
    const { company } = await requirePmeCompany();
    const { error: linkError } = await admin.database.from("company_users").insert({
      company_id: company.id,
      user_id: newUserId,
      role,
    });
    if (linkError) return { success: false, error: linkError.message };
  }

  revalidatePath(getSettingsPath(user.role));
  return {
    success: true,
    message: `Collaborateur créé. Mot de passe temporaire : ${tempPassword} (à communiquer de façon sécurisée).`,
  };
}

export async function updateCollaboratorRoleAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Non connecté." };

  const space = formData.get("space");
  const linkId = formData.get("link_id");
  const targetUserId = formData.get("user_id");
  const role = formData.get("role");

  if (
    typeof space !== "string" ||
    typeof linkId !== "string" ||
    typeof targetUserId !== "string" ||
    typeof role !== "string"
  ) {
    return { success: false, error: "Données invalides." };
  }

  if (targetUserId === user.id) {
    return { success: false, error: "Vous ne pouvez pas modifier votre propre rôle." };
  }

  const admin = createInsforgeAdminClient();

  if (space === "admin") {
    if (!canManageCollaborators(user.role)) {
      return { success: false, error: "Permission refusée." };
    }
    if (!ADMIN_INVITE_ROLES.includes(role as UserRole)) {
      return { success: false, error: "Rôle invalide." };
    }
    const { error } = await admin.database
      .from("profiles")
      .update({ role })
      .eq("id", targetUserId);
    if (error) return { success: false, error: error.message };
  } else if (space === "institution") {
    const { institution } = await requireInstitution();
    const effectiveRole = resolveInstitutionRole(user.role, institution.member_role);
    if (!canManageCollaborators(effectiveRole)) {
      return { success: false, error: "Permission refusée." };
    }
    if (!INSTITUTION_INVITE_ROLES.includes(role as UserRole)) {
      return { success: false, error: "Rôle invalide." };
    }
    const { error: profileError } = await admin.database
      .from("profiles")
      .update({ role })
      .eq("id", targetUserId);
    if (profileError) return { success: false, error: profileError.message };

    const { error } = await admin.database
      .from("institution_users")
      .update({ role })
      .eq("id", linkId)
      .eq("institution_id", institution.id);
    if (error) return { success: false, error: error.message };
  } else if (space === "pme") {
    const { company } = await requirePmeCompany();
    if (!canManageCollaborators(user.role)) {
      return { success: false, error: "Permission refusée." };
    }
    if (!PME_INVITE_ROLES.includes(role as UserRole)) {
      return { success: false, error: "Rôle invalide." };
    }
    const { error: profileError } = await admin.database
      .from("profiles")
      .update({ role })
      .eq("id", targetUserId);
    if (profileError) return { success: false, error: profileError.message };

    const { error } = await admin.database
      .from("company_users")
      .update({ role })
      .eq("id", linkId)
      .eq("company_id", company.id);
    if (error) return { success: false, error: error.message };
  } else {
    return { success: false, error: "Espace inconnu." };
  }

  revalidatePath(getSettingsPath(user.role));
  return { success: true, message: "Rôle collaborateur mis à jour." };
}

export async function requireSettingsAccess() {
  return requireAuth(() => true);
}
