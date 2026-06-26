import Link from "next/link";
import { requireAdmin } from "@/app/actions/admin";
import { CollaboratorInviteForm } from "@/components/settings/collaborator-invite-form";
import { CollaboratorsList } from "@/components/settings/collaborators-list";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { SettingsAlert } from "@/components/settings/settings-alert";
import { PageHeader } from "@/components/dashboard/page-header";
import { ADMIN_COLLABORATOR_ROLES } from "@/lib/collaborator-roles";
import { listAdminCollaborators } from "@/lib/collaborators";
import { canManageCollaborators, canManagePricingPlans } from "@/lib/permissions";

export default async function AdminSettingsPage() {
  const user = await requireAdmin();
  const { collaborators, error: collaboratorsError } = await listAdminCollaborators();
  const canManage = canManageCollaborators(user.role);
  const canManagePlans = canManagePricingPlans(user.role);

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Compte"
        title="Paramètres"
        description="Profil, sécurité et équipe plateforme."
      />

      {collaboratorsError && (
        <SettingsAlert variant="warning">
          Profil et mot de passe restent disponibles. Équipe plateforme :{" "}
          {collaboratorsError}
        </SettingsAlert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsForm user={user} />
        <PasswordSettingsForm />
      </div>

      {canManagePlans && (
        <section className="rounded-xl border bg-white p-6 text-sm">
          <h2 className="font-semibold text-[#0B1D2A]">Offres tarifaires</h2>
          <p className="mt-1 text-muted-foreground">
            Créez et modifiez les plans institutionnels et PME affichés sur le site
            et lors de l&apos;inscription.
          </p>
          <Link
            href="/admin/subscriptions"
            className="mt-4 inline-flex text-[#0077B6] font-medium hover:underline"
          >
            Gérer les abonnements et tarifs →
          </Link>
        </section>
      )}

      <CollaboratorsList
        collaborators={collaborators}
        roleOptions={ADMIN_COLLABORATOR_ROLES}
        canManage={canManage}
        currentUserId={user.id}
        space="admin"
      />
      <CollaboratorInviteForm
        description="Ajoutez un gestionnaire ou un agent support avec des permissions adaptées."
        roleOptions={ADMIN_COLLABORATOR_ROLES}
        canInvite={canManage}
      />
    </div>
  );
}
