# NexoraIT website

Next.js 16 (App Router) + TypeScript.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill it in (see below).

## Languages

English lives at `/` (`/services`, `/work` …) and Arabic at `/ar` (`/ar/services` …), right-to-left with IBM Plex Sans Arabic.
`proxy.ts` maps English URLs onto `app/(site)/[lang]`. Fixed interface text (buttons, labels, form messages) is in `lib/i18n.ts`;
everything else is editable in the dashboard.

## Dashboard (/admin)

Sign in with `ADMIN_PASSWORD` from `.env.local`. English/Arabic switch, light/dark mode.

- **Overview**: visitors, page views, top pages, language, referrers, messages by service (7 / 30 / 90 days).
  Stats are anonymous: no cookies, no IPs stored; your own signed-in visits aren't counted.
- **Messages**: every contact-form submission, even when email isn't set up. Mark new/read/done, reply by email, delete.
- **Projects**: add/edit/hide/delete/reorder, pictures & videos, English + Arabic text.
- **Website text**: every page and service, English and Arabic side by side.
- **Settings**: email, phone, WhatsApp, location, hours, social links.

Where things are stored (back these up):

| What | Where |
|---|---|
| Site text & settings | `data/content.json` |
| Projects | `data/projects.json` |
| Messages | `data/messages.json` |
| Visit stats | `data/stats.json` |
| Uploaded pictures & videos | `storage/uploads/` (served at `/media/...`) |

Move them with `DATA_DIR` and `UPLOAD_DIR` env vars (e.g. to a mounted disk).

**On Vercel** the same data lives in the cloud instead (chosen automatically from env vars):
text, projects, messages and stats in **Upstash Redis** (keys `nexorait:content`, `nexorait:projects`, …),
uploads in **Vercel Blob** (`uploads/…`). Until something is saved, Redis falls back to the `data/*.json` in git.

## Contact form backend

`POST /api/contact` validates the message, blocks bots (honeypot + per-IP rate limit), saves it to the dashboard inbox,
then emails it via SMTP if `CONTACT_TO` and `SMTP_*` are set in `.env.local`.

## Deploy

### Vercel

1. Import the GitHub repo in Vercel (framework: Next.js, defaults are fine).
2. In the project's **Storage** tab, connect:
   - **Upstash for Redis** (Marketplace) — adds `KV_REST_API_URL` / `KV_REST_API_TOKEN`.
   - **Blob** — adds `BLOB_READ_WRITE_TOKEN`.
3. In **Settings → Environment Variables** add `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, and the `SMTP_*` /
   `CONTACT_TO` values from `.env.example` for contact emails.
4. Redeploy so the new variables are picked up.

Without the Redis/Blob variables the dashboard can't save on Vercel (its disk is read-only).
Note: Vercel's free Hobby plan is for non-commercial use; a business site should be on Pro.

### Your own server

Without those variables everything is stored on disk, so a server with a **persistent disk** also works: a VPS
(DigitalOcean, Hetzner, Hostinger VPS…), or Railway/Render with a volume. Run `npm run build && npm start`
behind a reverse proxy with HTTPS, and keep `data/` and `storage/` on the persistent disk.
