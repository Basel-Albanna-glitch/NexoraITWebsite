import { Overview, type DayRow } from "@/components/admin/Overview";
import { requireAdmin } from "@/lib/admin-session";
import { getMessages } from "@/lib/messages-store";
import { getAllProjects } from "@/lib/projects-store";
import { dayKey, getStats } from "@/lib/stats-store";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const { lang } = await requireAdmin();
  const [days, messages, projects] = await Promise.all([getStats(), getMessages(), getAllProjects()]);

  // 180 days, oldest first, so every range preset (up to 90) also has a previous period to compare with.
  const rows: DayRow[] = [];
  const now = Date.now();
  for (let i = 179; i >= 0; i--) {
    const date = dayKey(new Date(now - i * 864e5));
    const d = days[date];
    rows.push({ date, views: d?.views ?? 0, visitors: d?.visitors.length ?? 0, paths: d?.paths ?? {}, langs: d?.langs ?? {}, refs: d?.refs ?? {} });
  }

  return (
    <Overview
      lang={lang}
      days={rows}
      messages={messages.map((m) => ({ id: m.id, name: m.name, service: m.service, status: m.status, createdAt: m.createdAt, message: m.message.slice(0, 140) }))}
      liveProjects={projects.filter((p) => p.published).length}
    />
  );
}
