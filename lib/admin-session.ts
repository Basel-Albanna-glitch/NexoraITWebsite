import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_LANG_COOKIE, getAdminDict } from "./admin-i18n";
import { isAdmin } from "./auth";
import type { Locale } from "./i18n";

export async function getAdminLang(): Promise<Locale> {
  return (await cookies()).get(ADMIN_LANG_COOKIE)?.value === "ar" ? "ar" : "en";
}

/** For dashboard pages: sends signed-out visitors to the login screen, else returns the dashboard language + text. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
  const lang = await getAdminLang();
  return { lang, t: getAdminDict(lang) };
}
