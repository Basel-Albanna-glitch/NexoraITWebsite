"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Fades in every `.reveal` element as it scrolls into view. Re-runs on each page navigation. */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min((i % 4) * 80, 240)}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
