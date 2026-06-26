"use client";

import { useActionState } from "react";
import { addInventoryItemAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: PmeActionState = { success: false };

export function InventoryItemForm() {
  const [state, action, pending] = useActionState(addInventoryItemAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Ajouter un article</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Désignation</Label>
          <Input id="name" name="name" placeholder="Ex. Riz 25kg, T-shirt M…" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantité initiale</Label>
          <Input id="quantity" name="quantity" type="number" min={0} step="0.01" defaultValue={0} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unité</Label>
          <Input id="unit" name="unit" placeholder="pièce, kg, litre…" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Ajout..." : "Ajouter au stock"}
      </Button>
    </form>
  );
}
