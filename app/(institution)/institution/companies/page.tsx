import { requireInstitution } from "@/app/actions/institution";
import { CompaniesTable } from "@/components/institution/companies-table";
import { getInstitutionCompanies } from "@/lib/institution-context";

export default async function InstitutionCompaniesPage() {
  const { institution } = await requireInstitution();
  const companies = await getInstitutionCompanies(institution.id);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Entreprises</h1>
        <p className="text-muted-foreground">
          PME rattachées à {institution.name} ({companies.length})
        </p>
      </div>
      <CompaniesTable companies={companies} />
    </div>
  );
}
