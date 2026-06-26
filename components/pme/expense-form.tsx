"use client";

import { useActionState } from "react";
import { addExpenseAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/pme-catalog";

const initialState: PmeActionState = { success: false };

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState(addExpenseAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvelle sortie d&apos;argent</h3>
      <p className="text-xs text-muted-foreground">
        Salaires, primes, marketing, terrain, achats et autres charges.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expense_type">Catégorie</Label>
          <select
            id="expense_type"
            name="expense_type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            required
            onChange={(e) => {
              const hidden = document.getElementById("category") as HTMLInputElement | null;
              const selected = EXPENSE_CATEGORIES.find((c) => c.id === e.target.value);
              if (hidden && selected) hidden.value = selected.label;
            }}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input type="hidden" id="category" name="category" defaultValue={EXPENSE_CATEGORIES[0].label} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (FCFA)</Label>
          <Input id="amount" name="amount" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense_date">Date</Label>
          <Input id="expense_date" name="expense_date" type="date" defaultValue={today} required />
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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Détail de la dépense" required />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Ajout..." : "Enregistrer la dépense"}
      </Button>
    </form>
  );
}
