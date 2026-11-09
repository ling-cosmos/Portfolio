# John Cabarles — Aimate Portfolio

A cinematic personal portfolio for John Cabarles, built around the supplied `Aimate.mp4` film and the profile, skills, projects, and contact details from [`ling-cosmos/portfolio_v1`](https://github.com/ling-cosmos/portfolio_v1).

## Run locally

```bash
python3 -m http.server 4176
```

Open `http://127.0.0.1:4176/`.

## Features

- Full-screen 2560×1440 video background with an HD poster fallback
- Deep-blue cinematic grade, mist, grain, bloom, and atmospheric particles
- Ten animated canvas butterflies with pointer avoidance
- Responsive personal hero, skills, project gallery, profile story, and contact sections
- Tools matrix covering HTML, CSS, Java, Bootstrap, Git, JavaScript, PHP, Python, MySQL, and GitHub
- Project cards distinguish original live apps, original interface views, team prototypes, and separate sample demos
- CABUS opens its full hosted app, with a separate account-free sample demo
- Student Enrollment shows its original PHP interface and source; the hosted original-app database setup is pending, with a separate simplified demo available
- ScamSignal opens its original hosted Next.js app with English, Filipino, and Bisaya rule-based checks; AI analysis is disabled
- Alaga shows its original Expo web interface, Android screenshots, and team source; hosted database setup is pending, with a separate simplified care-log demo available
- Boja identifies its original Figma prototype and access requirement, with a separate sample concept and no private vault exports
- Databases certification section with an accessible preview and original certificate PDF
- Reduced-motion, Save-Data, visibility, and manual motion controls
- Browser-native contact options with a visible email address, copy support, Gmail compose link, and optional email-app link
- Floating automated portfolio guide for verified FAQs, project-demo links, and a short client-inquiry flow
- Client Chatbot has its own Projects card and full-page demo at `previews/chatbot.html`, sharing the same FAQ and inquiry flow as the floating guide
- Editable inquiry drafts with explicit Gmail/email-app handoff and a copy fallback; the chat does not send mail, store conversations, or promise prices or response times
- No runtime dependencies or third-party requests

## Demo checks

Run `node previews/demo-models.test.mjs` for enrollment validation, dose/stock invariants, linked case workflows, and message-rule regressions. Demo changes live only in memory for the current visit. See `previews/README.md` for provenance and browser walkthroughs.

Run `node chat-model.test.mjs` for FAQ boundaries, inquiry context, human handoff, draft encoding, and input validation. Portfolio answers and destinations are maintained in `chat-model.mjs`; update them alongside the visible portfolio when projects or credentials change. The guide is a local FAQ/inquiry assistant, not an LLM or live agent. Visitors review and send the email draft themselves. No chat analytics, backend, API keys, or automatic email delivery are configured.
