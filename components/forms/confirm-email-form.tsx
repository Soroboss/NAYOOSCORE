"use client";

import { useActionState } from "react";
import {
  resendSignupVerificationAction,
  verifyEmailCodeAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { success: false };

export function ConfirmEmailForm() {
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyEmailCodeAction,
    initialState
  );
  const [resendState, resendAction, resending] = useActionState(
    resendSignupVerificationAction,
    initialState
  );

  const feedback =
    verifyState.error ||
    verifyState.message ||
    resendState.error ||
    resendState.message;

  return (
    <div className="space-y-4">
      {feedback && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            verifyState.success || resendState.success
              ? "bg-[#00BFA6]/10 text-[#0077B6]"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback}
        </p>
      )}

      <form action={verifyAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Code à 6 chiffres</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            placeholder="123456"
            maxLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={verifying}>
          {verifying ? "Vérification…" : "Valider et se connecter"}
        </Button>
      </form>

      <form action={resendAction} className="flex gap-2">
        <Input name="email" type="email" placeholder="Votre email" className="flex-1" required />
        <Button type="submit" variant="outline" disabled={resending}>
          {resending ? "…" : "Renvoyer"}
        </Button>
      </form>
    </div>
  );
}
