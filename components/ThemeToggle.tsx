"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY as STORAGE_KEY, type Theme } from "@/lib/theme";

function setTheme(t: Theme, remember: boolean) {
  document.documentElement.dataset.theme = t;
  if (remember) {
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }
}

export function ThemeToggle({ label = "Switch between light and dark mode" }: { label?: string }) {
  // Follow the device setting live until the visitor picks a theme themselves.
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: light)");
    const onChange = (e: MediaQueryListEvent) => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
      if (!saved) setTheme(e.matches ? "light" : "dark", false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    setTheme(next, true);
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle}
            aria-label={label} title={label}>
      <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
      </svg>
      <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}
