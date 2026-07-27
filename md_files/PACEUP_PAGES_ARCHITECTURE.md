# Paceup — Full Page Architecture, Decisions & Workflow Reference

> This document is the single source of truth for every product, design, and architecture decision made during design. It covers the complete tech stack, the design system, every page's contents, and the data/workflow relationships between pages.

---

## 1. TECH STACK (FINAL)

| Layer | Choice | Notes |
|---|---|---|
| Language | TypeScript | Used across frontend and backend |
| Framework | Next.js (App Router) | Server components + server actions |
| Styling | Tailwind CSS + shadcn/ui | Custom-skinned, not themed defaults |
| Animation | Framer Motion + Lenis | Motion signals state change only; Lenis for smooth scroll on marketing pages |
| Database | PostgreSQL (Neon) + pgvector | pgvector powers Project Memory semantic search |
| ORM | **Drizzle** | Chosen over Prisma — lighter, pairs better with pgvector and serverless |
| Auth | **Better Auth** | Chosen over Clerk — needed full control for custom handle/invite system |
| OAuth Providers | Google, GitHub | GitHub prioritized — dev-focused user base, future GitHub data reuse |
| AI Orchestration (MVP) | Vercel AI SDK | Handles BYOAI multi-provider abstraction, streaming, tool calling |
| AI Orchestration (Later) | LangGraph | Introduced only once multi-agent supervisor pattern is needed (post-MVP) |
| Background Jobs | Trigger.dev | All long-running AI tasks (breakdown, review, risk analysis) run here, off the request/response cycle |
| Storage | **Supabase Storage** | Final decision — docs, resumes, code/design submissions |
| Notifications/Email | Resend | Reminders, invites |
| Rate Limiting/Cache | Upstash Redis | Used to rate-limit handle-search invites (anti-spam/enumeration) |
| Real-time | Deferred (MVP) | Polling / Postgres LISTEN-NOTIFY instead of Socket.IO for MVP |
| Validation | Zod | Especially critical for validating AI-generated JSON before DB writes |
| Hosting | Vercel | Frontend + serverless functions |
| Icons | Lucide-react | Line-style icons, consistent with prior portfolio work |

### Explicit Divergence Note
This project (**Paceup**) intentionally diverges from an earlier, separate Paceup conversation's stack (which had used Prisma, Clerk, Next.js 14 specifically). This document reflects **only the decisions made in this conversation** — Drizzle, Better Auth, and Supabase Storage are the confirmed choices going forward for this build.

---

## 2. DESIGN SYSTEM

### 2.1 Color System
| Token | Purpose |
|---|---|
| Background base (deep charcoal-black, not pure black) | Page background |
| Surface layer (slightly lifted) | Cards |
| Elevated surface (lighter again) | Modals/dropdowns |
| Toxic green | Primary action, "AI active/at rest" states, success |
| Cold electric blue | Informational, links, secondary actions |
| Molten gold/amber | Warnings, deadline pressure, "needs your decision" |
| Danger red (sparing, not oversaturated) | Overdue tasks, blockers, critical risk ONLY — never decorative, never used for AI system errors |
| Off-white | Primary text |
| Mid-gray | Secondary/muted text |

**Rule:** each color means one consistent thing app-wide. Green = AI spoke/success. Gold = attention/decision needed. Red = critical only. Gray = system/error/inactive.

### 2.2 Typography
- Display/headline font: geometric/technical sans (headlines, big numbers)
- Body font: highly legible sans (daily content)
- Monospace accent: tech tags, code snippets, handles/IDs
- Max 2 font families (mono can be a variant)

### 2.3 Spacing, Radius, Elevation
- 4px base spacing unit
- Moderate border radius (not fully rounded/pill-shaped)
- **Glow over shadow** for elevation — soft accent-colored box-shadow instead of gray drop shadows, used sparingly (hover/active/AI-moments only)

### 2.4 Iconography
- Lucide-react, line-style

