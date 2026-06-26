import { requireAuth } from "@/app/actions/auth";
import { requirePmeCompany } from "@/app/actions/company";
import { CollaboratorInviteForm } from "@/components/settings/collaborator-invite-form";
import { CollaboratorsList } from "@/components/settings/collaborators-list";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { SettingsAlert } from "@/components/settings/settings-alert";
import { PageHeader } from "@/components/dashboard/page-header";
import { PME_COLLABORATOR_ROLES } from "@/lib/collaborator-roles";
import { listPmeCollaborators } from "@/lib/collaborators";
import { canAccessPme, canManageCollaborators } from "@/lib/permissions";

export default async function PmeSettingsPage() {
  const user = await requireAuth(canAccessPme);
  const { company } = await requirePmeCompany();
  const canManage = canManageCollaborators(user.role);
  const { collaborators, error: collaboratorsError } = await listPmeCollaborators(
    company.id
  );

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Compte"
        title="Paramètres"
        description="Profil personnel, mot de passe et collaborateurs PME."
      />
      {collaboratorsError && (
        <SettingsAlert variant="warning">
          Profil et mot de passe restent disponibles. Équipe : {collaboratorsError}
        </SettingsAlert>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsForm user={user} />
        <PasswordSettingsForm />
      </div>
      <CollaboratorsList
        collaborators={collaborators}
        roleOptions={PME_COLLABORATOR_ROLES}
        canManage={canManage}
        currentUserId={user.id}
        space="pme"
      />
      <CollaboratorInviteForm
        description="Ajoutez des collaborateurs, comptables ou lecteurs selon leurs responsabilités."
        roleOptions={PME_COLLABORATOR_ROLES}
        canInvite={canManage}
      />
    </div>
  );
}
