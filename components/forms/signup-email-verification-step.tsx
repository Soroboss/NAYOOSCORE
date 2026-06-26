"use client";

import { useActionState } from "react";
import {
  resendSignupVerificationAction,
  verifySignupEmailAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SignupCategory, SignupPlanId } from "@/lib/signup-flow";

const initialState: AuthActionState = { success: false };

export type SignupPendingData = {
  email: string;
  full_name: string;
  institution_name?: string;
  institution_type?: string;
  country?: string;
  city?: string;
  phone?: string;
};

type SignupEmailVerificationStepProps = {
  category: SignupCategory;
  plan: SignupPlanId;
  pending: SignupPendingData;
  onBack?: () => void;
};

export function SignupEmailVerificationStep({
  category,
  plan,
  pending,
  onBack,
}: SignupEmailVerificationStepProps) {
  const [verifyState, verifyAction, verifying] = useActionState(
    verifySignupEmailAction,
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
  const feedbackOk = verifyState.success || resendState.success;

  return (
    <div className="space-y-6 rounded-xl border border-[#00BFA6]/25 bg-[#00BFA6]/5 p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0B1D2A]">
          Vérifiez votre email
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Un <strong>code à 6 chiffres</strong> a été envoyé à{" "}
          <strong className="text-[#0B1D2A]">{pending.email}</strong>. Saisissez-le
          ci-dessous pour activer votre compte et accéder à votre espace.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Votre mot de passe a déjà été enregistré à l&apos;étape précédente.
        </p>
      </div>

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
        <input type="hidden" name="email" value={pending.email} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="plan" value={plan} />
        <input type="hidden" name="full_name" value={pending.full_name} />
        {category === "institution" ? (
          <>
            <input type="hidden" name="institution_name" value={pending.institution_name ?? ""} />
            <input type="hidden" name="institution_type" value={pending.institution_type ?? ""} />
            <input type="hidden" name="country" value={pending.country ?? ""} />
            <input type="hidden" name="city" value={pending.city ?? ""} />
            <input type="hidden" name="phone" value={pending.phone ?? ""} />
          </>
        ) : (
          pending.phone && <input type="hidden" name="phone" value={pending.phone} />
        )}

        <div className="space-y-2">
          <Label htmlFor="code">Code de vérification</Label>
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

        <Button
          type="submit"
          className="w-full bg-[#00BFA6] text-white hover:bg-[#00a892]"
          disabled={verifying}
        >
          {verifying ? "Vérification…" : "Activer mon compte"}
        </Button>
      </form>

      <form action={resendAction} className="flex flex-wrap gap-3">
        <input type="hidden" name="email" value={pending.email} />
        <Button type="submit" variant="outline" disabled={resending}>
          {resending ? "Envoi…" : "Renvoyer le code"}
        </Button>
        {onBack && (
          <Button type="button" variant="ghost" onClick={onBack}>
            Modifier mes informations
          </Button>
        )}
      </form>
    </div>
  );
}
