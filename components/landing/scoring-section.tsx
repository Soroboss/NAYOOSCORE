import { SCORE_THRESHOLDS, SCORE_WEIGHTS } from "@/lib/constants";

const dimensions = [
  { key: "management", label: "Gestion", weight: SCORE_WEIGHTS.management },
  { key: "financial", label: "Financier", weight: SCORE_WEIGHTS.financial },
  { key: "growth", label: "Croissance", weight: SCORE_WEIGHTS.growth },
  { key: "compliance", label: "Conformité", weight: SCORE_WEIGHTS.compliance },
  { key: "governance", label: "Gouvernance", weight: SCORE_WEIGHTS.governance },
] as const;

const thresholds = Object.values(SCORE_THRESHOLDS);

export function ScoringSection() {
  return (
    <section id="score" className="bg-[#0B1D2A] px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00BFA6]">
            Le score Nayooscore
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Un score transparent sur 100 points
          </h2>
          <p className="mt-4 text-white/70">
            Cinq dimensions pondérées pour mesurer la préparation d&apos;une PME
            à accéder au financement, avec des seuils clairs et actionnables.
          </p>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {dimensions.map((dim) => (
            <div
              key={dim.key}
              className="rounded-xl border border-white/10 bg-[#132B49]/60 p-5 text-center"
            >
              <p className="text-3xl font-bold text-[#00BFA6]">{dim.weight}%</p>
              <p className="mt-1 font-medium">{dim.label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[#132B49] text-left text-white/70">
              <tr>
                <th className="px-5 py-3 font-medium">Fourchette</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Signification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {thresholds.map((t) => (
                <tr key={t.label} className="bg-[#0B1D2A]/50">
                  <td className="px-5 py-4 font-mono text-[#00BFA6]">
                    {t.min} – {t.max}
                  </td>
                  <td className="px-5 py-4 font-semibold">{t.label}</td>
                  <td className="px-5 py-4 text-white/65">
                    {t.min >= 85
                      ? "Dossier solide, prêt pour un financement"
                      : t.min >= 75
                        ? "Bonne base, quelques points à renforcer"
                        : t.min >= 60
                          ? "Progression visible, accompagnement recommandé"
                          : t.min >= 40
                            ? "Structuration nécessaire avant financement"
                            : "Données insuffisantes ou maturité faible"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
