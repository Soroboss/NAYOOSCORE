import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>Créez votre compte Nayooscore</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Formulaire d&apos;inscription — étape 4
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Déjà un compte ? Se connecter</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
