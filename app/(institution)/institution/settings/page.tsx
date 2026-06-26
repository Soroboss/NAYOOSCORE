import { requireInstitution } from "@/app/actions/institution";
import { CollaboratorInviteForm } from "@/components/settings/collaborator-invite-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default async function InstitutionSettingsPage() {
  const { user, institution } = await requireInstitution();
  const canInvite =
    institution.member_role === "INSTITUTION_ADMIN" || user.role === "SUPER_ADMIN";

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
      {canInvite && (
        <CollaboratorInviteForm
          description="Invitez des analystes ou administrateurs à votre institution."
          roleOptions={[
            { value: "INSTITUTION_ANALYST", label: "Analyste" },
            { value: "INSTITUTION_ADMIN", label: "Administrateur" },
          ]}
        />
      )}
    </div>
  );
}
