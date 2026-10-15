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

## Contact form backend

`POST /api/contact` validates the message, blocks bots (honeypot + per-IP rate limit), saves it to the dashboard inbox,
then emails it via SMTP if `CONTACT_TO` and `SMTP_*` are set in `.env.local`.

## Deploy

Because the dashboard saves files to disk, host on a server with a **persistent disk**: a VPS
(DigitalOcean, Hetzner, Hostinger VPS…), or Railway/Render with a volume. Run `npm run build && npm start`
behind a reverse proxy with HTTPS, and keep `data/` and `storage/` on the persistent disk.

Serverless hosts like Vercel or Netlify don't keep uploaded files, so they'd need a cloud storage change first.
