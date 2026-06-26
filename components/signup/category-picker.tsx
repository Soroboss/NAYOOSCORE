import Link from "next/link";
import { signupPlansPath, type SignupCategory } from "@/lib/signup-flow";
import { Building2, Briefcase, ArrowRight } from "lucide-react";

const icons: Record<SignupCategory, typeof Briefcase> = {
  pme: Briefcase,
  institution: Building2,
};

type CategoryPickerProps = {
  categories: {
    id: SignupCategory;
    title: string;
    subtitle: string;
    description: string;
  }[];
};

export function CategoryPicker({ categories }: CategoryPickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {categories.map((cat) => {
        const Icon = icons[cat.id];
        const accent = cat.id === "pme" ? "#00BFA6" : "#0077B6";
        return (
          <Link
            key={cat.id}
            href={signupPlansPath(cat.id)}
            className="group flex flex-col rounded-xl border border-[#0B1D2A]/10 bg-white p-6 shadow-sm transition hover:border-[#00BFA6]/40 hover:shadow-md"
          >
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              <Icon className="size-6" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
              {cat.subtitle}
            </p>
            <h3 className="mt-1 text-xl font-bold text-[#0B1D2A]">{cat.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{cat.description}</p>
            <span
              className="mt-4 inline-flex items-center text-sm font-semibold"
              style={{ color: accent }}
            >
              Choisir ce profil
              <ArrowRight className="ml-1 size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
