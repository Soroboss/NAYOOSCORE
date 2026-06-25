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
import { signInWithGoogleAction } from "@/app/actions/oauth";

const registerFormSchema = z
  .object({
    full_name: z.string().min(2, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Mot de passe minimum 8 caractères"),
    confirm_password: z.string(),
    accept_terms: z.union([z.literal("on"), z.undefined()]),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  })
  .refine((data) => data.accept_terms === "on", {
    message: "Vous devez accepter les conditions.",
    path: ["accept_terms"],
  });

type RegisterFormInput = z.infer<typeof registerFormSchema>;

const initialState: AuthActionState = { success: false };

const passwordHints = ["8 caractères minimum", "Majuscule recommandée", "Chiffre recommandé"];

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
          <Label htmlFor="full_name" className="text-[#0B1D2A]">
            Nom complet du dirigeant
          </Label>
          <Input
            id="full_name"
            placeholder="Ex. Aminata Koné"
            className="border-[#0B1D2A]/15 bg-white"
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#0B1D2A]">
            Email professionnel
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@entreprise.com"
            className="border-[#0B1D2A]/15 bg-white"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0B1D2A]">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-[#0B1D2A]/15 bg-white"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-[#0B1D2A]">
              Confirmer
            </Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              className="border-[#0B1D2A]/15 bg-white"
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </div>

        <ul className="flex flex-wrap gap-2">
          {passwordHints.map((hint) => (
            <li
              key={hint}
              className="rounded-full bg-[#F5F7FA] px-3 py-1 text-xs text-muted-foreground"
            >
              {hint}
            </li>
          ))}
        </ul>

        <label className="flex items-start gap-3 rounded-lg border border-[#0B1D2A]/10 bg-[#F5F7FA] p-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-[#0B1D2A]/20 accent-[#00BFA6]"
            {...register("accept_terms")}
          />
          <span className="text-[#0B1D2A]/80">
            J&apos;accepte les conditions d&apos;utilisation et la politique de
            confidentialité de Nayooscore.
          </span>
        </label>
        {errors.accept_terms && (
          <p className="text-sm text-destructive">{errors.accept_terms.message}</p>
        )}

        {state.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        {state.message && (
          <p className="rounded-md border border-[#00BFA6]/30 bg-[#00BFA6]/10 px-3 py-2 text-sm text-[#00775a]">
            {state.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#00BFA6] text-base font-semibold text-white hover:bg-[#00a892]"
          disabled={pending}
        >
          {pending ? "Création du compte..." : "Créer mon compte gratuitement"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#0B1D2A]/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      <form action={signInWithGoogleAction}>
        <Button
          type="submit"
          variant="outline"
          className="w-full border-[#0B1D2A]/15 bg-white text-[#0B1D2A] hover:bg-[#F5F7FA]"
        >
          Continuer avec Google
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-[#0077B6] hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
