"use client";

import { useActionState } from "react";
import { addFieldAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FIELD_STATUSES } from "@/lib/pme-catalog";

const initial: PmeActionState = { success: false };

type EmployeeOption = { id: string; full_name: string };

export function FieldActionForm({ employees }: { employees: EmployeeOption[] }) {
  const [state, action, pending] = useActionState(addFieldAction, initial);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvelle action terrain</h3>
      <p className="text-xs text-muted-foreground">
        Visites clients, livraisons, prospection, chantiers — coûts et ventes liés.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Intitulé</Label>
          <Input id="title" name="title" placeholder="Ex. Tournée Cocody, pose chantier…" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Lieu</Label>
          <Input id="location" name="location" placeholder="Ville, quartier, adresse" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee_id">Responsable terrain</Label>
          <select
            id="employee_id"
            name="employee_id"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">—</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
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
            {FIELD_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="action_date">Date</Label>
          <Input id="action_date" name="action_date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Fin (optionnel)</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="objective">Objectif</Label>
          <Input id="objective" name="objective" placeholder="Prospection, livraison, démo produit…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cost">Coût terrain (FCFA)</Label>
          <Input id="cost" name="cost" type="number" min={0} defaultValue={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="revenue_generated">Vente générée (FCFA)</Label>
          <Input id="revenue_generated" name="revenue_generated" type="number" min={0} defaultValue={0} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer l'action"}
      </Button>
    </form>
  );
}
