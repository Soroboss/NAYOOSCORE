"use client";

import { useActionState, useMemo, useState } from "react";
import {
  completeOnboardingAction,
  type CompanyActionState,
} from "@/app/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BUSINESS_TYPES,
  PME_MODULE_META,
  type BusinessTypeId,
} from "@/lib/business-modules";
import { cn } from "@/lib/utils";

const initialState: CompanyActionState = { success: false };

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState
  );
  const [businessType, setBusinessType] = useState<BusinessTypeId>("services");

  const previewModules = useMemo(() => {
    const config = BUSINESS_TYPES.find((t) => t.id === businessType);
    return (config?.modules ?? []).map((key) => PME_MODULE_META[key]?.title ?? key);
  }, [businessType]);

  return (
    <form action={formAction} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0B1D2A]">
            Type d&apos;activité
          </h2>
          <p className="text-sm text-muted-foreground">
            Les modules de votre espace seront adaptés à votre secteur.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setBusinessType(type.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                businessType === type.id
                  ? "border-[#00BFA6] bg-[#00BFA6]/5 ring-1 ring-[#00BFA6]"
                  : "border-border bg-white hover:border-[#0077B6]/40"
              )}
            >
              <p className="font-medium text-[#0B1D2A]">{type.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {type.description}
              </p>
            </button>
          ))}
        </div>

        <input type="hidden" name="business_type" value={businessType} />

        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm font-medium text-[#0B1D2A]">Modules activés</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {previewModules.map((label) => (
              <span
                key={label}
                className="rounded-full bg-[#0077B6]/10 px-3 py-1 text-xs text-[#0077B6]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-[#0B1D2A]">
          Profil entreprise
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nom de l&apos;entreprise</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Secteur</Label>
            <Input id="sector" name="sector" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_status">Statut juridique</Label>
            <Input id="legal_status" name="legal_status" placeholder="SARL, SA..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input id="country" name="country" defaultValue="Côte d'Ivoire" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" name="city" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_name">Dirigeant</Label>
            <Input id="owner_name" name="owner_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email entreprise</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rccm">RCCM (optionnel)</Label>
            <Input id="rccm" name="rccm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">N° fiscal (optionnel)</Label>
            <Input id="tax_id" name="tax_id" />
          </div>
        </div>
      </section>

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-[#00BFA6] text-white hover:bg-[#00a892]"
        disabled={pending}
      >
        {pending ? "Création..." : "Lancer mon espace PME"}
      </Button>
    </form>
  );
}
