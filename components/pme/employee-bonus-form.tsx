"use client";

import { useActionState } from "react";
import { addEmployeeBonusAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BONUS_TYPES } from "@/lib/pme-catalog";

const initial: PmeActionState = { success: false };

type EmployeeOption = { id: string; full_name: string };

export function EmployeeBonusForm({ employees }: { employees: EmployeeOption[] }) {
  const [state, action, pending] = useActionState(addEmployeeBonusAction, initial);
  const today = new Date().toISOString().slice(0, 10);

  if (employees.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-white p-4 text-sm text-muted-foreground">
        Ajoutez d&apos;abord un employé pour enregistrer une prime.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Prime / bonus salarié</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="employee_id">Employé</Label>
          <select
            id="employee_id"
            name="employee_id"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Sélectionner…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bonus_type">Type</Label>
          <select
            id="bonus_type"
            name="bonus_type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {BONUS_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (FCFA)</Label>
          <Input id="amount" name="amount" type="number" min={1} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bonus_date">Date</Label>
          <Input id="bonus_date" name="bonus_date" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Motif (optionnel)</Label>
          <Input id="description" name="description" placeholder="Fin d'année, objectif atteint…" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#0077B6] text-white hover:bg-[#00629a]" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer la prime"}
      </Button>
    </form>
  );
}
