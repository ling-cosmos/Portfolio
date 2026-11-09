# Interactive project demos

These separate sample demos are retained alongside original project links. The portfolio's primary CABUS and ScamSignal cards now open their original hosted applications. Student Enrollment and Alaga primary cards show actual interfaces while public database setup is pending; Boja identifies its original Figma prototype and its access requirement. Tracker and workflow simulation changes stay in memory and do not write to project databases.

- `cabus/index.html`: adapted from `ling-cosmos/cabus/preview/`. Add a task, mark it complete, create a goal and toggle a milestone, log a workout, add an expense, and inspect the budget. The original full hosted app remains linked separately. Paths are relative for GitHub Pages; persistent browser storage is disabled in this portfolio copy.
- `seis.html`: browser simulation of registration and enrollment. Add a student, enroll in a course, inspect Reports, withdraw and reenroll. Full courses and duplicate enrollments are rejected. The original project remains PHP/MySQL.
- `scamsignal.html`: browser adaptation of `option-2/features/scam-check/domain/analyze-message.ts`. Load risky, routine, or Filipino samples and run actual deterministic rules. Clear and reset are supported. No AI, URL requests, or message storage. No-match results never claim the message is safe.
- `alaga.html`: synthetic care-log simulation. Confirm Taken/Skip/Snooze, undo a record, inspect inventory/history, and refill demo stock. It does not deliver device notifications, run OCR, or modify the Android project.
- `boja.html`: user-authorized interactive concept. Create a fictional case, add a linked document title and deadline, change case status, and complete/reopen deadlines. It does not upload documents, calculate legal dates, or represent the team's approved application.
- `chatbot.html`: full-page Client Chatbot demo. Ask portfolio FAQs, open project demos, or prepare and edit a client inquiry draft. New chat clears the current conversation. Email is sent only when the visitor sends the reviewed draft through their email service. Shares `../chat-widget.mjs` and `../chat-model.mjs` with the floating portfolio guide.

## Retained reference views

- `alaga-screenshots.html`: actual Android screenshot walkthrough. The three PNG assets come from `kaelxoxo/prog_lang`, commit `49bb1eb0a0b47e0b686882bed07049d88b4456ae`, under `docs/screenshots/01-home.png`, `02-today.png`, and `04-medicines.png`. The public project labels the data synthetic. No session-expired or diagnostic screenshots are used.
- `boja-overview.html`: original illustrative, read-only concept. Both Boja views use only the high-level project scope already described on the portfolio. All records and dates are fictional; no private documentation is exported.

## Verification

`node previews/demo-models.test.mjs` runs ten invariant and regression tests. Browser verification additionally covers real form submission, navigation, record updates, reset, and responsive layout. The reference-view tabs retain their keyboard support.
