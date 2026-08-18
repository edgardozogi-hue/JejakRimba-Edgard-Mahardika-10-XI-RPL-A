"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Baca preferensi tersimpan/sistem sesaat setelah mount (async biar tidak
    // setState sinkron di dalam effect — pola rekomendasi React 19).
    const raf = requestAnimationFrame(() => {
      const stored = localStorage.getItem("jejak-rimba-theme") as Theme | null;
      if (stored) {
        setTheme(stored);
        return;
      }
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sinkronkan class ke <html> setiap kali theme berubah (sinkronisasi DOM).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("jejak-rimba-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}