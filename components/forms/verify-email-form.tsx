"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  checkVerificationAction,
  resendVerificationAction,
  signOutAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = { success: false };

export function VerifyEmailForm() {
  const [state, resendAction, pending] = useActionState(
    resendVerificationAction,
    initialState
  );
  const [checkState, , checking] = useActionState(
    checkVerificationAction,
    initialState
  );
  const [, startTransition] = useTransition();
  const router = useRouter();

  const feedback =
    checkState.message ||
    checkState.error ||
    state.message ||
    state.error;
  const feedbackOk = checkState.success || state.success;

  function handleCheck() {
    startTransition(async () => {
      const result = await checkVerificationAction(initialState);
      if (result.success) {
        router.refresh();
        router.push("/pme/dashboard");
      }
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Un email de confirmation vous a été envoyé. Cliquez sur le lien pour
        activer votre compte, puis vérifiez ci-dessous.
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={resendAction}>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Envoi…" : "Renvoyer l'email"}
          </Button>
        </form>
        <Button type="button" onClick={handleCheck} disabled={checking}>
          {checking ? "Vérification…" : "J'ai vérifié mon email"}
        </Button>
      </div>

      <form action={signOutAction}>
        <Button type="submit" variant="ghost" className="text-muted-foreground">
          Se déconnecter
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-[#0077B6] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
