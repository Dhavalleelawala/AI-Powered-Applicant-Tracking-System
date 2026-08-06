# Rolefit UX plan

Living product-design plan. Epics in [`EPICS.md`](./EPICS.md) execute this plan one at a time.

**North star:** Every screen answers “What should I do next?” Cool ink structure, ember only for the primary action. Two workspaces under one brand — not one generic SaaS shell.

---

## Phase 1 — Foundation (done)

| Epic | Outcome |
|------|---------|
| E12 | Brand-first landing + editorial jobs + sticky apply rail |
| E13 | Applicant journey Ready → Profile → Resume → Apply |
| E14 | Recruiter attention queue + candidate drawer |
| E15 | Shared empty / loading / error / success kit |
| E16 | Role density + motion (stagger, stage-flash, compact toggle) |

---

## Phase 2 — Depth (next)

Ordered by demo impact and trust.

### E17 — Dual workspace shell
- **Goal:** Recruiter and applicant chrome feel like different products that share Rolefit.
- **Accept:** Distinct nav density, header treatment, and home CTA language per role; public shell stays light.
- **Status:** done

### E18 — Ranking explainability
- **Goal:** Score always pairs with “why” and one-click pipeline move.
- **Accept:** Ranking cards show matched/gap skills + AI summary without accordion; advance from ranking.
- **Status:** done
- **Why:** AI trust is the product differentiator.

### E19 — Recruiter job authoring flow
- **Goal:** Posting a role feels guided, not admin CRUD.
- **Accept:** Sectioned job form (basics → skills → hiring prefs → publish); live preview of public card.
- **Why:** First recruiter action after signup.
- **Status:** done

### E20 — Accessibility & keyboard hiring
- **Goal:** Pipeline and drawer usable without a mouse; focus rings consistent.
- **Accept:** Keyboard stage advance shortcuts documented; skip links; drawer focus trap; contrast check on ember/ink.
- **Why:** Professional HR tools must be operable under pressure.
- **Status:** done

### E21 — Mobile applicant polish
- **Goal:** Apply + readiness work one-thumb on small screens.
- **Accept:** Journey stepper wraps cleanly; apply wizard sticky primary CTA; profile sections collapse on mobile.
- **Why:** Candidates often apply on phones.
- **Status:** planned

---

## Design rules (non-negotiable)

1. **One job per screen** — if two headlines, split.
2. **Next action is ember** — one primary CTA.
3. **Cards only for interaction** — not decoration.
4. **Explain AI** — score + matched/missing language together.
5. **Respect density** — applicant spacious; recruiter dense.
6. **Reduced motion** — honor `prefers-reduced-motion`.

---

## Blocked

- **E7b Live production cutover** — needs Atlas URI + Render account (not UX-blocked).

---

## How we ship

1. Mark epic `in_progress` in `EPICS.md`.
2. Implement only that epic.
3. Update `CHANGELOG.md` → one commit → push (session pattern).
