import { requirePmeCompany } from "@/app/actions/company";
import { CompanyProfileForm } from "@/components/forms/company-profile-form";

export default async function PmeProfilePage() {
  const { company } = await requirePmeCompany();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Profil entreprise</h1>
        <p className="text-muted-foreground">
          Informations légales et de contact de votre PME.
        </p>
      </div>
      <CompanyProfileForm company={company} />
    </div>
  );
}
