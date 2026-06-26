"use client";

import { useActionState } from "react";
import {
  upsertPricingPlanAction,
  type PricingActionState,
} from "@/app/actions/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PricingPlanAdminRow } from "@/lib/pricing-store";

const initial: PricingActionState = { success: false };

type PlanUpsertFormProps = {
  plan?: PricingPlanAdminRow;
};

export function PlanUpsertForm({ plan }: PlanUpsertFormProps) {
  const [state, action, pending] = useActionState(upsertPricingPlanAction, initial);
  const features = Array.isArray(plan?.features)
    ? (plan.features as string[]).join("\n")
    : "";

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <div>
        <h2 className="font-semibold text-[#0B1D2A]">
          {plan ? `Modifier : ${plan.name}` : "Créer une offre / plan"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Une ligne par fonctionnalité dans la liste.
        </p>
      </div>

      {state.message && (
        <p className="rounded-lg bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#0077B6]">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="id">Identifiant</Label>
          <Input
            id="id"
            name="id"
            defaultValue={plan?.id}
            placeholder="pro"
            required
            disabled={!!plan}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <select
            id="category"
            name="category"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue={plan?.category ?? "institution"}
          >
            <option value="institution">Institution</option>
            <option value="pme">PME</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" defaultValue={plan?.name} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" defaultValue={plan?.description} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly_price">Prix mensuel (FCFA)</Label>
          <Input
            id="monthly_price"
            name="monthly_price"
            type="number"
            defaultValue={plan?.monthly_price ?? 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearly_price">Prix annuel (FCFA)</Label>
          <Input
            id="yearly_price"
            name="yearly_price"
            type="number"
            defaultValue={plan?.yearly_price ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_pme">Max PME</Label>
          <Input id="max_pme" name="max_pme" type="number" defaultValue={plan?.max_pme ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_programs">Max programmes</Label>
          <Input
            id="max_programs"
            name="max_programs"
            type="number"
            defaultValue={plan?.max_programs ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_users">Max utilisateurs</Label>
          <Input id="max_users" name="max_users" type="number" defaultValue={plan?.max_users ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort_order">Ordre</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={plan?.sort_order ?? 0} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="for_whom">Pour qui (PME)</Label>
          <Input id="for_whom" name="for_whom" defaultValue={plan?.for_whom ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="features">Fonctionnalités</Label>
          <textarea
            id="features"
            name="features"
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue={features}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="highlighted" defaultChecked={plan?.highlighted} />
          Mettre en avant
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={plan?.active ?? true} />
          Actif
        </label>
      </div>

      <Button type="submit" disabled={pending} className="bg-[#0077B6] hover:bg-[#006299]">
        {pending ? "Enregistrement…" : plan ? "Mettre à jour le plan" : "Créer le plan"}
      </Button>
    </form>
  );
}
