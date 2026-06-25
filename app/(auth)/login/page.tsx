import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Accédez à votre espace Nayooscore
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Formulaire d&apos;authentification — étape 4
        </p>
        <Button asChild className="w-full">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
