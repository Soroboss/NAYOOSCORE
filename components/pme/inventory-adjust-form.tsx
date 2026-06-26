"use client";

import { useActionState } from "react";
import { adjustInventoryAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: PmeActionState = { success: false };

type ItemOption = { id: string; name: string; quantity: number; unit: string | null };

export function InventoryAdjustForm({ items }: { items: ItemOption[] }) {
  const [state, action, pending] = useActionState(adjustInventoryAction, initial);

  if (items.length === 0) return null;

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Entrée / sortie de stock</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="item_id">Article</Label>
          <select
            id="item_id"
            name="item_id"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Sélectionner…</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} — {item.quantity}
                {item.unit ? ` ${item.unit}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="delta">Variation (+ / −)</Label>
          <Input
            id="delta"
            name="delta"
            type="number"
            step="0.01"
            placeholder="Ex. -5 ou +10"
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="reason">Motif (optionnel)</Label>
          <Input id="reason" name="reason" placeholder="Vente, casse, réception fournisseur…" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Mise à jour..." : "Mettre à jour le stock"}
      </Button>
    </form>
  );
}
