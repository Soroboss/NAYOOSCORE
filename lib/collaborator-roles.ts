import type { UserRole } from "@/lib/constants";
import type { Permission } from "@/lib/permissions";

export type CollaboratorSpace = "admin" | "institution" | "pme";

export type CollaboratorRoleDefinition = {
  value: UserRole;
  label: string;
  description: string;
  permissions: Permission[];
  restrictions: string[];
};

export const ADMIN_COLLABORATOR_ROLES: CollaboratorRoleDefinition[] = [
  {
    value: "SAAS_MANAGER",
    label: "Gestionnaire SaaS",
    description: "Administration complète des institutions, abonnements et utilisateurs.",
    permissions: [
      "institutions:read",
      "institutions:write",
      "programs:read",
      "users:read",
      "users:write",
      "subscriptions:read",
      "subscriptions:write",
      "audit:read",
      "settings:read",
      "collaborators:write",
    ],
    restrictions: [
      "Pas d'accès à la configuration scoring",
      "Ne peut pas promouvoir un super admin",
    ],
  },
  {
    value: "SAAS_SUPPORT",
    label: "Support plateforme",
    description: "Consultation et assistance, sans modification des abonnements.",
    permissions: [
      "institutions:read",
      "programs:read",
      "users:read",
      "audit:read",
      "settings:read",
    ],
    restrictions: [
      "Lecture seule sur institutions et utilisateurs",
      "Pas de création ni modification d'abonnements",
      "Pas d'invitation de collaborateurs",
    ],
  },
];

export const INSTITUTION_COLLABORATOR_ROLES: CollaboratorRoleDefinition[] = [
  {
    value: "INSTITUTION_ADMIN",
    label: "Administrateur",
    description: "Gestion complète du portefeuille et de l'équipe institution.",
    permissions: [
      "programs:read",
      "programs:write",
      "companies:read",
      "companies:write",
      "scores:read",
      "funding:read",
      "funding:write",
      "reports:read",
      "reports:export",
      "billing:read",
      "settings:read",
      "collaborators:write",
    ],
    restrictions: ["Accès facturation et invitations réservés à ce rôle"],
  },
  {
    value: "INSTITUTION_ANALYST",
    label: "Analyste",
    description: "Analyse des PME, scores et rapports sans décisions de financement.",
    permissions: [
      "programs:read",
      "companies:read",
      "scores:read",
      "funding:read",
      "reports:read",
      "settings:read",
    ],
    restrictions: [
      "Ne peut pas créer de programmes ni cohortes",
      "Ne peut pas valider de financement",
      "Pas d'export de rapports",
      "Pas d'invitation de collaborateurs",
    ],
  },
  {
    value: "INSTITUTION_VIEWER",
    label: "Lecteur institution",
    description: "Consultation du tableau de bord et des entreprises accompagnées.",
    permissions: ["programs:read", "companies:read", "scores:read", "settings:read"],
    restrictions: [
      "Aucune modification",
      "Pas d'accès financement ni rapports",
      "Pas d'export",
    ],
  },
];

export const PME_COLLABORATOR_ROLES: CollaboratorRoleDefinition[] = [
  {
    value: "PME_STAFF",
    label: "Collaborateur",
    description: "Gestion opérationnelle quotidienne de l'entreprise.",
    permissions: [
      "companies:read",
      "companies:write",
      "scores:read",
      "finances:read",
      "finances:write",
      "operations:read",
      "operations:write",
      "settings:read",
    ],
    restrictions: [
      "Pas de demande de financement",
      "Pas d'invitation de collaborateurs",
    ],
  },
  {
    value: "PME_ACCOUNTANT",
    label: "Comptable",
    description: "Accès limité aux modules financiers (ventes, dépenses, trésorerie).",
    permissions: [
      "companies:read",
      "finances:read",
      "finances:write",
      "settings:read",
    ],
    restrictions: [
      "Pas d'accès clients, stocks, marketing ni terrain",
      "Pas de score ni demande de financement",
      "Pas d'invitation de collaborateurs",
    ],
  },
  {
    value: "VIEWER",
    label: "Lecteur",
    description: "Consultation du dashboard, profil et score uniquement.",
    permissions: ["companies:read", "scores:read", "settings:read"],
    restrictions: [
      "Aucune saisie ni modification",
      "Modules finances et opérations masqués",
    ],
  },
];

export function getCollaboratorRolesForSpace(
  space: CollaboratorSpace
): CollaboratorRoleDefinition[] {
  if (space === "admin") return ADMIN_COLLABORATOR_ROLES;
  if (space === "institution") return INSTITUTION_COLLABORATOR_ROLES;
  return PME_COLLABORATOR_ROLES;
}

export function getCollaboratorRoleDefinition(
  role: UserRole
): CollaboratorRoleDefinition | undefined {
  return [
    ...ADMIN_COLLABORATOR_ROLES,
    ...INSTITUTION_COLLABORATOR_ROLES,
    ...PME_COLLABORATOR_ROLES,
  ].find((r) => r.value === role);
}
