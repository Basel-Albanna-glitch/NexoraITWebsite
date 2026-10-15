import { describe, expect, it } from "vitest";
import { validateContact } from "@/lib/contact";

const valid = { name: "Sara Ahmad", email: "sara@example.com", company: "", service: "POS system", message: "We need a POS for three branches." };

describe("validateContact", () => {
  it("accepts a complete enquiry and trims whitespace", () => {
    const r = validateContact({ ...valid, name: "  Sara Ahmad  " });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.name).toBe("Sara Ahmad");
  });

  it.each([
    ["name", { name: "S" }],
    ["email", { email: "not-an-email" }],
    ["service", { service: "Hacking" }],
    ["message", { message: "too short" }],
  ])("flags an invalid %s", (field, patch) => {
    const r = validateContact({ ...valid, ...patch });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors)).toEqual([field]);
  });

  it("caps very long input instead of storing it whole", () => {
    const r = validateContact({ ...valid, message: "x".repeat(20_000) });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.message).toHaveLength(5000);
  });
});
