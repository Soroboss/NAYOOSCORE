import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { APP_DESCRIPTION, APP_TAGLINE, CONTACT } from "@/lib/constants";
import { CheckCircle2, LineChart, Shield } from "lucide-react";

const highlights = [
  {
    icon: LineChart,
    title: "Score sur 100 points",
    description: "Mesurez votre finançabilité en temps réel.",
  },
  {
    icon: Shield,
    title: "Données sécurisées",
    description: "Hébergement chiffré et multi-tenant.",
  },
  {
    icon: CheckCircle2,
    title: "Modules adaptés",
    description: "Commerce, services, agriculture et plus.",
  },
];

export function AuthBrandingPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-[#0B1D2A] p-10 lg:flex">
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#00BFA6]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-[#0077B6]/15 blur-3xl" />

      <div className="relative">
        <BrandLogo size="lg" showTagline variant="light" className="items-start" />
      </div>

      <div className="relative space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#00BFA6]">
            {APP_TAGLINE}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
            Le passeport numérique de finançabilité des PME
          </h2>
          <p className="mt-4 text-white/70">{APP_DESCRIPTION}</p>
        </div>

        <ul className="space-y-4">
          {highlights.map((item) => (
            <li key={item.title} className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#00BFA6]">
                <item.icon className="size-5" />
              </div>
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-sm text-white/60">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/45">
        Besoin d&apos;aide ?{" "}
        <a href={CONTACT.phoneHref} className="text-[#00BFA6] hover:underline">
          {CONTACT.phone}
        </a>
      </p>
    </div>
  );
}

export function AuthMobileLogo() {
  return (
    <div className="mb-8 lg:hidden">
      <BrandLogo size="md" showTagline variant="light" />
    </div>
  );
}

export function AuthBackHome() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex text-sm text-muted-foreground transition-colors hover:text-[#0077B6]"
    >
      ← Retour à l&apos;accueil
    </Link>
  );
}
