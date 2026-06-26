"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInAction, type AuthActionState } from "@/app/actions/auth";
import { signInWithGoogleAction } from "@/app/actions/oauth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations";

const initialState: AuthActionState = { success: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  const {
    register,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
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

        {state.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#00BFA6] text-white hover:bg-[#00a892]"
          disabled={pending}
        >
          {pending ? "Connexion..." : "Se connecter"}
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

      <div className="grid gap-2">
        <form action={signInWithGoogleAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full border-[#0B1D2A]/15 bg-white text-[#0B1D2A] hover:bg-[#F5F7FA]"
          >
            Continuer avec Google
          </Button>
        </form>
      </div>

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="font-medium text-[#0077B6] hover:underline">
          Mot de passe oublié ?
        </Link>
        <p>
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-[#0077B6] hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
