"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const storedTheme = localStorage.getItem("finance-theme") || "light";
    document.documentElement.dataset.theme = storedTheme;
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return <>{children}</>;
}
