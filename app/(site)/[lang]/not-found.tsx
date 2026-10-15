"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// not-found can't read route params, so the language comes from the URL.
const T = {
  en: { title: "Lost in the void.", body: "The page you're looking for doesn't exist or has moved.", home: "Back to home", href: "/" },
  ar: { title: "ضائع في الفراغ.", body: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", home: "العودة للرئيسية", href: "/ar" },
};

export default function NotFound() {
  const t = usePathname().startsWith("/ar") ? T.ar : T.en;
  return (
    <main>
      <section className="wrap page-head not-found">
        <p className="label">404</p>
        <h1 className="display">{t.title}</h1>
        <p className="body body--muted">{t.body}</p>
        <Link href={t.href} className="btn btn--primary">{t.home}</Link>
      </section>
    </main>
  );
}
