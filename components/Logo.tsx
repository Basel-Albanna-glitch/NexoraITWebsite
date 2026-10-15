import Link from "next/link";

export function Logo({ home = "/", label = "NexoraIT home", withMark = false, className = "" }:
  { home?: string; label?: string; withMark?: boolean; className?: string }) {
  return (
    <Link href={home} className={`logo ${className}`} aria-label={label} dir="ltr">
      {withMark && (
        <svg className="logo__mark" viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7ab8e6" />
              <stop offset="1" stopColor="#15846e" />
            </linearGradient>
          </defs>
          <path d="M3 21 L12 3 L21 21 L12 15 Z" fill="url(#logo-grad)" />
        </svg>
      )}
      <span className="logo__word">Nexora<span>IT</span></span>
    </Link>
  );
}
