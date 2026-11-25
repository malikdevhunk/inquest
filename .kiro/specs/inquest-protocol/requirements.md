# Requirements — inquest protocol

## Story 1

As a protocol engineer, I can open a recorded case so that I can examine a failed or clean transaction without leaving the chamber.

### Acceptance

- WHEN a case id that matches a file in fixtures/ is requested, THE SYSTEM SHALL load that record and list its calls, events, and storage diffs.
- IF the case id is unknown, THE SYSTEM SHALL reject the request and SHALL NOT invent a record.

## Story 2

As a reader of the inquest, I can hear each witness so that I know what the record actually contains.

### Acceptance

- THE SYSTEM SHALL seat one witness for each call, each event, and each storage diff.
- WHEN a witness is asked for a field that is present, THE SYSTEM SHALL return that value unchanged.
- WHEN a witness is asked for a field that is absent, THE SYSTEM SHALL answer "not in the record" and SHALL NOT guess.

## Story 3

As a protocol engineer, I can read a charge sheet of invariants so that I know which claims about the trace held.

### Acceptance

- THE SYSTEM SHALL evaluate each charge in the case against an environment built only from the record (storage before/after labels and declared quantities).
- IF an identifier in a charge is missing from the environment, THE SYSTEM SHALL mark the charge as not in the record, not as a pass.
- THE SYSTEM SHALL use exact BigInt arithmetic.

## Story 4

As someone who must explain the incident, I can print a one-page verdict with a seal.

### Acceptance

- THE SYSTEM SHALL render a letter that names the case, the finding (clean or failed), each charge result, and a SHA-256 content hash.
- THE same record SHALL produce the same hash.
