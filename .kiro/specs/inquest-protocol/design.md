# Design — inquest protocol

```
fixture JSON -> loadCase()
                 |-> witnessesFrom(case)
                 |-> evaluateCharges(case)
                 '-> renderVerdict(case, witnesses, charges) -> { letter, seal }
```

## Record

A case file has `id`, `title`, `network`, `txHash` (optional), `status`, `calls[]`, `events[]`, `storage[]`, `quantities{}`, and `charges[]`.

`storage[]` entries have `label`, `before`, and `after` as decimal integer strings.

`charges[]` have `id`, `name`, and `expr` in the tiny language: identifiers, `+ - *`, parentheses, and `== != < <= > >=`.

The evaluator binds `label_before` and `label_after` for each storage row, plus any `quantities` keys. No other names.

## API

- `GET /api/cases` — metadata for official fixtures (id, title, status).
- `POST /api/inquest` with `{ "id": "failed-swap" }` — the sitting: witnesses, charges, verdict, seal.

## UI

One chamber page. Pick a case, read the witnesses, read the charge sheet, show the sealed letter. Works with the local server, no login.
