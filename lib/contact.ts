// Shared between the contact form (client) and /api/contact (server).

export const SERVICES = ["Website", "ERP system", "POS system", "Mobile app", "Something else"] as const;
export type Service = (typeof SERVICES)[number];

export interface ContactInput {
  name: string;
  email: string;
  company: string;
  service: Service;
  message: string;
}

export type FieldErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(raw: Record<string, unknown>):
  { ok: true; data: ContactInput } | { ok: false; errors: FieldErrors } {
  const str = (k: string, max: number) => String(raw[k] ?? "").trim().slice(0, max);
  const data = {
    name: str("name", 120),
    email: str("email", 200),
    company: str("company", 160),
    service: str("service", 40) as Service,
    message: str("message", 5000),
  };
  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(data.email)) errors.email = "Please enter a valid email.";
  if (!SERVICES.includes(data.service)) errors.service = "Please choose a service.";
  if (data.message.length < 10) errors.message = "Tell us a little more (at least 10 characters).";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
