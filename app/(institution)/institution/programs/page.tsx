import { requireInstitution } from "@/app/actions/institution";
import { ProgramCreateForm } from "@/components/institution/program-create-form";
import { getInstitutionPrograms } from "@/lib/institution-context";
import { canManageInstitutionPrograms } from "@/lib/permissions";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  completed: "Terminé",
  archived: "Archivé",
  inactive: "Inactif",
  suspended: "Suspendu",
};

export default async function InstitutionProgramsPage() {
  const { user, institution } = await requireInstitution();
  const programs = await getInstitutionPrograms(institution.id);
  const canCreate = canManageInstitutionPrograms(user.role, institution.member_role);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Programmes</h1>
        <p className="text-muted-foreground">
          Programmes d&apos;accompagnement de {institution.name}
        </p>
      </div>

      {canCreate && <ProgramCreateForm />}

      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-medium text-[#0B1D2A]">
          Liste des programmes ({programs.length})
        </div>
        {programs.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Aucun programme créé.
          </p>
        ) : (
          <div className="divide-y">
            {programs.map((program) => (
              <div key={program.id} className="flex items-start justify-between gap-4 px-4 py-4">
                <div>
                  <p className="font-medium text-[#0B1D2A]">{program.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {program.objective ?? program.description ?? "—"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {program.start_date ?? "—"} → {program.end_date ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#00BFA6]/10 px-3 py-1 text-xs text-[#00BFA6]">
                    {statusLabels[program.status] ?? program.status}
                  </span>
                  <p className="mt-2 text-sm font-medium">
                    {program.companies_count} PME
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
