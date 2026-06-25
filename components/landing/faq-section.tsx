const faqs = [
  {
    q: "Qu'est-ce que Nayooscore ?",
    a: "Nayooscore est une plateforme SaaS qui calcule un score de finançabilité pour les PME africaines, en s'appuyant sur leurs données de gestion, leur conformité et leur gouvernance.",
  },
  {
    q: "Qui peut utiliser la plateforme ?",
    a: "Les entrepreneurs (PME) pour structurer leur activité et améliorer leur score, et les institutions (banques, fonds, incubateurs, ONG) pour accompagner et financer des portefeuilles de PME.",
  },
  {
    q: "Comment est calculé le score ?",
    a: "Le score sur 100 repose sur 5 dimensions : gestion (20 %), financier (30 %), croissance (20 %), conformité (15 %) et gouvernance (15 %). Il se met à jour au fur et à mesure que vous complétez vos données.",
  },
  {
    q: "Les modules changent-ils selon mon activité ?",
    a: "Oui. Lors de l'onboarding, vous choisissez votre type d'activité (commerce, services, agriculture, etc.) et seuls les modules pertinents sont activés dans votre espace.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Nayooscore utilise une architecture multi-tenant avec authentification sécurisée et isolation des données par entreprise et par institution.",
  },
  {
    q: "Comment contacter l'équipe ?",
    a: "Par téléphone au +225 07 57 22 87 31 ou via WhatsApp au +225 01 00 57 65 26. Notre équipe est basée en Côte d'Ivoire.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0077B6]">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[#0B1D2A]">
            Questions fréquentes
          </h2>
        </div>

        <div className="divide-y divide-[#0B1D2A]/10 rounded-2xl border border-[#0B1D2A]/10">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-6 py-1">
              <summary className="cursor-pointer list-none py-4 font-medium text-[#0B1D2A] marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.q}
                  <span className="text-[#00BFA6] transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
