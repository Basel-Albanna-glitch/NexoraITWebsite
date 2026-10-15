import { notFound } from "next/navigation";

// Any unknown address inside a language renders that language's 404 (with the site's menu and footer).
export default function CatchAll() {
  notFound();
}
