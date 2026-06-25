import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const audiences = [
  {
    id: "pme",
    title: "Pour les PME",
    subtitle: "Entrepreneurs & dirigeants",
    description:
      "Structurez votre gestion, suivez votre performance et préparez-vous à lever des fonds avec un score objectif et transparent.",
    bullets: [
      "Modules selon votre secteur (commerce, services, agriculture…)",
      "Dashboard CA, dépenses et score en temps réel",
      "Demande de financement en un clic",
    ],
    image: "/landing/landing-pme.png",
    imageAlt: "PME gérant ses finances sur Nayooscore",
    cta: "Créer mon compte",
    href: "/register",
    accent: "#00BFA6",
  },
  {
    id: "institution",
    title: "Pour les institutions",
    subtitle: "Banques, fonds, incubateurs, ONG",
    description:
      "Pilotez vos programmes, analysez les scores de vos cohortes et prenez des décisions de financement basées sur des données fiables.",
    bullets: [
      "Vue portefeuille PME et classement par score",
      "Gestion programmes & cohortes",
      "Workflow de décision financement",
    ],
    image: "/landing/landing-institution.png",
    imageAlt: "Institution analysant le portefeuille PME",
    cta: "Accéder à l'espace institution",
    href: "/login",
    accent: "#0077B6",
  },
];

export function AudiencesSection() {
  return (
    <section id="pour-qui" className="bg-[#F5F7FA] px-6 py-20">
      <div className="mx-auto max-w-6xl space-y-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00BFA6]">
            Pour qui
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#0B1D2A] md:text-4xl">
            Une plateforme, deux espaces complémentaires
          </h2>
        </div>

        {audiences.map((audience, index) => (
          <div
            key={audience.id}
            className={`grid items-center gap-10 lg:grid-cols-2 ${
              index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-[#0B1D2A]/10 shadow-lg">
              <Image
                src={audience.image}
                alt={audience.imageAlt}
                width={800}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="space-y-6">
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: audience.accent }}
                >
                  {audience.subtitle}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-[#0B1D2A] md:text-3xl">
                  {audience.title}
                </h3>
                <p className="mt-4 text-muted-foreground">{audience.description}</p>
              </div>

              <ul className="space-y-3">
                {audience.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 text-sm text-[#0B1D2A]/80"
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: audience.accent }}
                    />
                    {bullet}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={
                  audience.id === "pme"
                    ? "bg-[#00BFA6] text-white hover:bg-[#00a892]"
                    : "bg-[#0077B6] text-white hover:bg-[#00629a]"
                }
              >
                <Link href={audience.href}>
                  {audience.cta}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
