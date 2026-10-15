import { describe, expect, it } from "vitest";
import { validateDraft } from "@/lib/project-input";

const base = {
  name: "Test Shop", kind: "Online store", services: ["websites"], headline: "Sell more.",
  summary: "A test store with enough words to pass.", points: ["Fast"], published: true,
};

describe("validateDraft", () => {
  it("accepts a minimal project and keeps Arabic text optional", () => {
    const r = validateDraft(base);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.ar?.name).toBe("");
  });

  it("only allows media from the site's own folders (no external or ../ paths)", () => {
    for (const src of ["https://evil.example/x.png", "/media/../.env.local", "/etc/passwd"]) {
      const r = validateDraft({ ...base, image: { src, width: 10, height: 10, alt: "" } });
      expect(r.ok, src).toBe(false);
    }
    const ok = validateDraft({ ...base, image: { src: "/media/abc-123.png", width: 10, height: 10, alt: "" } });
    expect(ok.ok).toBe(true);
  });

  it("drops unknown service slugs and requires at least one real one", () => {
    const r = validateDraft({ ...base, services: ["crypto"] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.services).toBeTruthy();
  });

  it("keeps Arabic fields when provided", () => {
    const r = validateDraft({ ...base, ar: { name: "متجر", points: ["سريع", ""] } });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.ar?.name).toBe("متجر");
      expect(r.data.ar?.points).toEqual(["سريع"]);
    }
  });
});
