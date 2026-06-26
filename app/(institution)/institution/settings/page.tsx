import { requireInstitution } from "@/app/actions/institution";
import { CollaboratorInviteForm } from "@/components/settings/collaborator-invite-form";
import { CollaboratorsList } from "@/components/settings/collaborators-list";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { INSTITUTION_COLLABORATOR_ROLES } from "@/lib/collaborator-roles";
import { listInstitutionCollaborators } from "@/lib/collaborators";
import { canManageCollaborators, resolveInstitutionRole } from "@/lib/permissions";

export default async function InstitutionSettingsPage() {
  const { user, institution } = await requireInstitution();
  const effectiveRole = resolveInstitutionRole(user.role, institution.member_role);
  const canManage = canManageCollaborators(effectiveRole);
  const collaborators = await listInstitutionCollaborators(institution.id);

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge={institution.name}
        title="Paramètres"
        description="Profil, mot de passe et équipe institution."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsForm user={user} />
        <PasswordSettingsForm />
      </div>
      <CollaboratorsList
        collaborators={collaborators}
        roleOptions={INSTITUTION_COLLABORATOR_ROLES}
        canManage={canManage}
        currentUserId={user.id}
        space="institution"
      />
      <CollaboratorInviteForm
        description="Invitez des analystes, lecteurs ou administrateurs avec des droits différenciés."
        roleOptions={INSTITUTION_COLLABORATOR_ROLES}
        canInvite={canManage}
      />
    </div>
  );
}
