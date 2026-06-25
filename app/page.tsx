import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

const spaces = [
  {
    title: "Espace Admin SaaS",
    description: "Gestion plateforme, institutions, abonnements et audit.",
    href: "/admin/dashboard",
  },
  {
    title: "Espace Institution",
    description: "Programmes, cohortes, suivi PME et décisions de financement.",
    href: "/institution/dashboard",
  },
  {
    title: "Espace PME",
    description: "Profil, données financières, score et demande de financement.",
    href: "/pme/dashboard",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium opacity-90">Score de Finançabilité PME</p>
            <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-success text-white hover:bg-success/90"
            >
              <Link href="/register">Inscription</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-12">
        <section className="max-w-3xl space-y-4">
          <Badge variant="secondary">Étape 1 — Initialisation</Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Plateforme multi-tenant de suivi et scoring des PME
          </h2>
          <p className="text-lg text-muted-foreground">{APP_DESCRIPTION}</p>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {spaces.map((space) => (
            <Card key={space.href} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{space.title}</CardTitle>
                <CardDescription>{space.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <Link href={space.href}>Accéder</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-xl border bg-muted/30 p-6">
          <h3 className="mb-2 font-semibold">Prochaines étapes</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Étape 2 — Configuration Git et README</li>
            <li>Étape 3 — InsForge (base de données, auth, storage)</li>
            <li>Étape 4 — Authentification et redirection par rôle</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
