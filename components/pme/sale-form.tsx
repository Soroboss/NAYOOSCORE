"use client";

import { useActionState } from "react";
import { addSaleAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHODS, SALE_TYPES } from "@/lib/pme-catalog";

const initialState: PmeActionState = { success: false };

export function SaleForm() {
  const [state, formAction, pending] = useActionState(addSaleAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvelle vente</h3>
      <p className="text-xs text-muted-foreground">
        Article physique, prestation, abonnement ou vente mixte.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sale_type">Type de vente</Label>
          <select
            id="sale_type"
            name="sale_type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            defaultValue="service"
          >
            {SALE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="item_name">Produit / Prestation</Label>
          <Input
            id="item_name"
            name="item_name"
            placeholder="Ex. Consultation, Sac de riz 25kg…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantité</Label>
          <Input id="quantity" name="quantity" type="number" min={0.01} step="0.01" defaultValue={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unité</Label>
          <Input id="unit" name="unit" placeholder="pièce, heure, kg…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant total (FCFA)</Label>
          <Input id="amount" name="amount" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_name">Client</Label>
          <Input id="customer_name" name="customer_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_method">Mode de paiement</Label>
          <select
            id="payment_method"
            name="payment_method"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sale_date">Date</Label>
          <Input id="sale_date" name="sale_date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-2 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Input id="notes" name="notes" placeholder="Détails, remise, livraison…" />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Ajout..." : "Enregistrer la vente"}
      </Button>
    </form>
  );
}
