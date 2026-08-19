import type { Metadata } from "next";
import ThemeProvider from "./components/ThemeProvider";
import { LanguageProvider } from "./lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — Komunitas Robotika",
  description: "Panel administrasi Komunitas Robotika (sewa alat camping & mendaki).",
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
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}