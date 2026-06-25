import { redirect } from "next/navigation";
import { getCurrentUser, getPmeRedirectPath, getRedirectPathForRole } from "@/lib/auth";
import type { UserRole } from "@/lib/constants";
import { RegisterForm } from "@/components/forms/register-form";
import { APP_TAGLINE } from "@/lib/constants";
import { Briefcase, LineChart, Sparkles } from "lucide-react";

const steps = [
  { label: "Compte", active: true },
  { label: "Entreprise", active: false },
  { label: "Score", active: false },
];

const perks = [
  { icon: Briefcase, text: "Espace PME personnalisé selon votre activité" },
  { icon: LineChart, text: "Suivi CA, dépenses et trésorerie" },
  { icon: Sparkles, text: "Recommandations pour améliorer votre score" },
];

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    const path =
      user.role === "PME_OWNER" || user.role === "PME_STAFF" || user.role === "VIEWER"
        ? await getPmeRedirectPath(user.id)
        : getRedirectPathForRole(user.role as UserRole);
    redirect(path);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                step.active
                  ? "bg-[#00BFA6] text-white"
                  : "bg-[#F5F7FA] text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                step.active ? "font-medium text-[#0B1D2A]" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-border sm:block" />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#00BFA6]">
          {APP_TAGLINE}
        </p>
        <h1 className="text-2xl font-bold text-[#0B1D2A] sm:text-3xl">
          Créez votre compte entrepreneur
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Inscription gratuite pour les PME. Après validation de votre email, vous
          configurerez votre entreprise et activerez les modules adaptés à votre
          secteur.
        </p>
      </div>

      <ul className="grid gap-3 rounded-xl border border-[#00BFA6]/20 bg-[#00BFA6]/5 p-4 sm:grid-cols-1">
        {perks.map((perk) => (
          <li key={perk.text} className="flex items-start gap-3 text-sm text-[#0B1D2A]/85">
            <perk.icon className="mt-0.5 size-4 shrink-0 text-[#00BFA6]" />
            {perk.text}
          </li>
        ))}
      </ul>

      <RegisterForm />
    </div>
  );
}
