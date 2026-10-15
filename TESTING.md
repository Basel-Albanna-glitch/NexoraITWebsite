# Testing

| Layer | Framework | Command | Where |
|---|---|---|---|
| Unit (logic, validation, i18n) | Vitest 5 | `npm test` | `tests/unit/*.test.ts` |
| End-to-end (real browser) | Playwright 1.64 | `npm run test:e2e` | `tests/e2e/*.spec.ts` |

- Unit tests run in Node, import code through the `@/` alias, and need no server.
- E2E tests start `npm run dev` automatically (or reuse a running one). They are **read-only**:
  never submit forms or write to `data/`.
- CI (`.github/workflows/test.yml`) runs unit tests, a production build and the E2E suite on every push and PR.

## Conventions
- One `describe` per module, plain-English test names that say the behaviour (`"flags an invalid email"`).
- Prefer table-driven `it.each` rows over near-duplicate tests.
- Regression tests from /qa carry a header comment: `// Regression: ISSUE-NNN — …`.
- Test new functions, regressions, error paths and BOTH branches of conditionals. Aim for 100% coverage of
  validation and data-saving code, the parts where a silent bug costs real customer messages or content.