### 2.5 Motion Principles
- Micro-interactions: 150–250ms
- Page/section/modal transitions: 300–400ms
- Motion always signals state change — never idle decoration
- Landing page has the most motion license (one-time impression page); daily-use pages (Dashboard, Tasks, Standup Feed) stay calm and fast
- No motion on static/unread content; only on new/changed content

### 2.6 Component Philosophy
- Flat + glow, not glassmorphism (avoids fighting neon accents, keeps dashboard legibility high)
- Thin, low-opacity borders for structure instead of heavy shadows

### 2.7 AI Visual State System
| State | Visual Treatment | Used For |
|---|---|---|
| AI Thinking | Pulsing green glow + rotating status text | Generation in progress (breakdown, summaries, review) |
| AI-Generated Content (at rest) | Green left border + glyph, one-time stagger fade-in | Task descriptions, summaries, standup recaps |
| AI Rationale Callout | Indented inline block, green border, mono/italic lean | "Why this task was assigned to you" |
| AI Suggestion (actionable) | Gold accent, Accept/Dismiss card | Rebalancing, reassignment proposals — never auto-applies |
| AI Uncertainty | Dashed border, muted/desaturated accent, "low confidence" tag | Ambiguous requirements, low-confidence risk/code review points |
| AI Error | Neutral gray, retry action | Failed generation, provider key issue |

**Consistency rule:** Green = AI spoke (at rest). Gold = AI needs your decision. Dashed/muted = AI isn't sure. Gray = AI couldn't do it. Red is reserved exclusively for project risk — never for AI system states.

---

## 3. KEY ARCHITECTURAL DECISIONS & CHANGES MADE DURING THIS CONVERSATION

| # | Decision | Reasoning |
|---|---|---|
| 1 | ORM: Drizzle over Prisma | Lighter, better fit with pgvector queries and serverless/edge environments |
| 2 | Auth: Better Auth over Clerk | Full control needed for custom searchable-handle + invite-request system |
| 3 | Storage: Supabase Storage finalized | Simplicity, Postgres-adjacent infra alignment with Neon |
| 4 | OAuth: Google + GitHub added | Lower signup friction; GitHub aligns with developer user base and enables future profile data reuse |
| 5 | Unique handle system added | Enables search-based team invites (not just link/code), but requires exact-match search only (privacy/spam protection) — NOT fuzzy name search |
| 6 | Dual invite system (handle-search + link/code) kept | Handle-search only works for existing users; link/code needed for people not yet registered |
| 7 | Invite rate-limiting (Upstash Redis) added | Prevents handle-search invite spam/enumeration abuse |
| 8 | Project-specific skillset separated from Global Profile | AI task assignment should reflect what a member is bringing to THIS project, not a static global tag cloud |
| 9 | Global Profile pre-fills project skillset intake | Reduces repeated data entry while preserving per-project accuracy |
| 10 | Resume upload added to Member Profile Setup (not Project Wizard) | Resume is about the person joining, not the project itself — belongs in the per-project member intake step |
| 11 | AI resume parsing produces an editable summary card | Member must confirm/correct AI-extracted experience before it's stored — avoids silent misrepresentation |
| 12 | Code review scoped to lint/test-pass-fail first, LLM commentary second | Reduces hallucination risk; raw LLM "verdicts" on code are unreliable without execution context |
| 13 | AI never auto-reassigns or auto-applies changes | All AI suggestions (workload rebalancing, task reassignment) require explicit human Accept — "propose, don't silently act" |
| 14 | Contribution evaluation uses a composite signal, not a single score | Avoids gaming and avoids being misused as an opaque "grade" |
| 15 | Socket.IO deferred for MVP | Real-time collapsed to polling/Postgres LISTEN-NOTIFY — reduces early ops complexity |
| 16 | LangGraph deferred to post-MVP | Vercel AI SDK alone handles MVP's single-shot AI tasks; multi-agent orchestration only needed once Planner/Standup/Risk agents are split out |
| 17 | Three.js excluded from the app itself | Reserved only for the personal portfolio; too heavy for a daily-use dashboard, hurts performance and gets old with repeat use |
| 18 | Landing page hero gets the most motion license; workspace pages stay calm | Prevents "smooth but not too much" from tipping into distraction on daily-use surfaces |
| 19 | Danger Zone actions (delete project/account) require typed confirmation | Matches the weight of a genuinely destructive action |
| 20 | Final Submission confirmation uses green/celebratory tone, not red/alarming | It's a completion milestone, not a destructive action — distinct from Danger Zone despite both requiring confirmation |

