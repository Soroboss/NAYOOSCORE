"use client";

import { useActionState } from "react";
import { uploadDocumentAction, type PmeActionState } from "@/app/actions/pme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: PmeActionState = { success: false };

export function DocumentUploadForm() {
  const [state, action, pending] = useActionState(uploadDocumentAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-[#0B1D2A]">Téléverser un document</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Nom du document</Label>
          <Input id="name" name="name" placeholder="RCCM, attestation fiscale..." required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Input id="category" name="category" placeholder="légal, fiscal, financier" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">Fichier</Label>
          <Input id="file" name="file" type="file" required />
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.message && <p className="text-sm text-[#00BFA6]">{state.message}</p>}
      <Button type="submit" className="bg-[#00BFA6] text-white hover:bg-[#00a892]" disabled={pending}>
        {pending ? "Upload..." : "Téléverser"}
      </Button>
    </form>
  );
}
