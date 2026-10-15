import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/admin-session";
import { getSettings } from "@/lib/content-store";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { lang, t } = await requireAdmin();
  return (
    <>
      <div className="page-title"><h1 className="heading">{t.settings.title}</h1></div>
      <SettingsForm lang={lang} initial={await getSettings()} />
    </>
  );
}