---

## 4. PAGE-BY-PAGE REFERENCE

### 4.1 Public / Marketing

**Landing Page**
- Sections: Nav, Hero (ambient animation), Problem, Solution/How It Works (4-step), Feature Highlights, Why Not Trello/Notion, Trust Strip, Social Proof, Final CTA, Footer
- Motion: highest license on the site — one hero entrance + scroll-triggered staggered reveals, single continuous ambient background animation
- Links to: How It Works, Pricing, Security, Sign Up

**How It Works / Product Page**
- Sections: Header, 4-stage deep dive (alternating layout), Feature Grid, Comparison Table (Paceup vs Trello/Notion/Jira), FAQ accordion, Final CTA, Footer
- Motion: calmer than landing — one reveal per section, accordion expand/collapse only

**Pricing Page**
- Sections: Header, 3 pricing cards (Free — emphasized; Managed AI — coming soon, muted; University/Teams — coming soon, muted), Why Free explainer, Free-tier usage clarification, FAQ, Final CTA, Footer
- Motion: near-static; hover-lift + glow on cards only

**Security & Privacy Page**
- Sections: Header, Core Promises strip, API Key Protection deep-dive, Uploaded Content Handling, Data Isolation Between Teams, Account/Data Deletion, University callout, Contact
- Motion: minimal — fade-in only

---

### 4.2 Auth

**Sign Up**
- Fields: Google/GitHub OAuth (primary), email/password (secondary), name, handle (auto-suggested, live availability check), terms acknowledgment
- Workflow: On submit → creates Better Auth user + handle record → routes to Projects Hub (or Join Team flow if arriving via invite context)

**Log In**
- Fields: Google/GitHub OAuth, email/password, forgot password
- Fastest, least decorative page in the app

**Join Team**
- Workflow: Link (pre-resolved token) or manual code entry → resolves project preview card → routes into Sign Up/Log In (context preserved) → Accept & Join confirmation → routes into Member Profile Setup

---

### 4.3 Onboarding

**Create Project Wizard** (5 steps + review)
1. Project Details (title, problem statement, solution, scope, type, deadline)
2. Tech Stack (tag input)
3. Supporting Documents (skippable, Supabase Storage upload)
4. Invite Team (skippable — handle-search OR link/code, dual path)
5. AI Provider Connection (provider select, key input/encryption, owner-only vs per-member policy)
6. Review & Create → triggers AI Breakdown Engine (Phase 22 in build doc) → routes to AI Breakdown Review Screen

**Member Profile Setup** (runs per joining member, separate from Global Profile)
1. Skills for This Project (pre-filled from Global Profile, editable, confidence levels, role preference, interests)
2. Availability & Commitment (weekly hours, other-commitment flag, timezone if needed)
3. Resume Upload (optional, "highly recommended," AI-parsed editable summary)
4. Review & Join → confirms membership, feeds data into AI Breakdown Engine

**AI Breakdown Review Screen**
- Flow: AI Thinking state (rotating status lines) → staggered reveal of Module Overview, Milestone Timeline, Task List (grouped by module, each with assignee + AI Rationale Callout) → Workload Balance Indicator
- Actions: Reassign (inline dropdown), Edit, Regenerate (with feedback note), Confirm & Start Project
- Edge case: incomplete member profiles show a "pending profile" tag on affected task assignments (AI Uncertainty treatment)

