import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Créez votre profil",
    description:
      "Inscrivez-vous, choisissez votre type d'activité et activez les modules adaptés à votre métier.",
  },
  {
    number: "02",
    title: "Alimentez vos données",
    description:
      "Saisissez ventes, dépenses, diagnostic et documents. Plus vos données sont complètes, plus le score est fiable.",
  },
  {
    number: "03",
    title: "Obtenez votre score",
    description:
      "Recevez un score sur 100, des recommandations et présentez votre dossier aux institutions partenaires.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0077B6]">
            Comment ça marche
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#0B1D2A] md:text-4xl">
            De l&apos;inscription au financement en 3 étapes
          </h2>
        </div>

        <div className="mb-14 overflow-hidden rounded-2xl border border-[#0B1D2A]/10 shadow-lg">
          <Image
            src="/landing/landing-process.png"
            alt="Parcours Nayooscore en trois étapes"
            width={1400}
            height={467}
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <span className="text-5xl font-bold text-[#00BFA6]/20">{step.number}</span>
              <h3 className="mt-2 text-xl font-semibold text-[#0B1D2A]">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
