import { Inbox } from "@/components/admin/Inbox";
import { requireAdmin } from "@/lib/admin-session";
import { getMessages } from "@/lib/messages-store";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const { lang } = await requireAdmin();
  const { id } = await searchParams;
  return <Inbox lang={lang} initial={await getMessages()} openId={typeof id === "string" ? id : undefined} />;
}
