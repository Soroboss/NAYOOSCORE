import { BrandLogo } from "@/components/layout/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#0B1D2A]">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="mb-8">
          <BrandLogo size="lg" showTagline variant="light" />
        </div>
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#132B49]/80 p-8 shadow-2xl backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
