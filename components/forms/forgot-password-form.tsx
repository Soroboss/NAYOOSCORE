"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPasswordAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ForgotInput = z.infer<typeof forgotSchema>;

const initialState: AuthActionState = { success: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  const {
    register,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@entreprise.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {state.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        {state.message && (
          <p className="rounded-md bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#00BFA6]">
            {state.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#00BFA6] text-white hover:bg-[#00a892]"
          disabled={pending}
        >
          {pending ? "Envoi..." : "Envoyer le lien"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/70">
        <Link href="/login" className="font-medium text-[#00BFA6] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
