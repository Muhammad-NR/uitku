import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Catatan Keuanganku",
  description: "Aplikasi Pencatatan Keuangan Pribadi (PWA)",
  manifest: "/manifest.json", // Nanti kita buat file ini buat PWA
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Biar gak zoom-in sendiri pas mencet input di HP
  themeColor: "#146b55",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} text-gray-900`}>
        <ThemeProvider>
        {/* Kontainer utama dibikin max-w-md biar kalau di PC bentuknya tetap mobile-friendly */}
        <main className="max-w-md mx-auto min-h-screen bg-[#f8fbf9] relative pb-20 shadow-sm overflow-x-hidden">
          {children}
          <BottomNav />
        </main>
        </ThemeProvider>
      </body>
    </html>
  );
}