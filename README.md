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

To build the static GitHub Pages tree:

```bash
npm run build:pages
```

That writes `docs/`. You can also open the chamber from those files once they are served (Pages, or any static host).

## Official fixtures

- `fixtures/failed-swap.json` — a swap that reports a revert, and the min-out charge fails.
- `fixtures/clean-transfer.json` — a transfer where every charge holds.
- `fixtures/stale-oracle.json` — a perp fill that is recorded as successful, but the oracle freshness charge fails.

`npm test` rebuilds every official case, checks the witness lists, evaluates the charge sheets, and asserts that a missing field is reported as "not in the record" rather than guessed.

## Live URL (once the public repo exists)

Preferred host: **GitHub Pages**, free, from this repository.

1. Push `main` to `https://github.com/malikdevhunk/inquest` (this folder).
2. On the repo: Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` → Folder: `/docs` → Save.
3. After a few minutes the chamber should be at `https://malikdevhunk.github.io/inquest/`.
4. Put that URL on the Kiroween submission form. If login were ever needed, judges-only credentials would go in the Devpost form, not on this page. This demo has no login.

The Pages tree is already static: HTML, CSS, JS modules, and the fixture JSON. The inquest runs in the browser. No Node server is required in production.

Fallback hosts, same `docs/` folder, no build command: Cloudflare Pages or Netlify drop-upload. Keep the path so relative links (`./styles.css`, `./fixtures/…`) still work. Custom domain is optional; do not put a home address or a personal mobile number anywhere on the demo.

## Screenshots plan (take these from the live URL)

Shoot the desktop chamber at 1440×900, and one phone-width crop. No wallet popups, no email, no phone number, no third-party logos. Attribution is Saddam Malik only.

1. **Mast and docket.** The failed-swap case selected. Enough to read the title: “The record, and nothing else.”
2. **Witnesses** for failed-swap, including `swapExactTokensForTokens` and the reserve rows.
3. **Charge sheet** for failed-swap, with C3 clearly marked failed.
4. **Verdict letter** and the red seal (the first eight characters of the hash).
5. **Clean transfer** with the “Finding: clean” mark and all charges held.
6. **Stale oracle** charge C1 failed (`block_ts - last_index_ts <= max_stale_secs`).

Use 1, 3, 4, and 6 on Devpost if the form allows images. Put the rest in the README after the repo is public, or keep them for the video end card.

## Demo video script (under 3:00, target 2:00)

Record the live Pages URL (or http://127.0.0.1:8787/ if Pages is not up yet). No copyrighted music. No third-party marks. English voice or large captions. Judges are not required to watch past 3:00.

| Time | Picture | Voice / on-screen text |
|---|---|---|
| 0:00–0:12 | Title card: Inquest, Saddam Malik, India. Then the chamber mast. | “Inquest is a coroner's sitting for a dead or suspicious smart-contract transaction.” |
| 0:12–0:28 | Docket. Open failed-swap. | “You open a recorded case. Nothing is fetched from gossip. The record is the only evidence.” |
| 0:28–0:58 | Scroll witnesses: the reverting swap, getReserves, the reserve slots. | “Each call, event, and storage change is a witness. They may only speak to fields in the trace.” |
| 0:58–1:22 | Charge sheet. Highlight C3 failed, C1 and C2 held. | “The charge sheet is a tiny invariant language, run with exact integers. Here the pool kept its reserves, but the caller did not receive the minimum output.” |
| 1:22–1:42 | Verdict letter and seal. Copy letter once. | “Inquest writes a one-page verdict and seals it with a SHA-256 hash of the letter body. The same record always seals the same hash.” |
| 1:42–1:58 | Open clean-transfer. All charges held. | “A clean transfer: every charge holds. The sitting can also clear a case.” |
| 1:58–2:20 | Open stale-oracle. C1 failed. | “A fill can look successful on-chain and still fail an inquest. Here the last oracle update is older than the freshness window.” |
| 2:20–2:30 | Close on the mast line. | “The record, and nothing else.” |

If you must cut for time, drop the clean-transfer beat first, keep failed-swap and stale-oracle.

## License

MIT. Copyright (c) 2026 Saddam Malik.
