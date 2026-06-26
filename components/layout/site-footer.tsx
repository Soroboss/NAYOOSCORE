import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { APP_TAGLINE, CONTACT } from "@/lib/constants";
import { BrandLogo } from "@/components/layout/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-[#0B1D2A] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <BrandLogo size="sm" variant="light" />
          <p className="text-sm text-white/70">{APP_TAGLINE}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#00BFA6]">
            Contact
          </h3>
          <div className="space-y-2 text-sm text-white/80">
            <a
              href={CONTACT.phoneHref}
              className="flex items-center gap-2 hover:text-[#00BFA6]"
            >
              <Phone className="size-4" />
              {CONTACT.phone}
            </a>
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#00BFA6]"
            >
              <MessageCircle className="size-4" />
              WhatsApp {CONTACT.whatsapp}
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#00BFA6]">
            Plateforme
          </h3>
          <div className="flex flex-col gap-2 text-sm text-white/80">
            <Link href="/login" className="hover:text-[#00BFA6]">
              Connexion
            </Link>
            <Link href="/signup" className="hover:text-[#00BFA6]">
              S&apos;inscrire
            </Link>
            <a href="#tarifs" className="hover:text-[#00BFA6]">
              Tarifs
            </a>
            <a href="#fonctionnalites" className="hover:text-[#00BFA6]">
              Fonctionnalités
            </a>
            <a href="#faq" className="hover:text-[#00BFA6]">
              FAQ
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Nayooscore — Tous droits réservés
      </div>
    </footer>
  );
}
