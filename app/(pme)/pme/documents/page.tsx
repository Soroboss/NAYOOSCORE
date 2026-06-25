import { requirePmeCompany } from "@/app/actions/company";

export default async function PmeDocumentsPage() {
  await requirePmeCompany();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Documents</h1>
        <p className="text-muted-foreground">
          RCCM, pièces fiscales et justificatifs (upload InsForge Storage — prochaine étape).
        </p>
      </div>
      <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-muted-foreground">
        Zone d&apos;upload à venir — bucket <code>pme-documents</code>
      </div>
    </div>
  );
}
