"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const storedTheme = localStorage.getItem("finance-theme") || "light";
    document.documentElement.dataset.theme = storedTheme;
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
    const timer = window.setTimeout(() => setShowSplash(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {children}
      {showSplash && (
        <div className="app-splash" aria-hidden="true">
          <Image src="/icon-192x192.webp" alt="" width={112} height={112} className="app-splash-icon" priority />
          <span className="app-splash-pulse" />
        </div>
      )}
    </>
  );
}
