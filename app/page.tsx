import Link from "next/link";
import {
  Building2,
  Briefcase,
  LineChart,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/layout/brand-logo";
import { SiteFooter } from "@/components/layout/site-footer";
import { APP_DESCRIPTION, APP_TAGLINE } from "@/lib/constants";

const values = [
  {
    title: "Confiance",
    description: "Des données traçables et un scoring transparent.",
    icon: Shield,
  },
  {
    title: "Progression",
    description: "Suivez la maturité financière de chaque PME.",
    icon: TrendingUp,
  },
  {
    title: "Impact",
    description: "Mesurez emplois, CA et finançabilité.",
    icon: LineChart,
  },
  {
    title: "Africain",
    description: "Conçu pour les institutions et PME du continent.",
    icon: Building2,
  },
];

const spaces = [
  {
    title: "Institutions",
    description: "Programmes, cohortes, scoring et décisions de financement.",
    href: "/login",
    icon: Building2,
  },
  {
    title: "Entreprises",
    description: "Profil, ventes, dépenses, documents et score de finançabilité.",
    href: "/register",
    icon: Briefcase,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F5F7FA]">
      <header className="border-b border-[#0B1D2A]/10 bg-[#0B1D2A] text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <BrandLogo size="sm" variant="light" />
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/login">Connexion</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#00BFA6] text-white hover:bg-[#00a892]"
            >
              <Link href="/register">Inscription PME</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-[#0B1D2A] px-6 py-16 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#00BFA6]">
                {APP_TAGLINE}
              </p>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Le passeport numérique de finançabilité des PME
              </h1>
              <p className="text-lg text-white/75">{APP_DESCRIPTION}</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#00BFA6] text-white hover:bg-[#00a892]"
                >
                  <Link href="/register">Commencer gratuitement</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <Link href="/login">Espace institution</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <BrandLogo size="lg" showTagline variant="light" />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 py-14 md:grid-cols-2">
          {spaces.map((space) => (
            <Card
              key={space.title}
              className="border-[#0B1D2A]/10 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-[#00BFA6]/10 text-[#00BFA6]">
                  <space.icon className="size-5" />
                </div>
                <CardTitle className="text-[#0B1D2A]">{space.title}</CardTitle>
                <CardDescription>{space.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full bg-[#0B1D2A] text-white hover:bg-[#132B49]"
                >
                  <Link href={space.href}>Accéder</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="border-y border-[#0B1D2A]/10 bg-white px-6 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center text-2xl font-semibold text-[#0B1D2A]">
              Nos valeurs
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#F5F7FA] text-[#0077B6]">
                    <value.icon className="size-6" />
                  </div>
                  <h3 className="font-semibold text-[#0B1D2A]">{value.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
