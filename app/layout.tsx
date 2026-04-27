import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SupabaseSyncProvider } from "@/components/SupabaseSyncProvider";
import { SyncStatusBanner } from "@/components/SyncStatusBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EIDOS",
  description: "Conócete. Diseña tu vida. Ejecútala.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SupabaseSyncProvider>
          <AppProviders>
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <footer className="border-t border-[#2A2A3A] bg-[#0D0D14] px-5 py-4 text-center">
                <Link
                  href="/privacidad"
                  className="text-[11px] text-[rgba(240,237,232,0.5)] underline-offset-2 hover:text-[#22D3EE] hover:underline"
                >
                  Privacidad
                </Link>
              </footer>
            </div>
          </AppProviders>
          <SyncStatusBanner />
        </SupabaseSyncProvider>
      </body>
    </html>
  );
}
