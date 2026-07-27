# Paceup — Current Build Scope & Future Roadmap

> This document separates what's being built now (MVP, as scoped across the 52 build phases) from what's intentionally deferred — and lays out the longer-term path from a student-focused free tool to a monetizable product for professional teams.

---

## 1. WHAT'S BUILT NOW (MVP SCOPE)

### Core Product Loop
- Project creation (wizard) with AI-generated task breakdown, milestone planning, and skill-based assignment with stated rationale
- Project-specific member skillset intake, separate from a persistent Global Profile
- Resume upload with AI-parsed experience summary (editable, optional but encouraged)
- Daily standup check-ins with AI-generated team summaries and blocker extraction
- Task board (Kanban + list) with ownership tracking, dependencies, and reassignment
- Submission tracking with lint/test-based checks plus labeled AI commentary (not authoritative verdicts)
- Workload balance visibility with AI rebalancing suggestions (human-confirmed, never silent)
- Project Memory as a structured, searchable decision/event log (semantic search via pgvector)
- Final Submission Checklist with AI readiness cross-checks

### Identity & Team System
- Unique searchable handles for exact-match, request-based team invites
- Dual invite system: handle-search (existing users) + link/code (new users)
- Global Profile as persistent identity, distinct from per-project skillsets

### Platform Foundations
- BYOAI model (Google Gemini, OpenAI, Anthropic, OpenRouter, Groq) — zero AI cost to the platform
- Encrypted, never-replotted API key storage
- Supabase Storage for docs/resumes/submissions
- Dark, neon-accented design system with a consistent, restrained motion language

### What's Explicitly NOT in MVP (Deferred by Design)
- Full AI-authoritative code review (starts as lint/test + labeled suggestions only)
- Predictive risk modeling (starts as rule-based heuristics, not ML-driven probability)
- Real-time collaboration (Socket.IO) — polling/LISTEN-NOTIFY only at launch
- Multi-agent orchestration (LangGraph) — single-shot AI SDK calls only at launch
- GitHub repo-aware code review (submissions are file/upload-based initially)
- Any paid tier — MVP is entirely free (BYOAI-funded)

---

## 2. NEAR-TERM IMPROVEMENTS (POST-MVP, 0–6 MONTHS AFTER LAUNCH)

- **GitHub Integration**
- Repo-aware submissions instead of manual file uploads
- AI code review with actual diff/architecture context, not isolated file snapshots
- Auto-import of tech stack and contribution activity from linked repos
- Optional: use GitHub commit activity as one more (non-dominant) signal in the composite contribution model

- **Real-Time Layer**
- Introduce Socket.IO (or equivalent) once usage patterns justify it — live task board updates, live standup check-in status without polling delay

- **Deeper Risk Detection**
- Move from rule-based heuristics toward a validated predictive model, once enough real project data exists to avoid shipping an unvalidated "completion probability" number

- **Post-Mortem / Retrospective Generator**
- AI-generated, shareable project summaries at submission — doubles as an organic growth loop (students sharing their retrospective) and a lightweight portfolio artifact

- **Instructor/TA Dashboard (Opt-In)**
- Visibility into team dynamics for grading fairness — the most promising near-term university wedge, doesn't require a full institutional sales cycle to start testing

- **Notification/Reminder Refinement**
- Tune cadence based on real usage data — the "don't be annoying" design goal needs live feedback loops, not just design-time assumptions

---

## 3. MID-TERM ROADMAP (6–18 MONTHS)

- **Multi-Agent Architecture (LangGraph)**
- Split the monolithic AI logic into a supervisor/sub-agent pattern: Planner, Standup Summarizer, Risk Flagger, Code Reviewer — more debuggable, cheaper per-call, less prone to compounding hallucination

- **Expanded Integrations**
- Google Drive/Docs (auto-pull requirement/design docs instead of manual upload)
- Discord/Slack (meet teams where they already communicate)
- Calendar sync (deadline/milestone awareness outside the app)
- Overleaf (for research-oriented teams writing papers)
- LMS integrations (Canvas/Moodle) — prerequisite for serious university adoption

- **University Pilot Program**
- Cohort management tools, SSO, data-processing agreements — this is a 12+ month sales cycle, should start conversations early even if the product isn't fully ready
- Requires finalized data-retention disclosures per AI provider (extension of the Security & Privacy page work)

- **Hackathon Organizer Tier**
- Event-wide dashboards, multi-team visibility for organizers, potentially white-labeled

- **Managed AI Tier (No BYOAI Required)**
- For teams unwilling/unable to manage their own API key — platform takes a model margin here, first real non-institutional revenue stream

---

## 4. LONG-TERM VISION (18+ MONTHS): STUDENT → PROFESSIONAL MARKET

The BYOAI, student-first MVP is the wedge — not the ceiling. The same core loop (AI that actively leads a team instead of passively organizing tasks) generalizes well beyond coursework:

- **Small Professional Dev Teams / Agencies**
- Same pain (unclear ownership, missed deadlines, lost context) exists in early-stage startups and small agencies — these teams *will* pay for a managed AI PM, unlike students
- Would likely need: deeper integrations (Jira/Linear import for teams transitioning from existing tools), more robust audit/compliance features, SLA-backed reliability

- **Bootcamps & Coding Academies**
- A natural bridge market between students and professionals — cohort-based, willing to pay institutionally (similar sales motion to universities but often faster to close), and their students eventually become professional users who already know the product

- **Freelance/Remote Team Coordination**
- Extending the "AI leader" concept to distributed freelance teams who lack a natural project manager — a genuinely underserved segment

### Monetization Evolution
| Stage | Model |
|---|---|
| MVP (students) | Free, BYOAI |
| Post-MVP | Free tier stays; Managed AI tier introduced (usage-based margin) |
| Mid-term | University/Bootcamp institutional licenses (seat or cohort-based) |
| Long-term | Professional team tier (per-seat SaaS pricing, SLA, deeper integrations) — this is where the real recurring revenue lives |

### Product Moat (Compounding Advantages)
- **Assignment-quality data loop** — thousands of accepted/edited/rejected AI task assignments across real teams improve heuristics in a way a generic PM tool can't replicate without the same longitudinal data
- **Repo-aware, longitudinal code understanding** (post-GitHub integration) — compounds over a team's history, hard to copy cold
- **Instructor-trust layer** — a genuine wedge into universities that incumbents (Notion, Asana, ClickUp) have little reason to build authentically
- **Shareable retrospectives** — organic, low-cost growth loop that also builds a public trail of product credibility

---

## 5. OPEN QUESTIONS TO REVISIT AS THE PRODUCT MATURES

- At what usage threshold does real-time (Socket.IO) actually become necessary, versus staying on polling?
- How much AI provider data-retention risk is acceptable before universities will sign on — does this require negotiating enterprise agreements with providers directly?
- Should the Managed AI tier launch before or after the university pilot — which unlocks the other faster?
- How should the composite contribution model evolve once real usage data exists — is the current signal mix (tasks, standups, submissions) sufficient, or does it need weighting refinement?
- At what point does GitHub integration become required rather than optional for the product to feel credible to a professional audience?

---

This document should be revisited at the end of each major build phase to re-confirm what's actually shipped versus what's still aspirational.
