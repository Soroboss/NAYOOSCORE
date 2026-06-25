import {
  BarChart3,
  FileCheck,
  LineChart,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Diagnostic intelligent",
    description:
      "Évaluez la maturité de votre entreprise en quelques minutes et identifiez vos priorités.",
  },
  {
    icon: Wallet,
    title: "Suivi financier",
    description:
      "Centralisez ventes, dépenses et trésorerie pour une vision claire de votre santé financière.",
  },
  {
    icon: LineChart,
    title: "Score de finançabilité",
    description:
      "Obtenez un score sur 100 points, mis à jour selon vos données réelles et vos documents.",
  },
  {
    icon: FileCheck,
    title: "Documents & conformité",
    description:
      "RCCM, pièces fiscales et justificatifs — tout au même endroit pour rassurer les financeurs.",
  },
  {
    icon: BarChart3,
    title: "Tableaux de bord",
    description:
      "KPIs en temps réel pour les PME et vues agrégées pour les institutions et programmes.",
  },
  {
    icon: Sparkles,
    title: "Recommandations IA",
    description:
      "Des conseils personnalisés pour améliorer votre score et votre préparation au financement.",
  },
];

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-[#F5F7FA] px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00BFA6]">
            Fonctionnalités
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#0B1D2A] md:text-4xl">
            Tout ce qu&apos;il faut pour inspirer confiance
          </h2>
          <p className="mt-4 text-muted-foreground">
            De la saisie quotidienne au dossier de financement, Nayooscore structure
            la donnée et la transforme en décisions éclairées.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[#0B1D2A]/8 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#00BFA6]/30 hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-[#00BFA6]/10 text-[#00BFA6] transition-colors group-hover:bg-[#00BFA6] group-hover:text-white">
                <feature.icon className="size-6" />
              </div>
              <h3 className="font-semibold text-[#0B1D2A]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
