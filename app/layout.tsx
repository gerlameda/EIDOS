import type { Metadata } from "next";
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
          <AppProviders>{children}</AppProviders>
          <SyncStatusBanner />
        </SupabaseSyncProvider>
      </body>
    </html>
  );
}
