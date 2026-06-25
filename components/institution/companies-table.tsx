import Link from "next/link";
import type { CompanyWithScore } from "@/lib/institution-context";

function formatFcfa(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

type Props = {
  companies: CompanyWithScore[];
};

export function CompaniesTable({ companies }: Props) {
  if (companies.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-sm text-muted-foreground">
        Aucune PME rattachée à votre institution pour le moment.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-[#F5F7FA] text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Entreprise</th>
            <th className="px-4 py-3 font-medium">Secteur</th>
            <th className="px-4 py-3 font-medium">Programme</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Ville</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-[#F5F7FA]/60">
              <td className="px-4 py-3">
                <Link
                  href={`/institution/companies/${company.id}`}
                  className="font-medium text-[#0077B6] hover:underline"
                >
                  {company.name}
                </Link>
                <p className="text-xs text-muted-foreground">{company.owner_name}</p>
              </td>
              <td className="px-4 py-3">{company.sector ?? "—"}</td>
              <td className="px-4 py-3">{company.program_name ?? "Non assigné"}</td>
              <td className="px-4 py-3">
                {company.global_score != null ? (
                  <span className="font-semibold text-[#00BFA6]">
                    {company.global_score}/100
                  </span>
                ) : (
                  <span className="text-muted-foreground">Non calculé</span>
                )}
              </td>
              <td className="px-4 py-3">{company.city ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
