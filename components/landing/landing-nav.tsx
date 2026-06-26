import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardPath } from "@/lib/settings-path";

const navLinks = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#pour-qui", label: "Pour qui" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#score", label: "Le score" },
  { href: "#faq", label: "FAQ" },
];

export async function LandingNav() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1D2A]/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <BrandLogo size="sm" variant="light" />
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/75 transition-colors hover:text-[#00BFA6]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden border-white/20 bg-transparent text-white hover:bg-white/10 sm:inline-flex"
              >
                <Link href={getDashboardPath(user.role)}>Mon espace</Link>
              </Button>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Déconnexion
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden border-white/20 bg-transparent text-white hover:bg-white/10 sm:inline-flex"
              >
                <Link href="/login">Connexion</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-[#00BFA6] text-white hover:bg-[#00a892]"
              >
                <Link href="/signup">S&apos;inscrire</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
