import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin-session";
import { getMessages } from "@/lib/messages-store";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { lang } = await requireAdmin();
  const newCount = (await getMessages()).filter((m) => m.status === "new").length;
  return <AdminShell lang={lang} newMessages={newCount}>{children}</AdminShell>;
}
