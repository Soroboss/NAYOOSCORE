import { SCORE_THRESHOLDS, SCORE_WEIGHTS } from "@/lib/constants";

export default function AdminScoringPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Configuration scoring</h1>
        <p className="text-muted-foreground">Modèle de score actuel de la plateforme.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-5">
        {Object.entries(SCORE_WEIGHTS).map(([key, weight]) => (
          <div key={key} className="rounded-xl border bg-white p-5 text-center">
            <p className="text-2xl font-bold text-[#00BFA6]">{weight}%</p>
            <p className="mt-1 capitalize text-sm text-muted-foreground">{key}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-[#0B1D2A]">Seuils de finançabilité</h2>
        <div className="mt-4 space-y-2">
          {Object.values(SCORE_THRESHOLDS).map((t) => (
            <div key={t.label} className="flex justify-between border-b py-2 text-sm last:border-0">
              <span className="font-mono text-[#0077B6]">{t.min}–{t.max}</span>
              <span className="font-medium">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
