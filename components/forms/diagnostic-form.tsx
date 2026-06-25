"use client";

import { useActionState } from "react";
import {
  saveDiagnosticAction,
  type CompanyActionState,
} from "@/app/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CompanyActionState = { success: false };

type DiagnosticResponses = {
  years_in_business?: number;
  employee_count?: number;
  monthly_revenue_estimate?: number;
  has_accounting?: boolean;
  has_bank_account?: boolean;
  main_challenge?: string;
};

type Props = { initial?: DiagnosticResponses };

export function DiagnosticForm({ initial }: Props) {
  const [state, formAction, pending] = useActionState(
    saveDiagnosticAction,
    initialState
  );

  return (
    <form action={formAction} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="years_in_business">Années d&apos;activité</Label>
          <Input
            id="years_in_business"
            name="years_in_business"
            type="number"
            min={0}
            defaultValue={initial?.years_in_business ?? 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee_count">Nombre d&apos;employés</Label>
          <Input
            id="employee_count"
            name="employee_count"
            type="number"
            min={0}
            defaultValue={initial?.employee_count ?? 0}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="monthly_revenue_estimate">CA mensuel estimé (FCFA)</Label>
          <Input
            id="monthly_revenue_estimate"
            name="monthly_revenue_estimate"
            type="number"
            min={0}
            defaultValue={initial?.monthly_revenue_estimate ?? 0}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="has_accounting">Tenue comptable</Label>
          <select
            id="has_accounting"
            name="has_accounting"
            defaultValue={initial?.has_accounting ? "yes" : "no"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="has_bank_account">Compte bancaire pro</Label>
          <select
            id="has_bank_account"
            name="has_bank_account"
            defaultValue={initial?.has_bank_account ? "yes" : "no"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="main_challenge">Principal défi actuel</Label>
          <textarea
            id="main_challenge"
            name="main_challenge"
            rows={4}
            defaultValue={initial?.main_challenge ?? ""}
            required
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}

      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer le diagnostic"}
      </Button>
    </form>
  );
}
