# Link checks

`link-button-fuzzing.spec.ts` visits each public page once, verifies that links
have descriptive labels and safe `target="_blank"` attributes, then checks each
unique internal destination over HTTP.

Run it with:

```bash
npm run test:e2e -- tests/e2e/link-button-fuzzing.spec.ts --project=chromium
```

Search, filters, tabs, and buttons are covered by the focused journey tests in
the other spec files.
