import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PagePlaceholderProps = {
  title: string;
  description?: string;
  badge?: string;
};

export function PagePlaceholder({
  title,
  description = "Module en cours de développement.",
  badge = "Bientôt disponible",
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Badge variant="secondary">{badge}</Badge>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cette page sera implémentée dans les prochaines étapes du MVP
            Nayooscore.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
