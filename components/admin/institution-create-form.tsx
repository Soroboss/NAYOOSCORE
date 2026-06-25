"use client";

import { useActionState } from "react";
import { createInstitutionAction, type AdminActionState } from "@/app/actions/admin";
import { INSTITUTION_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: AdminActionState = { success: false };

const typeLabels: Record<string, string> = {
  ministry: "Ministère",
  ngo: "ONG",
  bank: "Banque",
  fund: "Fonds",
  incubator: "Incubateur",
  accelerator: "Accélérateur",
  private_company: "Entreprise privée",
};

export function InstitutionCreateForm() {
  const [state, action, pending] = useActionState(createInstitutionAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvelle institution</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="flex h-10 w-full rounded-md border px-3 text-sm" required>
            {INSTITUTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {typeLabels[t] ?? t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
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
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Création..." : "Créer l'institution"}
      </Button>
    </form>
  );
}
