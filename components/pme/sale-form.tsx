"use client";

import { useActionState } from "react";
import { addSaleAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: PmeActionState = { success: false };

export function SaleForm() {
  const [state, formAction, pending] = useActionState(addSaleAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvelle vente</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (FCFA)</Label>
          <Input id="amount" name="amount" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_name">Client</Label>
          <Input id="customer_name" name="customer_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale_date">Date</Label>
          <Input id="sale_date" name="sale_date" type="date" defaultValue={today} required />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Ajout..." : "Ajouter la vente"}
      </Button>
    </form>
  );
}
