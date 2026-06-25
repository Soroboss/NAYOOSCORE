"use client";

import { useActionState } from "react";
import { addTreasuryEntryAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: PmeActionState = { success: false };

export function TreasuryForm() {
  const [state, action, pending] = useActionState(addTreasuryEntryAction, initial);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Mouvement de trésorerie</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select id="type" name="type" className="flex h-10 w-full rounded-md border px-3 text-sm" required>
            <option value="inflow">Entrée</option>
            <option value="outflow">Sortie</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (FCFA)</Label>
          <Input id="amount" name="amount" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="entry_date">Date</Label>
          <Input id="entry_date" name="entry_date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" />
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
