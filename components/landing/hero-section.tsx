import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/lib/constants";

const highlights = [
  "Score de finançabilité sur 100 points",
  "Modules adaptés à votre activité",
  "Accompagnement institutionnel intégré",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1D2A] px-6 py-16 text-white md:py-24">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-[#00BFA6]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-[#0077B6]/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00BFA6]/30 bg-[#00BFA6]/10 px-4 py-1.5 text-sm text-[#00BFA6]">
            <span className="size-2 rounded-full bg-[#00BFA6] animate-pulse" />
            {APP_TAGLINE}
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-[3.25rem]">
              Le passeport numérique de{" "}
              <span className="text-[#00BFA6]">finançabilité</span> des PME
            </h1>
            <p className="max-w-xl text-lg text-white/75">{APP_DESCRIPTION}</p>
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                <CheckCircle2 className="size-5 shrink-0 text-[#00BFA6]" />
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#00BFA6] text-white hover:bg-[#00a892]"
            >
              <Link href="/signup">
                Créer mon compte
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/login">Connexion</Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {[
              { value: "100", label: "Points de score" },
              { value: "5", label: "Dimensions analysées" },
              { value: "12+", label: "Types d'activité" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-[#00BFA6]">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-[#00BFA6]/10">
            <Image
              src="/landing/landing-hero.png"
              alt="Entrepreneur consulte son score de finançabilité Nayooscore"
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-4 -left-4 rounded-xl border border-white/10 bg-[#132B49] px-5 py-4 shadow-xl md:-bottom-6 md:-left-6">
            <p className="text-xs text-white/60">Score moyen cohorte</p>
            <p className="text-3xl font-bold text-[#00BFA6]">78<span className="text-lg text-white/50">/100</span></p>
            <p className="text-xs text-[#0077B6]">En progression ↑</p>
          </div>
        </div>
      </div>
    </section>
  );
}
