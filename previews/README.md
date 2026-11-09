# Interactive project demos

All five portfolio cards open interactive browser demos. No account is needed. Demo changes stay in memory for the current visit; Reset demo or reloading restores the original samples. These demos do not write to project databases.

- `cabus/index.html`: adapted from `ling-cosmos/cabus/preview/`. Add a task, mark it complete, create a goal and toggle a milestone, log a workout, add an expense, and inspect the budget. The original full hosted app remains linked separately. Paths are relative for GitHub Pages; persistent browser storage is disabled in this portfolio copy.
- `seis.html`: browser simulation of registration and enrollment. Add a student, enroll in a course, inspect Reports, withdraw and reenroll. Full courses and duplicate enrollments are rejected. The original project remains PHP/MySQL.
- `scamsignal.html`: browser adaptation of `option-2/features/scam-check/domain/analyze-message.ts`. Load risky, routine, or Filipino samples and run actual deterministic rules. Clear and reset are supported. No AI, URL requests, or message storage. No-match results never claim the message is safe.
- `alaga.html`: synthetic care-log simulation. Confirm Taken/Skip/Snooze, undo a record, inspect inventory/history, and refill demo stock. It does not deliver device notifications, run OCR, or modify the Android project.
- `boja.html`: user-authorized interactive concept. Create a fictional case, add a linked document title and deadline, change case status, and complete/reopen deadlines. It does not upload documents, calculate legal dates, or represent the team's approved application.

## Retained reference views

- `alaga-screenshots.html`: actual Android screenshot walkthrough. The three PNG assets come from `kaelxoxo/prog_lang`, commit `49bb1eb0a0b47e0b686882bed07049d88b4456ae`, under `docs/screenshots/01-home.png`, `02-today.png`, and `04-medicines.png`. The public project labels the data synthetic. No session-expired or diagnostic screenshots are used.
- `boja-overview.html`: original illustrative, read-only concept. Both Boja views use only the high-level project scope already described on the portfolio. All records and dates are fictional; no private documentation is exported.

## Verification

`node previews/demo-models.test.mjs` runs ten invariant and regression tests. Browser verification additionally covers real form submission, navigation, record updates, reset, and responsive layout. The reference-view tabs retain their keyboard support.
