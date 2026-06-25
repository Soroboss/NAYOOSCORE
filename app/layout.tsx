import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Score de finançabilité PME`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Nayooscore : la plateforme africaine de score de finançabilité pour PME et institutions. Diagnostic, suivi financier, scoring sur 100 points et demandes de financement.",
  keywords: [
    "PME",
    "finançabilité",
    "score",
    "Afrique",
    "Côte d'Ivoire",
    "financement",
    "institution",
  ],
  openGraph: {
    title: `${APP_NAME} — Le score qui inspire confiance`,
    description: APP_DESCRIPTION,
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