---

### 4.4 Core Workspace (per project)

**Project Dashboard** (home base, most-visited)
- Sections: Header strip (progress %, deadline), Today's Standup Status + AI summary, Ownership Map, Milestone Timeline, Active Blockers/Risk panel, Recent Activity feed, Quick Actions
- Motion: single calm load fade-in; live updates get a subtle highlight pulse only; progress bar animates smoothly on value change

**Tasks / Board View**
- Views: Kanban (To Do / In Progress / In Review / Done) and List
- Task cards: name, module tag, assignee, AI glyph if rationale unread, effort, due date, status dot
- Task Detail Panel (side drawer): description, AI Rationale Callout, reassign, linked submissions, comments, dependency indicator
- Motion: drag-and-drop is the signature interaction (smooth reposition + glow lift); no idle animation

**Standup Feed**
- Check-in form (3 fields: yesterday/today/blockers), mirrored on Dashboard
- AI Daily Summary pinned above chronological feed (grouped by day)
- Blocker-flagged entries get gold left-border; non-checked-in members shown as visible placeholder rows
- Filter by member / blockers-only; streak indicator (private, not a public leaderboard)

**Submissions**
- List filtered by status (Pending / AI-Reviewed / Needs Revision / Approved)
- Detail drawer: file preview, linked task, AI Review section (lint/test results first, then labeled LLM commentary, low-confidence points get dashed/muted treatment), mismatch handling message, human Approve/Request Changes/Comment actions, revision history

**Team Page**
- Member grid: workload indicator, project-specific skill chips, standup consistency dots, composite contribution chips (not a single score)
- Workload Balance Summary section with AI rebalancing suggestion cards (gold, Accept/Dismiss)
- Member Detail drawer, Pending Invites section

**Project Memory / Decisions Log**
- Semantic search bar (pgvector-backed) at top
- Timeline view grouped by week/milestone: Decision, Architecture Note, Milestone Reached, Issue/Resolution, AI Summary entry types (icon-coded, not color-heavy)
- Manual "Add Note" for out-of-app decisions
- Calmest page in the app by design — no motion on historical scroll

**Final Submission Checklist**
- Readiness indicator, checklist sections (Documentation/Code/Presentation/Report/Testing/Required Deliverables) with AI notes
- Missing Items panel (prominent, actionable links)
- AI Final Summary, Team Sign-Off checkboxes
- "Mark Project as Submitted" (green/celebratory confirmation, not red/alarming)
- Post-submission: archives, prompts Post-Mortem/Retrospective generation

---

### 4.5 Settings

**Project Settings Tab:** basic info editing, team/access management, AI provider policy toggle, Danger Zone (archive/delete, typed confirmation)
**Account Settings Tab:** profile, notification preferences (frequency, quiet hours, channel toggles), connected accounts, account deletion
**API Key Management Tab:** key list (masked, never re-shown), add/remove/rotate, per-project key assignment display

---

### 4.6 Utility Pages

**Projects Hub:** project card grid (progress, deadline proximity, role badge, avatars), sort/filter, pending invites banner, archived section, empty state (Create vs Join CTAs)
**Notifications Center:** filtered list (All/Unread/Invites/Reminders/AI Suggestions/Mentions), inline AI Suggestion actions, empty state
**Invites & Requests:** Received tab (Accept/Decline) and Sent tab (status: Pending/Accepted/Declined/Expired, resend/revoke)
**Global Profile:** handle (copy-to-clipboard), bio, links (GitHub/LeetCode/etc.), global skillset (canonical source for project pre-fill), activity overview (GitHub/LeetCode reuse), project history, privacy controls

---

## 5. CROSS-PAGE WORKFLOWS

### 5.1 Project Creation → First AI Moment
```
Create Project Wizard (Steps 1–5)
        ↓
Review & Create
        ↓
AI Breakdown Engine (background job, Trigger.dev)
        ↓
AI Breakdown Review Screen (AI Thinking → Reveal → Edit/Confirm)
        ↓
Project Dashboard (live workspace begins)
```

