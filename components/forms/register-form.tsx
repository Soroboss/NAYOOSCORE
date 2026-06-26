"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUpAction, type AuthActionState } from "@/app/actions/auth";
import {
  SignupEmailVerificationStep,
  type SignupPendingData,
} from "@/components/forms/signup-email-verification-step";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGoogleAction } from "@/app/actions/oauth";
import { INSTITUTION_TYPES } from "@/lib/constants";
import type { SignupCategory, SignupPlanId } from "@/lib/signup-flow";

const institutionTypeLabels: Record<string, string> = {
  ministry: "Ministère",
  ngo: "ONG",
  bank: "Banque",
  fund: "Fonds",
  incubator: "Incubateur",
  accelerator: "Accélérateur",
  private_company: "Entreprise privée",
};

function buildSchema(category: SignupCategory) {
  const base = z
    .object({
      full_name: z.string().min(2, "Nom requis"),
      email: z.string().email("Email invalide"),
      password: z.string().min(8, "Mot de passe minimum 8 caractères"),
      confirm_password: z.string(),
      accept_terms: z.union([z.literal("on"), z.undefined()]),
      institution_name: z.string().optional(),
      institution_type: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      phone: z.string().optional(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirm_password"],
    })
    .refine((data) => data.accept_terms === "on", {
      message: "Vous devez accepter les conditions.",
      path: ["accept_terms"],
    });

  if (category === "institution") {
    return base
      .refine((data) => (data.institution_name?.trim().length ?? 0) >= 2, {
        message: "Nom de l'institution requis",
        path: ["institution_name"],
      })
      .refine((data) => INSTITUTION_TYPES.includes(data.institution_type as never), {
        message: "Type d'institution requis",
        path: ["institution_type"],
      })
      .refine((data) => (data.country?.trim().length ?? 0) >= 2, {
        message: "Pays requis",
        path: ["country"],
      })
      .refine((data) => (data.city?.trim().length ?? 0) >= 2, {
        message: "Ville requise",
        path: ["city"],
      });
  }

  return base;
}

type RegisterFormProps = {
  category: SignupCategory;
  plan: SignupPlanId;
};

const initialState: AuthActionState = { success: false };
const passwordHints = ["8 caractères minimum", "Majuscule recommandée", "Chiffre recommandé"];

export function RegisterForm({ category, plan }: RegisterFormProps) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const [step, setStep] = useState<"register" | "verify">("register");
  const [pendingSignup, setPendingSignup] = useState<SignupPendingData | null>(null);
  const isInstitution = category === "institution";

  const schema = buildSchema(category);
  type RegisterFormInput = z.infer<typeof schema>;

  const {
    register,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!state.needsEmailVerification || !state.email) return;
    const values = getValues();
    setPendingSignup({
      email: state.email,
      full_name: values.full_name,
      institution_name: values.institution_name,
      institution_type: values.institution_type,
      country: values.country,
      city: values.city,
      phone: values.phone,
    });
    setStep("verify");
  }, [state.needsEmailVerification, state.email, getValues]);

  useEffect(() => {
    if (!state.redirectTo) return;
    window.location.assign(state.redirectTo);
  }, [state.redirectTo]);

  if (step === "verify" && pendingSignup) {
    return (
      <SignupEmailVerificationStep
        category={category}
        plan={plan}
        pending={pendingSignup}
        onBack={() => setStep("register")}
      />
    );
  }

  const submitLabel =
    category === "pme" && plan === "pme_free"
      ? "Créer mon compte gratuitement"
      : "Créer mon compte";

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="plan" value={plan} />

        {isInstitution && (
          <>
            <div className="space-y-2">
              <Label htmlFor="institution_name" className="text-[#0B1D2A]">
                Nom de l&apos;institution
              </Label>
              <Input
                id="institution_name"
                placeholder="Ex. Fonds d'Appui aux PME"
                className="border-[#0B1D2A]/15 bg-white"
                {...register("institution_name")}
              />
              {errors.institution_name && (
                <p className="text-sm text-destructive">
                  {errors.institution_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution_type" className="text-[#0B1D2A]">
                Type d&apos;institution
              </Label>
              <select
                id="institution_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...register("institution_type")}
              >
                <option value="">Sélectionner…</option>
                {INSTITUTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {institutionTypeLabels[type]}
                  </option>
                ))}
              </select>
              {errors.institution_type && (
                <p className="text-sm text-destructive">
                  {errors.institution_type.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[#0B1D2A]">
                  Ville
                </Label>
                <Input
                  id="city"
                  placeholder="Abidjan"
                  className="border-[#0B1D2A]/15 bg-white"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-[#0B1D2A]">
                  Pays
                </Label>
                <Input
                  id="country"
                  placeholder="Côte d'Ivoire"
                  className="border-[#0B1D2A]/15 bg-white"
                  {...register("country")}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-[#0B1D2A]">
            {isInstitution ? "Nom du responsable" : "Nom complet du dirigeant"}
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

        {isInstitution && (
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#0B1D2A]">
              Téléphone (optionnel)
            </Label>
            <Input
              id="phone"
              placeholder="+225 07 00 00 00 00"
              className="border-[#0B1D2A]/15 bg-white"
              {...register("phone")}
            />
          </div>
        )}

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
          {pending ? "Création du compte..." : submitLabel}
        </Button>
      </form>

      {category === "pme" && (
        <>
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
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-[#0077B6] hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
