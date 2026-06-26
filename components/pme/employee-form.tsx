"use client";

import { useActionState } from "react";
import { addEmployeeAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: PmeActionState = { success: false };

export function EmployeeForm() {
  const [state, action, pending] = useActionState(addEmployeeAction, initial);
  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Nouvel employé</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input id="full_name" name="full_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Poste / fonction</Label>
          <Input id="role" name="role" placeholder="Commercial, comptable…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly_salary">Salaire mensuel (FCFA)</Label>
          <Input id="monthly_salary" name="monthly_salary" type="number" min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" placeholder="+225…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hire_date">Date d&apos;embauche</Label>
          <Input id="hire_date" name="hire_date" type="date" />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Ajout..." : "Ajouter l'employé"}
      </Button>
    </form>
  );
}
