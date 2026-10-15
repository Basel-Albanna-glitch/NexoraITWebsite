import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminDict } from "@/lib/admin-i18n";
import { getAdminLang } from "@/lib/admin-session";
import { adminConfigured, isAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const lang = await getAdminLang();
  const t = getAdminDict(lang);
  return (
    <main className="admin-login">
      <div className="admin-login__box">
        <p className="logo" dir="ltr"><span className="logo__word">Nexora<span>IT</span></span></p>
        <h1 className="heading">{t.login.title}</h1>
        {adminConfigured() ? <LoginForm lang={lang} /> : <p className="admin-note">{t.login.locked}</p>}
      </div>
    </main>
  );
}
