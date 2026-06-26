import { requireAdmin } from "@/app/actions/admin";
import { CollaboratorInviteForm } from "@/components/settings/collaborator-invite-form";
import { CollaboratorsList } from "@/components/settings/collaborators-list";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { ADMIN_COLLABORATOR_ROLES } from "@/lib/collaborator-roles";
import { listAdminCollaborators } from "@/lib/collaborators";
import { canManageCollaborators } from "@/lib/permissions";

export default async function AdminSettingsPage() {
  const user = await requireAdmin();
  const collaborators = await listAdminCollaborators();
  const canManage = canManageCollaborators(user.role);

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Compte"
        title="Paramètres"
        description="Profil, sécurité et équipe plateforme."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsForm user={user} />
        <PasswordSettingsForm />
      </div>
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
