"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  resendVerificationAction,
  verifyEmailCodeAction,
  signOutAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { success: false };

type VerifyEmailFormProps = {
  email: string;
};

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const [verifyState, verifyAction, verifying] = useActionState(
    verifyEmailCodeAction,
    initialState
  );
  const [resendState, resendAction, resending] = useActionState(
    resendVerificationAction,
    initialState
  );

  const feedback =
    verifyState.error ||
    verifyState.message ||
    resendState.error ||
    resendState.message;
  const feedbackOk = verifyState.success || resendState.success;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Un <strong>code à 6 chiffres</strong> a été envoyé à{" "}
        <strong className="text-[#0B1D2A]">{email}</strong>. Saisissez-le pour
        confirmer votre adresse et accéder à l&apos;application.
      </p>

      {feedback && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            feedbackOk
              ? "bg-[#00BFA6]/10 text-[#0077B6]"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {feedback}
        </p>
      )}

      <form action={verifyAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <Label htmlFor="code">Code reçu par email</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={8}
            className="text-center text-lg tracking-[0.3em]"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={verifying}>
          {verifying ? "Vérification…" : "Valider le code"}
        </Button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={resendAction}>
          <Button type="submit" variant="outline" disabled={resending}>
            {resending ? "Envoi…" : "Renvoyer le code"}
          </Button>
        </form>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="text-muted-foreground">
            Se déconnecter
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-[#0077B6] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
