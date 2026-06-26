import { InstitutionCreateForm } from "@/components/admin/institution-create-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminInstitutionsWithPlans } from "@/lib/admin-context";
import { formatXof } from "@/lib/format";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  ministry: "Ministère",
  ngo: "ONG",
  bank: "Banque",
  fund: "Fonds",
  incubator: "Incubateur",
  accelerator: "Accélérateur",
  private_company: "Entreprise privée",
};

export default async function AdminInstitutionsPage() {
  const institutions = await getAdminInstitutionsWithPlans();

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Institutions"
        description={`${institutions.length} partenaire(s) — banques, fonds, incubateurs et structures d'accompagnement.`}
      />

      <InstitutionCreateForm />

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F7FA] text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {institutions.map((inst) => (
              <tr key={inst.id}>
                <td className="px-4 py-3 font-medium">{inst.name}</td>
                <td className="px-4 py-3">{typeLabels[inst.type] ?? inst.type}</td>
                <td className="px-4 py-3">
                  {inst.city}, {inst.country}
                </td>
                <td className="px-4 py-3">
                  {inst.planName ? (
                    <span className="font-medium text-[#0077B6]">
                      {inst.planName}
                      {inst.monthlyAmount != null && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({formatXof(inst.monthlyAmount)}/mois)
                        </span>
                      )}
                    </span>
                  ) : (
                    <Link
                      href="/admin/subscriptions"
                      className="text-xs text-amber-600 hover:underline"
                    >
                      Attribuer un plan →
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#00BFA6]/10 px-2 py-1 text-xs text-[#00BFA6]">
                    {inst.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
