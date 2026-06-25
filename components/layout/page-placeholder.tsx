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
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0B1D2A]">
          {title}
        </h1>
        <Badge
          variant="secondary"
          className="bg-[#00BFA6]/10 text-[#00BFA6] hover:bg-[#00BFA6]/10"
        >
          {badge}
        </Badge>
      </div>
      <Card className="max-w-2xl border-[#0B1D2A]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#0B1D2A]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Ce module sera implémenté dans les prochaines étapes du MVP
            Nayooscore.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
