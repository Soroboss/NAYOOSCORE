"use client";

import { useActionState } from "react";
import {
  updateProfileAction,
  type SettingsActionState,
} from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types/user";

const initial: SettingsActionState = { success: false };

export function ProfileSettingsForm({ user }: { user: User }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <div>
        <h2 className="font-semibold text-[#0B1D2A]">Mon profil</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nom affiché et coordonnées de contact.
        </p>
      </div>

      {state.message && (
        <p className="rounded-lg bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#0077B6]">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="full_name">Nom complet</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={user.full_name}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={user.phone ?? ""}
          placeholder="07 XX XX XX XX"
        />
      </div>
      <Button type="submit" disabled={pending} className="bg-[#0077B6] hover:bg-[#006299]">
        {pending ? "Enregistrement…" : "Enregistrer le profil"}
      </Button>
    </form>
  );
}
