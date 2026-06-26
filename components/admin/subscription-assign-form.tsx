"use client";

import { useActionState } from "react";
import {
  assignSubscriptionAction,
  type AdminActionState,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INSTITUTION_PLANS } from "@/lib/pricing";

const initialState: AdminActionState = { success: false };

type SubscriptionAssignFormProps = {
  institutions: { id: string; name: string }[];
  canAssign?: boolean;
  restrictionMessage?: string | null;
};

export function SubscriptionAssignForm({
  institutions,
  canAssign = true,
  restrictionMessage,
}: SubscriptionAssignFormProps) {
  const [state, formAction, pending] = useActionState(
    assignSubscriptionAction,
    initialState
  );

  if (!canAssign) {
    return (
      <div className="rounded-xl border bg-white p-5 text-sm text-muted-foreground">
        <h3 className="font-semibold text-[#0B1D2A]">Attribuer un plan</h3>
        <p className="mt-2">{restrictionMessage ?? "Action non autorisée pour votre rôle."}</p>
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Toutes les institutions ont déjà un abonnement actif.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-5">
      <h3 className="font-semibold text-[#0B1D2A]">Attribuer un plan</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="institution_id">Institution</Label>
          <select
            id="institution_id"
            name="institution_id"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Sélectionner…</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan_name">Plan</Label>
          <select
            id="plan_name"
            name="plan_name"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {INSTITUTION_PLANS.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Montant mensuel (FCFA, optionnel)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min={0}
          placeholder="Laisser vide = tarif catalogue"
        />
      </div>
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="rounded-md bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#00775a]">
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        className="bg-[#00BFA6] text-white hover:bg-[#00a892]"
        disabled={pending}
      >
        {pending ? "Attribution…" : "Activer l'abonnement"}
      </Button>
    </form>
  );
}
