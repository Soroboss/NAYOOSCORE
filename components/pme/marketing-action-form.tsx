"use client";

import { useActionState } from "react";
import { addMarketingAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTION_STATUSES, MARKETING_CHANNELS } from "@/lib/pme-catalog";

const initial: PmeActionState = { success: false };

export function MarketingActionForm() {
  const [state, action, pending] = useActionState(addMarketingAction, initial);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvelle action marketing</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Campagne / action</Label>
          <Input id="title" name="title" placeholder="Ex. Promo Facebook Ramadan" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="channel">Canal</Label>
          <select
            id="channel"
            name="channel"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            required
          >
            {MARKETING_CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            name="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {ACTION_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget_amount">Budget prévu (FCFA)</Label>
          <Input id="budget_amount" name="budget_amount" type="number" min={0} defaultValue={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="spent_amount">Dépensé (FCFA)</Label>
          <Input id="spent_amount" name="spent_amount" type="number" min={0} defaultValue={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Date début</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Date fin (optionnel)</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="target_audience">Cible</Label>
          <Input id="target_audience" name="target_audience" placeholder="Jeunes entrepreneurs, quartier…" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Résultats attendus, prestataire…" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
