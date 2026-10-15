import "server-only";
import { randomBytes } from "crypto";
import type { ContactInput } from "./contact";
import type { Locale } from "./i18n";
import { jsonFile } from "./json-file";

export type MessageStatus = "new" | "read" | "done";
export interface Message extends ContactInput {
  id: string;
  lang: Locale;
  status: MessageStatus;
  createdAt: string;
  /** whether the email notification went out */
  emailed: boolean;
}

const MAX_KEPT = 5000;
const store = jsonFile<Message[]>("messages.json", () => []);

export const getMessages = () => store.read();

export async function getMessage(id: string) {
  return (await store.read()).find((m) => m.id === id);
}

export function addMessage(input: ContactInput, lang: Locale) {
  const msg: Message = {
    ...input, lang, id: `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`,
    status: "new", createdAt: new Date().toISOString(), emailed: false,
  };
  return store.mutate((all) => ({ next: [msg, ...all].slice(0, MAX_KEPT), result: msg }));
}

export function updateMessage(id: string, patch: Partial<Pick<Message, "status" | "emailed">>) {
  return store.mutate((all) => {
    const i = all.findIndex((m) => m.id === id);
    if (i < 0) return { next: all, result: null };
    const next = [...all];
    next[i] = { ...next[i], ...patch };
    return { next, result: next[i] };
  });
}

export function deleteMessage(id: string) {
  return store.mutate((all) => ({ next: all.filter((m) => m.id !== id), result: all.some((m) => m.id === id) }));
}
