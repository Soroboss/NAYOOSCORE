"use client";

import { useActionState } from "react";
import {
  decideFundingAction,
  type InstitutionActionState,
} from "@/app/actions/institution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FundingRequestRow } from "@/lib/institution-context";

const initialState: InstitutionActionState = { success: false };

type Props = {
  request: FundingRequestRow;
};

function formatFcfa(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FundingDecisionForm({ request }: Props) {
  const [state, formAction, pending] = useActionState(
    decideFundingAction,
    initialState
  );

  const isPending = ["submitted", "pending", "under_review"].includes(
    request.status
  );

  if (!isPending) return null;

  return (
    <form
      action={formAction}
      className="mt-4 space-y-3 rounded-lg border bg-[#F5F7FA] p-4"
    >
      <input type="hidden" name="funding_request_id" value={request.id} />
      <p className="text-sm font-medium text-[#0B1D2A]">
        Décision — {formatFcfa(request.amount_requested)}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`decision-${request.id}`}>Décision</Label>
          <select
            id={`decision-${request.id}`}
            name="decision"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="approved"
          >
            <option value="approved">Approuver</option>
            <option value="rejected">Rejeter</option>
            <option value="observe">Observer</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`amount-${request.id}`}>Montant approuvé (FCFA)</Label>
          <Input
            id={`amount-${request.id}`}
            name="amount_approved"
            type="number"
            defaultValue={request.amount_requested}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`reason-${request.id}`}>Motif</Label>
        <Input
          id={`reason-${request.id}`}
          name="reason"
          placeholder="Justification de la décision"
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button
        type="submit"
        className="bg-[#0077B6] text-white hover:bg-[#00629a]"
        disabled={pending}
      >
        {pending ? "Enregistrement..." : "Enregistrer la décision"}
      </Button>
    </form>
  );
}
