# Inquest

A coroner's inquest for a dead or suspicious smart-contract transaction.

Designed, built and developed by Saddam Malik, India.

You open a case from a recorded trace. The chamber seats a witness for every call, event, and storage change. Witnesses may only speak to what is on the record. A charge sheet of invariants is then read against that record, and Inquest writes a one-page verdict with a content hash as the seal.

This is a reader and a checker. It does not sign transactions, hold keys, or invent facts that are missing from the trace.

## Run it

Needs Node.js 20 or newer. No extra packages.

```bash
npm test
npm start
```

Then open http://127.0.0.1:8787/

Two official fixtures ship with the repo:

- `fixtures/failed-swap.json` — a swap that reports success at the top while a reserve invariant fails.
- `fixtures/clean-transfer.json` — a transfer where every charge holds.

## How to verify

`npm test` rebuilds both cases, checks the witness lists, evaluates the charge sheets, and asserts that a missing field is reported as "not in the record" rather than guessed.

## License

MIT. Copyright (c) 2026 Saddam Malik.
