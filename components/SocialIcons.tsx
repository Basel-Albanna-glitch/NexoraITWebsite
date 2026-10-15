import type { Settings } from "@/lib/content";

const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.9 8.8H3.8V20h3.1V8.8ZM5.3 3.9a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.2 13.6c0-3-1.6-5-4.3-5-1.4 0-2.4.8-2.8 1.5V8.8H10V20h3.1v-5.9c0-1.5.6-2.6 2-2.6s1.9 1.1 1.9 2.6V20h3.2v-6.4Z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
    </svg>
  ),
};

const LABELS: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", x: "X" };

/** Icon links for every social profile set in the dashboard settings. */
export function SocialIcons({ social, label, className = "" }:
  { social: Settings["social"]; label: (name: string) => string; className?: string }) {
  const links = Object.entries(social).filter(([name, url]) => url && ICONS[name]);
  if (!links.length) return null;
  return (
    <div className={`social ${className}`}>
      {links.map(([name, url]) => (
        <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={label(LABELS[name])} title={LABELS[name]}>
          {ICONS[name]}
        </a>
      ))}
    </div>
  );
}
