import type { Metadata } from "next";
import ThemeProvider from "./components/ThemeProvider";
import { LanguageProvider } from "./lib/i18n";
import { CartProvider } from "./lib/cart";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jejak Rimba — Sewa Alat Camping & Mendaki",
  description:
    "Sewa alat camping dan mendaki dari penyedia terpercaya di Malang Raya. Cek stok, lokasi, dan harga secara langsung.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>{children}</CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
