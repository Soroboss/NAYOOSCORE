import Link from "next/link";
import { ConfirmEmailForm } from "@/components/forms/confirm-email-form";

export default function ConfirmEmailPage() {
  return (
    <div className="space-y-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Confirmer votre email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Saisissez le code à 6 chiffres reçu lors de votre inscription
        </p>
      </div>
      <ConfirmEmailForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-[#0077B6] hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
