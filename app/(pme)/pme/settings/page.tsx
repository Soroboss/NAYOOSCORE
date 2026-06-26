import { requireAuth } from "@/app/actions/auth";
import { requirePmeCompany } from "@/app/actions/company";
import { CollaboratorInviteForm } from "@/components/settings/collaborator-invite-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { canAccessPme } from "@/lib/permissions";

export default async function PmeSettingsPage() {
  const user = await requireAuth(canAccessPme);
  await requirePmeCompany();
  const canInvite = user.role === "PME_OWNER";

  return (
    <div className="space-y-8 p-6">
      <PageHeader
        badge="Compte"
        title="Paramètres"
        description="Profil personnel, mot de passe et collaborateurs PME."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsForm user={user} />
        <PasswordSettingsForm />
      </div>
      {canInvite && (
        <CollaboratorInviteForm
          description="Ajoutez des collaborateurs à votre espace PME."
          roleOptions={[
            { value: "PME_STAFF", label: "Collaborateur" },
            { value: "VIEWER", label: "Lecteur (consultation seule)" },
          ]}
        />
      )}
    </div>
  );
}
