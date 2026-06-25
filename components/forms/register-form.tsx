"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUpAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerFormSchema = z
  .object({
    full_name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Mot de passe minimum 8 caractères"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

const initialState: AuthActionState = { success: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  const {
    register,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
  });

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet</Label>
          <Input
            id="full_name"
            placeholder="Prénom Nom"
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
          <Input
            id="confirm_password"
            type="password"
            placeholder="••••••••"
            {...register("confirm_password")}
          />
          {errors.confirm_password && (
            <p className="text-sm text-destructive">
              {errors.confirm_password.message}
            </p>
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
          {pending ? "Création..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/70">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-[#00BFA6] hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
