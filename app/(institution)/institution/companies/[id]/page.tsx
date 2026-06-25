import Link from "next/link";
import { notFound } from "next/navigation";
import { requireInstitution } from "@/app/actions/institution";
import {
  getInstitutionCompanyDetail,
  getInstitutionPrograms,
} from "@/lib/institution-context";
import { AssignProgramForm } from "@/components/institution/assign-program-form";
import { canManageInstitutionPrograms } from "@/lib/permissions";

function formatFcfa(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

type Props = {
  params: { id: string };
};

export default async function InstitutionCompanyDetailPage({ params }: Props) {
  const { user, institution } = await requireInstitution();
  const detail = await getInstitutionCompanyDetail(institution.id, params.id);

  if (!detail) notFound();

  const programs = canManageInstitutionPrograms(user.role, institution.member_role)
    ? await getInstitutionPrograms(institution.id)
    : [];

  const { company, score, diagnostic, totalSales, totalExpenses, profit, fundingRequests } =
    detail;
  const responses = (diagnostic?.responses ?? {}) as Record<string, unknown>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link
          href="/institution/companies"
          className="text-sm text-[#0077B6] hover:underline"
        >
          ← Retour aux entreprises
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#0B1D2A]">{company.name}</h1>
        <p className="text-muted-foreground">
          {company.sector} · {company.city}, {company.country}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Score global</p>
          <p className="mt-2 text-2xl font-bold text-[#00BFA6]">
            {score?.global_score ?? "—"}
            {score ? "/100" : ""}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Chiffre d&apos;affaires</p>
          <p className="mt-2 text-xl font-bold">{formatFcfa(totalSales)}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Dépenses</p>
          <p className="mt-2 text-xl font-bold">{formatFcfa(totalExpenses)}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">Résultat</p>
          <p className="mt-2 text-xl font-bold">{formatFcfa(profit)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-[#0B1D2A]">Profil</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Dirigeant</dt>
              <dd>{company.owner_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Statut juridique</dt>
              <dd>{company.legal_status ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{company.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Téléphone</dt>
              <dd>{company.phone}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">RCCM</dt>
              <dd>{company.rccm ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Programme</dt>
              <dd>{company.program_name ?? "Non assigné"}</dd>
            </div>
          </dl>
          {programs.length > 0 && (
            <AssignProgramForm
              companyId={company.id}
              programs={programs}
              currentProgramId={company.program_id}
            />
          )}
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-[#0B1D2A]">Diagnostic</h2>
          {diagnostic ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Années d&apos;activité</dt>
                <dd>{String(responses.years_in_business ?? "—")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Employés</dt>
                <dd>{String(responses.employee_count ?? "—")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">CA mensuel estimé</dt>
                <dd>
                  {responses.monthly_revenue_estimate != null
                    ? formatFcfa(Number(responses.monthly_revenue_estimate))
                    : "—"}
                </dd>
              </div>
              <div className="mt-3">
                <p className="text-muted-foreground">Défi principal</p>
                <p className="mt-1">{String(responses.main_challenge ?? "—")}</p>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Diagnostic non complété.
            </p>
          )}
        </section>
      </div>

      {score && (
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-[#0B1D2A]">Détail du score</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {[
              { label: "Gestion", value: score.management_score },
              { label: "Financier", value: score.financial_score },
              { label: "Croissance", value: score.growth_score },
              { label: "Conformité", value: score.compliance_score },
              { label: "Gouvernance", value: score.governance_score },
            ].map((dim) => (
              <div key={dim.label} className="rounded-lg bg-[#F5F7FA] p-3 text-center">
                <p className="text-xs text-muted-foreground">{dim.label}</p>
                <p className="mt-1 text-lg font-bold">{dim.value}/20</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {fundingRequests.length > 0 && (
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-[#0B1D2A]">Demandes de financement</h2>
          <div className="mt-4 divide-y">
            {fundingRequests.map((req) => (
              <div key={req.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{formatFcfa(Number(req.amount_requested))}</p>
                  <p className="text-muted-foreground">{req.purpose ?? "—"}</p>
                </div>
                <span className="rounded-full bg-[#0077B6]/10 px-3 py-1 text-xs text-[#0077B6]">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
