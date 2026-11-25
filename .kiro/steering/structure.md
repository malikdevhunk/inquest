# Structure

- fixtures/ — official recorded cases, one JSON file per case.
- src/trace.mjs — load and normalise a case.
- src/invariants.mjs — tiny expression language and evaluator.
- src/inquest.mjs — witnesses, charges, and the sitting.
- src/verdict.mjs — letter text and content hash.
- src/server.mjs — static chamber plus /api/cases and /api/inquest.
- public/ — the chamber UI.
- tests/ — unit tests, no network.
- .kiro/ — steering, specs, and hooks. This directory stays in git.
