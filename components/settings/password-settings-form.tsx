"use client";

import { useActionState } from "react";
import {
  changePasswordWithCodeAction,
  requestPasswordResetCodeAction,
  type SettingsActionState,
} from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: SettingsActionState = { success: false };

export function PasswordSettingsForm() {
  const [requestState, requestAction, requesting] = useActionState(
    requestPasswordResetCodeAction,
    initial
  );
  const [changeState, changeAction, changing] = useActionState(
    changePasswordWithCodeAction,
    initial
  );

  const feedback = changeState.message || changeState.error || requestState.message || requestState.error;
  const feedbackOk = changeState.success || requestState.success;

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6">
      <div>
        <h2 className="font-semibold text-[#0B1D2A]">Mot de passe</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Recevez un code par email puis définissez un nouveau mot de passe.
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

      <form action={requestAction}>
        <Button type="submit" variant="outline" disabled={requesting}>
          {requesting ? "Envoi…" : "Recevoir un code par email"}
        </Button>
      </form>

      <form action={changeAction} className="space-y-4 border-t pt-6">
        <div className="space-y-2">
          <Label htmlFor="code">Code reçu</Label>
          <Input id="code" name="code" placeholder="123456" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new_password">Nouveau mot de passe</Label>
          <Input id="new_password" name="new_password" type="password" minLength={8} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmer</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            minLength={8}
            required
          />
        </div>
        <Button type="submit" disabled={changing} className="bg-[#0077B6] hover:bg-[#006299]">
          {changing ? "Mise à jour…" : "Changer le mot de passe"}
        </Button>
      </form>
    </div>
  );
}
