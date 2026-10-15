import type { Metadata } from "next";
import { getAdminLang } from "@/lib/admin-session";
import { fontVars } from "@/lib/fonts";
import { dirOf } from "@/lib/i18n";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Dashboard — NexoraIT", template: "%s — NexoraIT Dashboard" },
  robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getAdminLang();
  return (
    <html lang={lang} dir={dirOf(lang)} className={fontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="admin">{children}</body>
    </html>
  );
}
