import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE } from "@/lib/constants";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0077B6] to-[#00BFA6] px-6 py-20 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[url('/landing/landing-hero.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          {APP_TAGLINE}
        </p>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Prêt à faire progresser votre score ?
        </h2>
        <p className="mt-4 text-lg text-white/85">
          Rejoignez les PME qui structurent leur gestion et inspirent confiance
          aux financeurs.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-[#0B1D2A] hover:bg-white/90"
          >
            <Link href="/signup">
              Commencer maintenant
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/login">Connexion institution</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
