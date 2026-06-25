import { requirePmeCompany } from "@/app/actions/company";
import { DocumentUploadForm } from "@/components/pme/document-upload-form";
import { getAuthedServerClient } from "@/lib/insforge-server";

export default async function PmeDocumentsPage() {
  const { company } = await requirePmeCompany();
  const client = await getAuthedServerClient();
  const { data: documents } = await client.database
    .from("documents")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Documents</h1>
        <p className="text-muted-foreground">
          RCCM, pièces fiscales et justificatifs — stockage sécurisé InsForge.
        </p>
      </div>
      <DocumentUploadForm />
      <div className="rounded-xl border bg-white">
        <div className="border-b px-4 py-3 font-medium">Documents ({documents?.length ?? 0})</div>
        <div className="divide-y">
          {(documents ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Aucun document.</p>
          ) : (
            (documents ?? []).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-muted-foreground">{doc.category ?? "—"}</p>
                </div>
                {doc.storage_url ? (
                  <a
                    href={doc.storage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077B6] hover:underline"
                  >
                    Voir
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">{doc.storage_key}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