### 5.2 Team Invitation (Dual Path)
```
Path A — Existing User:
Team Page / Wizard Step 4 → Search Handle (exact match) → Invite Sent
        ↓
Recipient's Notifications Center + Invites & Requests (Received tab)
        ↓
Accept → Member Profile Setup → joins live project

Path B — New User:
Team Page / Wizard Step 4 → Generate Link/Code → Shared externally
        ↓
Recipient opens Join Team page → Preview card → Sign Up/Log In
        ↓
Accept & Join → Member Profile Setup → joins live project
```

### 5.3 Daily Accountability Loop
```
Standup Feed / Dashboard check-in prompt
        ↓
Check-in submitted → feeds Standup Feed + Blocker data
        ↓
AI Daily Summary job (Trigger.dev, once threshold of check-ins met)
        ↓
Summary surfaces on: Standup Feed (pinned) + Dashboard (status strip)
        ↓
Blockers surface on: Dashboard Risk Panel + Task Detail (dependency context)
```

### 5.4 Submission → Review → Task Closure
```
Task Detail Panel → "Submit Deliverable" → Submissions page (new entry, Pending)
        ↓
AI Review job (Trigger.dev): lint/test run → LLM commentary
        ↓
Submission Detail drawer shows AI Review (pass/fail + labeled suggestions)
        ↓
Human reviewer: Approve / Request Changes
        ↓
Approve → Task status moves to Done → Dashboard progress % recalculates
Request Changes → Task stays In Review → Revision History entry added
```

### 5.5 Workload Rebalancing
```
Task backend logic recalculates workload on every assignment/completion change
        ↓
Threshold exceeded → AI Suggestion generated (Trigger.dev)
        ↓
Surfaces on: Team Page (Workload Balance Summary) + Notifications Center
        ↓
Human Accept → Task reassignment logic runs (same engine as manual reassign)
Human Dismiss → suggestion cleared, no action taken
```

### 5.6 Project Memory Population
```
Every major event (milestone reached, decision logged, issue resolved, weekly cycle)
        ↓
Written to structured event log (Postgres, source of truth)
        ↓
Periodic AI summarization job → embedded via pgvector (summaries, not raw logs)
        ↓
Surfaces on: Project Memory page (timeline + semantic search)
```

### 5.7 Final Submission
```
Final Submission Checklist page
        ↓
AI cross-checks: Tasks (Done status) + Submissions (Approved status) + Documentation presence
        ↓
Missing Items panel populated → links back to Tasks/Submissions to resolve
        ↓
All critical items green + Team Sign-Off → "Mark Project as Submitted" enabled
        ↓
Confirmation → Project status = Completed (reflected in Projects Hub)
        ↓
Prompt: Generate Post-Mortem/Retrospective (future growth-loop feature)
```

---

## 6. DATA MODEL RELATIONSHIPS (CONCEPTUAL, NOT SCHEMA-LEVEL)

- **User** → has one **Global Profile** (handle, skills, links) → can belong to many **Projects** (via **ProjectMembership**)
- **ProjectMembership** → has one **Project-Specific Skillset** (separate from Global Profile) + **Availability** + optional **Resume Summary**
- **Project** → has many **Modules** → has many **Tasks** → each Task has one **Assignee** (ProjectMembership) + **AI Rationale** + many **Submissions**
- **Project** → has many **StandupEntries** (per member, per day) → aggregated into **AI Daily Summaries**
- **Project** → has many **MemoryEntries** (Decision/Architecture/Milestone/Issue/AI Summary) → embedded via pgvector
- **Project** → has many **Invites** (handle-based or link/code-based) with status tracking
- **User** → has many **APIKeys** (encrypted, provider-scoped), assignable per Project per the AI Provider Policy

---

This document should be treated as the canonical reference for all future build, design, or scope decisions on Paceup — any new decision should be appended here to keep it current.
