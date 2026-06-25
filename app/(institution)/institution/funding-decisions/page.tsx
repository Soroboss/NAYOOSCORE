import Link from "next/link";
import { requireInstitution } from "@/app/actions/institution";
import { FundingDecisionForm } from "@/components/institution/funding-decision-form";
import { getInstitutionFundingRequests } from "@/lib/institution-context";

function formatFcfa(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

const statusColors: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-800",
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-600",
};

export default async function InstitutionFundingDecisionsPage() {
  const { institution } = await requireInstitution();
  const requests = await getInstitutionFundingRequests(institution.id);

  const pending = requests.filter((r) =>
    ["submitted", "pending", "under_review"].includes(r.status)
  );
  const processed = requests.filter(
    (r) => !["submitted", "pending", "under_review"].includes(r.status)
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Décisions de financement</h1>
        <p className="text-muted-foreground">
          Traiter les demandes des PME — {institution.name}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[#0B1D2A]">
          En attente ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
            Aucune demande en attente.
          </div>
        ) : (
          pending.map((request) => (
            <div key={request.id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/institution/companies/${request.company_id}`}
                    className="font-semibold text-[#0077B6] hover:underline"
                  >
                    {request.company_name}
                  </Link>
                  <p className="mt-1 text-lg font-bold text-[#0B1D2A]">
                    {formatFcfa(request.amount_requested)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.purpose ?? "Sans objet"}
                  </p>
                  {request.submitted_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Soumis le {new Date(request.submitted_at).toLocaleDateString("fr-FR")}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[request.status] ?? "bg-gray-100"}`}
                >
                  {request.status}
                </span>
              </div>
              <FundingDecisionForm request={request} />
            </div>
          ))
        )}
      </section>

      {processed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#0B1D2A]">
            Traitées ({processed.length})
          </h2>
          <div className="divide-y rounded-xl border bg-white">
            {processed.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{request.company_name}</p>
                  <p className="text-muted-foreground">
                    {formatFcfa(request.amount_requested)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${statusColors[request.status] ?? ""}`}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
