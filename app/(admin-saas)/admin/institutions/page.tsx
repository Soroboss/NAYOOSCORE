import { InstitutionCreateForm } from "@/components/admin/institution-create-form";
import { getAdminInstitutions } from "@/lib/admin-context";

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
  const institutions = await getAdminInstitutions();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Institutions</h1>
        <p className="text-muted-foreground">{institutions.length} institution(s) enregistrée(s).</p>
      </div>
      <InstitutionCreateForm />
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F7FA] text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {institutions.map((inst) => (
              <tr key={inst.id}>
                <td className="px-4 py-3 font-medium">{inst.name}</td>
                <td className="px-4 py-3">{typeLabels[inst.type] ?? inst.type}</td>
                <td className="px-4 py-3">{inst.city}, {inst.country}</td>
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
