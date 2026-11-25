# Tech

- Node.js, ESM, standard library only. Do not add a framework unless the spec says so.
- Fixtures are JSON in /fixtures.
- Engine modules live in /src: trace, invariants, inquest, verdict, server.
- The chamber is static files in /public.
- Tests use node:test in /tests.
- Invariant arithmetic uses BigInt. Hashes use SHA-256 over a canonical verdict body.
- Optional live RPC is stretch only and must be read-only.
