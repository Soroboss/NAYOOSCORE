import { BrandLogo } from "@/components/layout/brand-logo";

export default function PmeOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="border-b border-[#0B1D2A]/10 bg-white px-6 py-4">
        <BrandLogo size="md" showTagline />
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}
