import { requireAdmin } from "@/app/actions/admin";
import { CollaboratorInviteForm } from "@/components/settings/collaborator-invite-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

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
      <CollaboratorInviteForm
        description="Ajoutez un gestionnaire SaaS avec accès à l'administration."
        roleOptions={[{ value: "SAAS_MANAGER", label: "Gestionnaire SaaS" }]}
      />
    </div>
  );
}
