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

## Phase 2 — Depth (done)

| Epic | Outcome |
|------|---------|
| E17 | Dual workspace shell |
| E18 | Ranking explainability |
| E19 | Guided job authoring |
| E20 | Accessibility & keyboard hiring |
| E21 | Mobile applicant polish |

---

## Phase 3 — Craft & trust (next)

Ordered by demo clarity and craft.

### E22 — Light theme + resume craftsmanship
- **Goal:** App reads clearly in light mode; resume build → PDF → apply feels one craft.
- **Accept:** Landing/auth/shell light and readable; resume 4-step wizard with required dates/dropdowns; PDF uses readable dates + file named `{Applicant Name}.pdf`.
- **Status:** done

### E23 — Recruiter mobile pipeline
- **Goal:** Pipeline/ranking usable on phone (stacked columns or stage tabs; sticky stage actions).
- **Accept:** No horizontal-only kanban trap under 600px; advance/reject reachable one-thumb.
- **Status:** in_progress

### E24 — Applicant apply trust
- **Goal:** Apply wizard shows readiness + resume preview confidence before submit.
- **Accept:** Ready step mirrors live checklist; attached Rolefit resume shows name filename; clear post-submit next step.
- **Status:** planned

### E25 — Demo narrative polish
- **Goal:** Recruiter Decisions → Ranking → Pipeline and Applicant Ready → Apply tell one story without dead ends.
- **Accept:** Empty states + CTAs point to the next demo beat; seed/demo copy still works.
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
