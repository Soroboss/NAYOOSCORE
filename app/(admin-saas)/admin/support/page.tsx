import { CONTACT } from "@/lib/constants";
import { MessageCircle, Phone } from "lucide-react";

export default function AdminSupportPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1D2A]">Support</h1>
        <p className="text-muted-foreground">Contactez l&apos;équipe Nayooscore.</p>
      </div>
      <div className="max-w-md space-y-4 rounded-xl border bg-white p-6">
        <a href={CONTACT.phoneHref} className="flex items-center gap-3 text-[#0B1D2A] hover:text-[#00BFA6]">
          <Phone className="size-5" />
          {CONTACT.phone}
        </a>
        <a
          href={CONTACT.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-[#0B1D2A] hover:text-[#00BFA6]"
        >
          <MessageCircle className="size-5" />
          WhatsApp {CONTACT.whatsapp}
        </a>
      </div>
    </div>
  );
}
