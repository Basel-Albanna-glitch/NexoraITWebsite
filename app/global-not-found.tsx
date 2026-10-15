import type { Metadata } from "next";
import { fontVars } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = { title: "404 — NexoraIT", robots: { index: false } };

// Shown for addresses outside the public site and dashboard (most 404s use app/(site)/[lang]/not-found.tsx).
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <main>
          <section className="wrap page-head not-found">
            <p className="label">404</p>
            <h1 className="display">Lost in the void.</h1>
            <p className="body body--muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
            <a href="/" className="btn btn--primary">Back to home</a>
          </section>
        </main>
      </body>
    </html>
  );
}
