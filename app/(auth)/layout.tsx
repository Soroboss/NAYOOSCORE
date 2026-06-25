import { AuthBackHome, AuthBrandingPanel, AuthMobileLogo } from "@/components/auth/auth-branding-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B1D2A]">
      <div className="mx-auto grid min-h-screen lg:grid-cols-2">
        <AuthBrandingPanel />

        <div className="flex flex-col items-center justify-center px-6 py-10">
          <AuthMobileLogo />
          <div className="w-full max-w-lg rounded-2xl border border-[#0B1D2A]/8 bg-white p-8 shadow-2xl shadow-black/20">
            <AuthBackHome />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
