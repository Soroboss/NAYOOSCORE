"use client";

import { useActionState } from "react";
import {
  updateCompanyProfileAction,
  type CompanyActionState,
} from "@/app/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Company } from "@/types/company";

const initialState: CompanyActionState = { success: false };

type Props = { company: Company };

export function CompanyProfileForm({ company }: Props) {
  const [state, formAction, pending] = useActionState(
    updateCompanyProfileAction,
    initialState
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" defaultValue={company.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sector">Secteur</Label>
          <Input id="sector" name="sector" defaultValue={company.sector ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="legal_status">Statut juridique</Label>
          <Input id="legal_status" name="legal_status" defaultValue={company.legal_status ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input id="country" name="country" defaultValue={company.country ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={company.city ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="owner_name">Dirigeant</Label>
          <Input id="owner_name" name="owner_name" defaultValue={company.owner_name ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" defaultValue={company.phone ?? ""} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={company.email ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rccm">RCCM</Label>
          <Input id="rccm" name="rccm" defaultValue={company.rccm ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax_id">N° fiscal</Label>
          <Input id="tax_id" name="tax_id" defaultValue={company.tax_id ?? ""} />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.message && (
        <p className="text-sm text-[#00BFA6]">{state.message}</p>
      )}

      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
