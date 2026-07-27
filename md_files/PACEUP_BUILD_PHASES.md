# Paceup — Phased Build Instructions (for Antigravity)

> This document breaks the full build into small, sequential phases. Each phase is scoped to one page, one feature slice, or one logic layer — never bundled. Complex pages are deliberately split across multiple phases (UI vs. logic vs. AI integration).
>
> Each phase includes a **ready-to-use build prompt** you can paste directly into Antigravity for that phase.
>
> **Agent notes are for the builder's own reference only** — not instructions for Antigravity itself, just a guide for which agent tends to fit that type of phase.
>
> Agents referenced: **Gemini Flash 3.5 High**, **Gemini 3.1 Pro**, **Claude Sonnet 4.5**, **Claude Opus 4.5**

---

## Phase 0 — Project Setup & Tooling
**Objective:** Scaffold the project foundation before any page work begins.
**Deliverables:**
- Next.js (App Router) + TypeScript project init
- Tailwind CSS + shadcn/ui installed and configured
- Drizzle ORM connected to Neon PostgreSQL, pgvector extension enabled
- Better Auth installed and configured (base setup, no custom flows yet)
- Supabase Storage bucket configured
- Resend, Upstash Redis, Trigger.dev accounts/config wired in
- Base folder structure and environment variable scaffolding

**Build Prompt:**
> Initialize a new Next.js project using the App Router and TypeScript for a project called Paceup. Set up Tailwind CSS and install shadcn/ui with no theme presets applied yet (we will apply a custom dark neon theme in the next phase). Configure Drizzle ORM connected to a Neon PostgreSQL database, and enable the pgvector extension on that database. Install and configure Better Auth with a base email/password provider (no custom UI yet). Set up a Supabase Storage client for later file uploads. Configure Resend for transactional email, Upstash Redis for rate limiting, and Trigger.dev for background jobs. Create a clean folder structure separating app routes, components, lib/server logic, and db schema. Set up a `.env.example` file listing all required environment variables without values.

*(Agent reference: Claude Opus 4.5 — architecture-heavy, foundational decisions)*

---

## Phase 1 — Design System Implementation
**Objective:** Build the reusable design token layer before any page is styled.
**Deliverables:**
- Color tokens (near-black background layers, off-white text, neon accents: green/blue/gold/red) as Tailwind config + CSS variables
- Typography scale (display font, body font, mono accent)
- Spacing/radius/elevation (glow-based, not shadow-based) tokens
- Framer Motion + Lenis installed, base motion duration/easing presets defined
- Lucide-react icon set confirmed

**Build Prompt:**
> Build the design token system for Paceup as CSS variables and a Tailwind config extension. Use a dark theme: layered near-black backgrounds (base background, card surface, elevated surface — each a step lighter than the last, not pure black). Define four accent colors as CSS variables: toxic green (primary/success), cold electric blue (informational), molten gold/amber (warning/attention), and a sparing danger red (critical only). Text colors: off-white for primary text, mid-gray for muted/secondary text. Define a spacing scale on a 4px base unit, moderate border-radius tokens (not fully rounded), and glow-based elevation using soft colored box-shadows instead of gray drop shadows. Set up two font families (a geometric/technical display font and a highly legible body font) via next/font. Install Framer Motion and Lenis, and create a shared motion presets file exporting standard durations (150–250ms for micro-interactions, 300–400ms for page/modal transitions) and easing curves. Install lucide-react as the icon library. Do not build any pages yet — this phase only establishes the reusable token/config layer.

*(Agent reference: Gemini 3.1 Pro — strong at design-system-level consistency)*

---

## Phase 2 — AI Visual State Components
**Objective:** Build the reusable AI-state components used across nearly every later page.
**Deliverables:**
- AI Thinking component (pulsing glow + rotating status line)
- AI-Generated Content wrapper (green left-border + glyph + stagger fade-in)
- AI Rationale Callout component
- AI Suggestion card (gold, Accept/Dismiss actions)
- AI Uncertainty state (dashed border, muted tone)
- AI Error/couldn't-complete state (gray, retry action)

**Build Prompt:**
> Using the design tokens and motion presets from Phase 1, build six reusable React components representing AI visual states, to be used across the whole app: (1) `AiThinking` — a container with a slow pulsing green glow border and a rotating line of status text passed in as a prop array (e.g., "Analyzing scope...", "Balancing workload..."); (2) `AiGeneratedContent` — a wrapper with a thin green left border and a small AI glyph icon in the corner, that stagger-fades in once on mount and then stays static; (3) `AiRationaleCallout` — an indented inline block with a green left border and a slightly mono/italic text treatment, for short "why this happened" explanations; (4) `AiSuggestionCard` — a gold-accented card with Accept and Dismiss action buttons, used for actionable AI proposals that should never auto-apply; (5) `AiUncertainty` — a wrapper with a dashed border and desaturated/muted accent color plus a small "Low confidence" tag; (6) `AiErrorState` — a neutral gray state with a short message and a Retry button. Each component should be self-contained, themeable via the CSS variables from Phase 1, and accept children/props for content. Include basic Storybook-style usage examples or a simple demo page at `/dev/ai-states` so all six can be visually reviewed together.

*(Agent reference: Claude Sonnet 4.5 — component logic + consistent styling)*

---

## Phase 3 — Auth: Sign Up Page
**Deliverables:** Centered card layout, Google + GitHub OAuth buttons, email/password fallback, live handle-availability check UI, terms acknowledgment linking to Security page.

**Build Prompt:**
> Build the Sign Up page for Paceup at `/signup`. Layout: a centered card on the dark theme background, no full navigation bar (just a logo linking back to the landing page). Include "Continue with Google" and "Continue with GitHub" buttons above a divider, followed by email, password, and name fields as a fallback. Below that, add a handle-claiming field: auto-suggest a handle from the name or GitHub username once available, show a live availability check as the user types (debounced), with a green check icon if available and a red "taken" indicator if not — call a placeholder `/api/handle/check` endpoint for this. Include a small terms/privacy acknowledgment line linking to `/security`. Primary CTA button: "Create Account". Include a small link at the bottom to the Log In page. Use the design tokens and motion presets from Phase 1 — field focus states should get a subtle green glow border, and the handle availability check should animate from a checking state to a resolved state using a brief pulse-then-settle transition.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 4 — Auth: Handle System Backend
**Deliverables:** Unique handle generation logic, availability-check API, GitHub-username pre-fill on OAuth signup, handle uniqueness constraint in DB schema.

**Build Prompt:**
> Build the backend handle system for Paceup. Add a `handle` column (unique, indexed) to the user schema in Drizzle. Create an API route `/api/handle/check` that accepts a candidate handle and returns whether it's available, with validation for allowed characters and length. Create a handle auto-suggestion function that generates a candidate handle from a display name (lowercased, no spaces, numeric suffix if taken) and, separately, one that prefers the GitHub username directly when a user signs up via GitHub OAuth. Wire this into the Better Auth signup flow so a suggested handle is available to pre-fill on the Sign Up page from Phase 3. Ensure handle lookups are case-insensitive but stored in a normalized form.

*(Agent reference: Claude Opus 4.5 — core identity logic other features depend on)*

---

## Phase 5 — Auth: Log In Page
**Deliverables:** Matching centered card, OAuth + email/password, forgot-password link.

**Build Prompt:**
> Build the Log In page for Paceup at `/login`, visually matching the Sign Up page's centered card layout for consistency. Include "Continue with Google" and "Continue with GitHub" buttons, a divider, then email and password fields with a "Forgot password" link. Primary CTA: "Log In". Small link at the bottom to the Sign Up page. Keep this page as lightweight and fast as possible — minimal motion, only standard field focus states, no extra animation flourishes, since this will be opened frequently by returning users.

*(Agent reference: Gemini Flash 3.5 High — simple, low-risk page)*

---

## Phase 6 — Auth: Join Team Page
**Deliverables:** Link-token resolution + preview card, manual code-entry fallback, routes into Sign Up/Log In with invite context preserved, Accept & Join confirmation step.

**Build Prompt:**
> Build the Join Team page for Paceup at `/join/[token]` (for link-based invites) and `/join` (for manual code entry). When a valid token/code resolves, show a preview card with the project title, project type, team size, and deadline, fetched from a placeholder `/api/invites/resolve` endpoint. Below the preview, show either "Sign up to join" or "Log in to join" depending on auth state, routing into the Phase 3/Phase 5 auth pages while preserving the invite context in a query param or session value so the user returns here after authenticating. Once authenticated, show an explicit "Accept & Join" confirmation button — joining should never happen automatically on account creation. If the code/token is invalid or expired, show a clear error state instead of the preview card.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 7 — Landing Page: Hero + Navigation
**Deliverables:** Sticky nav (transparent-to-solid on scroll), hero headline/subhead, ambient background animation, primary/secondary CTAs.

**Build Prompt:**
> Build the top of the Paceup landing page (`/`): a sticky navigation bar that's transparent over the hero and fades to a solid dark background on scroll, containing the logo/wordmark, links to How It Works / Pricing / Security / Sign In, and a primary "Start a Project" CTA button. Below it, build the hero section with a large display-font headline conveying "AI that leads your team, not just organizes it" (highlight the key phrase in toxic green), a one-line subheadline about the absence of leadership being the real problem, and two CTAs (primary "Start a Project — Free", secondary ghost button "See How It Works"). Add a subtle ambient background animation behind the hero content — soft, slow-moving glow shapes in green/blue/gold at low opacity, built with Framer Motion, continuous but gentle (this is the one place in the app allowed continuous motion). The headline and subhead should stagger-fade in once on page load.

*(Agent reference: Gemini 3.1 Pro — animation/visual-forward)*

---

## Phase 8 — Landing Page: Remaining Sections
**Deliverables:** Problem section, How It Works flow, Feature highlights, "Why not Trello/Notion" section, Trust strip, Social proof placeholder, Final CTA, Footer.

**Build Prompt:**
> Continue building the Paceup landing page below the hero from Phase 7. Add: (1) a Problem section with 4–5 short cards listing pain points (e.g., "Deadlines missed", "Nobody owns the bugs"), each with a faint gold/red-tinted card background, revealing with a staggered scroll-triggered fade-in; (2) a How It Works section showing a 4-step horizontal flow (Create → AI Breaks It Down → Team Gets Assigned → AI Keeps You On Track) with a connecting line that draws in as the user scrolls; (3) a Feature Highlights section with 3–4 alternating left/right blocks (screenshot placeholder + headline + description) for AI Task Assignment, Daily Standups, Progress Dashboard, and Smart Reminders; (4) a short "Why Not Just Use Trello or Notion?" section with one confident differentiating statement; (5) a Trust strip with 3 short icon+statement items about encrypted keys and BYOAI, linking to `/security`; (6) a placeholder Social Proof section; (7) a full-width Final CTA band with a large glowing green button; (8) a muted, quiet Footer with standard links. Each section should fade/slide in once as it scrolls into view, and should not repeat or loop.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 9 — How It Works / Product Page
**Deliverables:** Step-by-step deep dive (4 stages with mocks), feature grid, comparison table vs. Trello/Notion/Jira, FAQ accordion, final CTA.

**Build Prompt:**
> Build the Paceup "How It Works" page at `/product`. Include a short header (title + one-line subhead, simple fade-in only). Then build four full sections, one per core stage — Create Your Project, AI Breaks It Down, Team Gets Matched & Assigned, AI Keeps You On Track — each in an alternating text-left/visual-right or text-right/visual-left layout, with a placeholder UI mock image or component for each, and a single scroll-triggered fade/slide-in per section (no looping motion). Below that, add a condensed feature grid (6–8 items with icon + short label) for quick skimmers. Then add a comparison table with columns Paceup / Trello / Notion / Jira and rows like "Assigns tasks automatically", "Explains reasoning", "Tracks ownership", "Detects blockers", "Free with your own AI key" using checkmarks and dashes. Add an FAQ accordion (collapsed by default) covering: does this replace me as a leader, do I need to pay for AI, is my data safe, what if the AI assigns something wrong, can I use this for hackathons. End with a final CTA band matching the landing page's closing pattern, and the shared footer.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 10 — Pricing Page
**Deliverables:** Free tier card (emphasized), two "coming soon" tier cards (muted treatment), "Why Free?" BYOAI explainer, FAQ, final CTA.

**Build Prompt:**
> Build the Paceup Pricing page at `/pricing`. Header: direct title ("Simple pricing. No AI markup.") with a short subhead. Build three pricing cards: (1) "Free — Student/Team" — emphasized with a slightly larger size and green glow border, listing unlimited projects, AI task breakdown, standups, reminders, dashboard, basic risk flags, priced "$0 forever"; (2) "Managed AI" — marked "Coming Soon" with the muted/desaturated dashed-border treatment from the AI Uncertainty component style, no price, short description of bundled AI usage; (3) "University / Teams" — same coming-soon muted treatment, "Contact Us" CTA instead of a price. Below the cards, add a "Why Free?" section explaining the BYOAI model in plain language, with a small visual showing key → provider → app flow. Add a short section clarifying that usage is only limited by the user's own AI provider's free-tier limits. Add a short pricing-specific FAQ accordion (credit card required? no API key yet? will this stay free for students?). End with the standard final CTA band and footer.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 11 — Security & Privacy Page
**Deliverables:** Core promises strip, API key protection explainer, uploaded content/data handling section, team data isolation section, account deletion section, university callout, contact section.

**Build Prompt:**
> Build the Paceup Security & Privacy page at `/security`. Header: "Your Code. Your Keys. Your Control." with a short subhead, simple fade-in only. Add a Core Promises strip with 3–4 short icon+statement blocks in green (API keys encrypted and never shown again, code never used to train models, you choose your own AI provider, you can delete your data anytime). Add a detailed section explaining API key protection: encrypted before storage, decrypted only momentarily at request time, never logged, never re-displayed after saving, with a simple 3-step visual (Enter key → Encrypted → Used only when needed). Add a section on uploaded code/document handling: where files are stored (Supabase Storage, team-scoped access only), that content is only sent to the user's chosen AI provider when an AI action is triggered (not passively scanned), and an honest note that data retention varies by provider and to check the provider's own terms — do not make blanket guarantees about third-party provider behavior. Add a Data Isolation section confirming role-based access between teams. Add an Account & Data Deletion section explaining what happens on deletion. Add a short "For Universities & Instructors" callout as a placeholder for future data-processing agreements. End with a simple contact/report-a-concern section and the shared footer. Keep motion to a page-load fade-in only throughout.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 12 — Projects Hub Page
**Deliverables:** Project card grid (progress, deadline, role badge, team avatars), sort/filter controls, pending invites banner, archived section, empty state.

**Build Prompt:**
> Build the Paceup Projects Hub page at `/projects`, the post-login landing page for users with existing projects. Header: "Your Projects" title with a "New Project" primary CTA linking to the Create Project Wizard. Build a responsive card grid where each card shows: project title, project type tag, a small stacked cluster of team member avatars, a compact progress bar, a deadline-proximity indicator (neutral by default, gold if approaching soon, red if overdue), a role badge (Owner/Member), and a "last active" relative timestamp. Add sort controls (Recently Active default, Deadline, Progress, Alphabetical) and filter controls (Owned by me / I'm a member / Archived). If the user has pending invites, show a banner at the top linking to the Invites & Requests page. Add a collapsed-by-default Archived Projects section below the active grid. Build an empty state for brand-new users with two clear CTAs side by side: "Create a Project" and "Join a Project" (via code). Cards should fade in on load with hover-lift and subtle glow, no stagger animation needed — this page should feel instant.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 13 — Create Project Wizard: Shell & Navigation
**Deliverables:** Multi-step shell, progress indicator, back/next logic, skip logic, slide transition between steps.

**Build Prompt:**
> Build the shell for the Paceup Create Project Wizard at `/projects/new`. Implement a 6-step wizard container (Details, Tech Stack, Documents, Invite Team, AI Provider, Review) with a top progress indicator showing 6 segments/dots with labels, the current step highlighted in green and completed steps showing a checkmark. Implement Back (ghost button) and Continue (primary green button) navigation at the bottom, where Continue is disabled until the current step's required fields are valid. Steps 3 (Documents) and 4 (Invite Team) should have a visible "Skip" option. Implement step transitions as a horizontal slide (moving forward slides left, moving back slides right) using Framer Motion, at roughly 250ms duration. Do not build the actual step content yet — this phase only builds the container, navigation, and transition logic, with placeholder content in each step.

*(Agent reference: Claude Opus 4.5 — flow/state logic)*

---

## Phase 14 — Wizard Step 1: Project Details
**Deliverables:** Title, problem statement, solution, scope, project type, deadline fields + validation.

**Build Prompt:**
> Build Step 1 of the Paceup Create Project Wizard (Project Details), fitting into the shell from Phase 13. Fields: Project Title (text), Problem Statement (textarea with placeholder example text), Proposed Solution (textarea with placeholder example text), Scope (textarea), Project Type (dropdown: Hackathon / Final-Year Project / Coursework / Club Project / Research), Deadline (date picker). Validate that Title, Project Type, and Deadline are required before Continue is enabled; other fields can be optional but encouraged with helper placeholder text. Use the design tokens from Phase 1 for all inputs, with the standard green glow focus state.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 15 — Wizard Step 2: Tech Stack
**Deliverables:** Tag-style multi-select/search input for tech stack.

**Build Prompt:**
> Build Step 2 of the Paceup Create Project Wizard (Tech Stack). Implement a tag/chip input where users can search from a preset list of common technologies (e.g., React, Next.js, Node.js, Python, PostgreSQL, Flutter, etc.) or type a custom tag and add it. Selected technologies appear as removable chips above the input. Include a short helper line: "This helps the AI understand what your team will be building." No hard requirement to add at least one, but Continue should nudge lightly if empty (non-blocking).

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 16 — Wizard Step 3: Supporting Documents
**Deliverables:** Drag-and-drop upload to Supabase Storage, file chip list, skip option.

**Build Prompt:**
> Build Step 3 of the Paceup Create Project Wizard (Supporting Documents). Implement a drag-and-drop upload zone (also clickable to open a file picker) that uploads files directly to a Supabase Storage bucket scoped to this in-progress project, supporting PDFs and common document formats. Uploaded files show as chips with the filename and a remove (delete from storage) action. Clearly label this step as optional with a light nudge: "Adding docs helps the AI create a more accurate breakdown." Ensure the Skip action from the wizard shell works correctly here without blocking progress.

*(Agent reference: Claude Sonnet 4.5 — storage integration)*

---

## Phase 17 — Wizard Step 4: Invite Team
**Deliverables:** Handle-search invite (exact match, request sent), link/code generation, pending invite list within the wizard.

**Build Prompt:**
> Build Step 4 of the Paceup Create Project Wizard (Invite Team), using the handle system backend from Phase 4. Show two side-by-side invite paths: (1) "Invite by Handle" — a search input that only resolves on an exact handle match (no fuzzy name search, to prevent enumeration), and on match, shows a confirm button to send an invite request; (2) "Invite by Link/Code" — a generated shareable link and short code with a copy-to-clipboard button. Below both, show a running list of invites sent during this step with a "Pending" status tag. Rate-limit invite sends using Upstash Redis to prevent abuse. Include a note: "You can always invite more people later from Team Settings." This step is skippable.

*(Agent reference: Claude Opus 4.5 — depends on handle system from Phase 4)*

---

## Phase 18 — Wizard Step 5: AI Provider Connection
**Deliverables:** Provider selection cards, API key input, encryption-on-save backend, per-project key policy toggle (owner-only vs. per-member).

**Build Prompt:**
> Build Step 5 of the Paceup Create Project Wizard (AI Provider). Show selectable provider cards for Google Gemini, OpenAI, Anthropic, OpenRouter, and Groq, each with a short note on free-tier availability, with the most generous free-tier option visually suggested as default. Below the selected provider, show a masked API key input field and a "How do I get a key?" link (placeholder external link per provider). On save, encrypt the key server-side using envelope encryption (unique per-user data key, wrapped by a master key) before storing it — never store or log the key in plaintext, and never redisplay it in the UI after saving. Add a policy toggle: "Only I use my key for this project" vs. "Each member connects their own key." This step should be skippable with a soft warning: "You can connect a provider later, but AI features won't work until you do."

*(Agent reference: Claude Opus 4.5 — security-critical logic)*

---

## Phase 19 — Wizard: Review & Create
**Deliverables:** Summary screen of all steps, Create Project action, transition trigger into AI Breakdown Review.

**Build Prompt:**
> Build the final Review & Create step of the Paceup Create Project Wizard. Show a compact, read-only summary of everything entered across Steps 1–5 (details, tech stack, uploaded docs, pending invites, AI provider/policy), each with an "Edit" link that jumps back to that step. On clicking "Create Project," persist the project to the database via Drizzle, finalize any pending invites, and trigger the AI Breakdown Engine background job (built in Phase 22) via Trigger.dev. Immediately redirect the user to the AI Breakdown Review Screen, which should already show its AI Thinking state while the background job runs.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 20 — Member Profile Setup: Skills & Availability
**Deliverables:** Pre-filled skill chips from global profile, confidence-level toggle per skill, role preference, interests, availability/commitment fields.

**Build Prompt:**
> Build Step 1 of the Paceup Member Profile Setup flow (used whenever someone joins a project). Header context should show "Joining [Project Name]" with a small project preview (title, team size, deadline). Fields: a skills chip input pre-filled from the user's Global Profile (if one exists) shown as removable, editable chips, each with a small Comfortable/Learning confidence toggle; an "Add more" input for project-specific skills; a Preferred Role selector (Frontend / Backend / Design / Research / PM-ish / Flexible); an Interests free-text/tag input. Include a small clarifying note: "This is specific to this project — your general profile stays separate." Then build Step 2: a weekly availability slider or hour-range selector, a toggle for "I'm also working on another project right now," and an optional timezone/working-hours field shown only if the project is marked as non-co-located.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 21 — Member Profile Setup: Resume Upload & AI Parsing
**Deliverables:** Resume upload (Supabase Storage), AI parsing via Vercel AI SDK, editable AI-generated experience summary card, storage of parsed data into project-specific skillset.

**Build Prompt:**
> Build Step 3 of the Paceup Member Profile Setup flow (Resume Upload). Implement a drag-and-drop upload zone with a gold "Highly Recommended" badge (not a plain optional label), uploading to Supabase Storage. On upload, trigger an AI parsing call via the Vercel AI SDK (using the project's configured AI provider) that extracts a short summary of relevant past experience/projects from the resume text. While processing, show the `AiThinking` component from Phase 2 with a status line like "Reading your resume...". Once complete, display the result in an `AiGeneratedContent`-styled card that the user can edit before confirming — store the final (possibly edited) summary text as part of their project-specific skillset, not their Global Profile. Include a short reassurance line: "Only visible to your project owner and used to improve task matching." Ensure this step remains skippable, and build the final Review & Join step showing a summary of skills, role, availability, and resume summary (if added) with a "Join Project" confirmation button that finalizes ProjectMembership.

*(Agent reference: Claude Opus 4.5 — AI extraction logic)*

---

## Phase 22 — AI Breakdown Engine (Backend)
**Deliverables:** Core AI logic: parse project brief + docs + team skillsets → generate modules, milestones, tasks, assignments with rationale. Structured JSON output validated via Zod.

**Build Prompt:**
> Build the Paceup AI Breakdown Engine as a Trigger.dev background job. Input: the project's brief (title, problem statement, solution, scope, tech stack, deadline, any uploaded document text), and all current project members' skillsets (skills with confidence levels, preferred role, availability, resume summary if present). Using the Vercel AI SDK with the project's configured provider, generate a structured breakdown: modules (with descriptions), milestones (mapped across the deadline timeline), and tasks under each module (with a name, short description, effort estimate, and a suggested assignee). For each assignment, generate a short natural-language rationale explaining why that member was suggested (referencing their specific skills/experience). Define a strict Zod schema for this entire output and validate the AI's response against it, retrying with a corrective prompt if validation fails. If a member's profile is incomplete, flag any task assigned to them with a `lowConfidence: true` field and an explanatory note rather than assigning normally. Persist the validated breakdown to the database, and mark the job as complete so the AI Breakdown Review Screen can transition out of its thinking state.

*(Agent reference: Claude Opus 4.5 — most logic-critical phase in the whole build)*

---

## Phase 23 — AI Breakdown Review Screen: UI
**Deliverables:** AI-thinking entry state, staggered reveal of modules/milestones/tasks, rationale callouts, workload balance strip.

**Build Prompt:**
> Build the Paceup AI Breakdown Review Screen, shown immediately after project creation. On load, show the `AiThinking` component from Phase 2 with rotating status lines ("Reading your project brief...", "Identifying modules...", "Matching skills to tasks...", "Balancing workload...") while polling for the Phase 22 background job to complete. Once complete, reveal the result using a staggered fade-in: (1) a Module Overview section as a horizontal set of cards; (2) a Milestone Timeline as a horizontal visual timeline across the deadline; (3) a Task List grouped by module, each task as a card showing name, description, effort estimate, assignee avatar/name, and an `AiRationaleCallout` explaining the assignment — tasks flagged `lowConfidence` should use the `AiUncertainty` component instead. Add a Workload Balance strip showing a small horizontal bar per member summarizing their assigned load. Add a page header note: "This is a starting point — adjust anything before locking it in."

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 24 — AI Breakdown Review Screen: Edit/Reassign/Regenerate Logic
**Deliverables:** Inline reassign dropdown, human-override marking, regenerate action with optional feedback note, confirm-and-lock logic that creates the live project.

**Build Prompt:**
> Add interactivity to the Paceup AI Breakdown Review Screen from Phase 23. Each task card should have inline "Reassign" (a quick dropdown of project members) and "Edit" actions. When a task is reassigned or edited, swap its `AiRationaleCallout` styling to a neutral human-override treatment (remove the green AI border) and store a flag indicating it was manually adjusted. Add a "Regenerate" action at the bottom with an optional short text field ("What should be different?") that re-triggers the Phase 22 background job with that feedback included in the prompt. Add a "Confirm & Start Project" primary action that locks the breakdown, persists final tasks/modules/milestones/assignments to the live project tables, and redirects to the Project Dashboard.

*(Agent reference: Claude Opus 4.5)*

---

## Phase 25 — Project Dashboard: Shell & Navigation
**Deliverables:** Sidebar/nav, top bar with deadline countdown and notification bell, Projects Hub switcher entry point.

**Build Prompt:**
> Build the shell for the Paceup Project Dashboard at `/projects/[id]`. Implement a persistent left sidebar with links to Dashboard, Tasks, Standup Feed, Submissions, Team, Project Memory, and Settings, plus a project switcher linking back to the Projects Hub. Implement a top bar showing the project name, a subtle always-visible deadline countdown, and a notification bell icon (linking to the Notifications Center) with an unread count badge. Leave the main content area empty/placeholder — this phase only builds navigation and layout.

*(Agent reference: Gemini 3.1 Pro)*

---

## Phase 26 — Dashboard: Standup Status & AI Summary
**Deliverables:** Member check-in status row, inline check-in prompt if not yet submitted, AI-generated team summary integration.

**Build Prompt:**
> Build the Standup Status section at the top of the Paceup Project Dashboard content area (from the shell in Phase 25). Show a compact row of all project member avatars, each with a status indicator: green check if they've checked in today, a gold pulsing dot if pending, gray if not started. If the current user hasn't checked in yet, show an inline lightweight check-in prompt right here ("What are you working on today?") that submits directly without navigating away. Below the status row, once enough members have checked in, display the AI-generated daily team summary (from the Phase 34 backend) using the `AiGeneratedContent` component, with a one-time stagger fade-in on first load.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 27 — Dashboard: Ownership Map, Timeline, Risk Panel
**Deliverables:** Ownership grid, milestone timeline (reused visual from Breakdown Review), blockers/risk flag panel.

**Build Prompt:**
> Continue building the Paceup Project Dashboard content area. Add an Ownership Map section: a grid or list grouping tasks/modules by owner avatar, so "who owns what" is visible at a glance, with a subtle gold indicator next to members who are over/under-loaded. Add a Milestone Timeline section reusing the same horizontal timeline visual component built in Phase 23, showing completed (green check), current (subtle pulse), and upcoming (neutral) milestones. Add an Active Blockers & Risk Flags panel as a dedicated card, listing blockers with owner and short description in gold, escalating to red only for genuinely critical risk (e.g., a milestone about to slip).

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 28 — Dashboard: Activity Feed & Quick Actions
**Deliverables:** Recent activity strip, quick action buttons (Add Task, Invite Member, View Board).

**Build Prompt:**
> Finish the Paceup Project Dashboard content area. Add a condensed, scrollable Recent Activity feed showing recent events (task completed, submission uploaded, member joined, breakdown regenerated) as plain text rows with small type-coded icons — minimal color use here since it's a log. New items should get a gentle slide-in only if the page is actively open and polling detects a new event; no animation on initial page load. Add a small Quick Actions row (Add Task, Invite Member, View Full Board) that link to the relevant pages/modals without leaving the dashboard unnecessarily. Ensure the overall dashboard progress percentage (header, built alongside this or in an earlier pass) animates smoothly with a quick tween when its value changes.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 29 — Tasks Board: Kanban UI
**Deliverables:** Column layout, task cards, drag-and-drop with Framer Motion, status dot logic, view/filter controls.

**Build Prompt:**
> Build the Paceup Tasks Board (Kanban view) at `/projects/[id]/tasks`. Implement four columns: To Do, In Progress, In Review, Done. Each task card shows: task name, module tag, assignee avatar, an AI glyph if it has an unread rationale note, effort estimate, due date, and a status dot (green = on track, gold = at risk, red = blocked). Implement drag-and-drop between columns using Framer Motion, with a smooth reposition animation, a subtle lift/glow shadow while dragging, and a snap-into-place animation on drop — updating the task's status in the database on drop. Add view controls at the top: a Board/List toggle, filter chips (by member, module, status, priority), a search bar, and an "Add Task" button for manual task creation.

*(Agent reference: Gemini 3.1 Pro — animation-heavy)*

---

## Phase 30 — Tasks: List View & Filters
**Deliverables:** Sortable table view, filter chips, search.

**Build Prompt:**
> Build the List view alternative for the Paceup Tasks page, toggled from the Board view built in Phase 29. Implement a dense, sortable table with columns: task name, module, assignee, status, due date, effort estimate. Support sorting by any column (especially due date and assignee). Reuse the same filter chips and search bar from the Board view so both views share filter state when toggled.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 31 — Task Detail Panel: UI
**Deliverables:** Side drawer with description, rationale callout, reassign action, linked submissions, comments, dependency indicator.

**Build Prompt:**
> Build the Task Detail Panel for Paceup as a right-side drawer that opens when a task card is clicked (from either the Board or List view), without navigating away from the Tasks page. Include: task name/status dropdown/due date header, full description, the `AiRationaleCallout` for the assignment (persisting the original AI reasoning, or the neutral human-override treatment if it was manually reassigned), a Reassign action using the same quick-dropdown pattern as the AI Breakdown Review Screen, a list of linked submissions with their review status, a lightweight comment thread, and a dependency indicator ("Blocked by: [Task Name]") if applicable. The drawer should slide in from the right at ~200–250ms and slide out the same way on close.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 32 — Task Backend Logic
**Deliverables:** CRUD operations, status transition rules, dependency tracking, workload recalculation triggers.

**Build Prompt:**
> Build the backend logic for Paceup tasks. Implement full CRUD API routes/server actions for tasks (create, update, delete, reassign, change status). Implement dependency tracking between tasks (a task can list other tasks it's blocked by) and prevent a task from being marked Done if a blocking dependency isn't Done, with a clear error surfaced to the UI. On any assignment or status change, trigger a workload recalculation for affected members (used later by the Team Page's workload balance feature). Ensure all mutations validate input with Zod and enforce that only project members can modify tasks within their own project.

*(Agent reference: Claude Opus 4.5)*

---

## Phase 33 — Standup Feed: Check-In Form & Feed UI
**Deliverables:** Three-field check-in form, blocker branch logic, chronological feed grouped by day, blocker highlighting, streak indicator.

**Build Prompt:**
> Build the Paceup Standup Feed page at `/projects/[id]/standups`. At the top, show the check-in form (if the user hasn't submitted today): "What did you complete yesterday?", "What are you working on today?", and a Yes/No "Any blockers?" toggle that reveals a short text field when Yes is selected. On submit, show a brief green confirm pulse and collapse the form into a new entry in today's feed group. Below, show the AI Daily Summary (built in Phase 34) pinned above the chronological feed. Build the feed itself grouped by day (Today, Yesterday, older collapsed), each entry showing avatar, name, timestamp, and the three-part check-in; blocker-flagged entries get a gold left border. Members who haven't checked in on a given day should show as a quiet "No check-in" placeholder row rather than being omitted. Add filter controls for "by member" and "blockers only," and a small, non-public per-member streak/consistency indicator (tooltip-based, not a leaderboard).

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 34 — Standup: AI Daily Summary Logic
**Deliverables:** Background job (Trigger.dev) that generates the daily team summary once enough members check in, blocker extraction into structured tags.

**Build Prompt:**
> Build a Trigger.dev background job for Paceup that generates the AI Daily Standup Summary. Trigger it once a meaningful threshold of members have checked in for the day (e.g., more than half, configurable). Using the Vercel AI SDK, synthesize all of today's check-in entries into a short one-paragraph team summary (e.g., focus areas, notable progress, who hasn't checked in). Separately extract any flagged blockers into a structured list of `{ member, description }` tags. Persist both the summary text and structured blockers to the database, linked to that day, so the Dashboard and Standup Feed can both display them without regenerating.

*(Agent reference: Claude Opus 4.5)*

---

## Phase 35 — Submissions: List & Upload UI
**Deliverables:** Status-filtered list, upload flow (tied to a task), status badges.

**Build Prompt:**
> Build the Paceup Submissions page at `/projects/[id]/submissions`. Show a status-filtered list (tabs or chips: Pending Review / AI-Reviewed / Needs Revision / Approved), plus filters by member, module, and submission type (code/doc/design/report). Each row shows a file/link icon, name, type tag, linked task (clickable), submitter avatar, timestamp, and a color-coded status badge (gray/green/gold/red per our system) with a small AI glyph if reviewed. Implement an upload flow, typically initiated from a Task Detail Panel but also available here directly, that uploads the file to Supabase Storage and creates a submission record linked to a selected task.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 36 — Submissions: AI Review Logic
**Deliverables:** Linter/test execution pipeline (where configured), LLM commentary generation, confidence-flagging for uncertain points, task-mismatch detection.

**Build Prompt:**
> Build a Trigger.dev background job for Paceup that runs when a code submission is uploaded. First, if the project has linter/test configuration available, run those checks and record a plain pass/fail result. Then, using the Vercel AI SDK, generate short LLM commentary on the diff/code — phrased strictly as suggestions ("Consider handling the null case here"), never as verdicts. For any specific point the model expresses low confidence about, mark it with a `lowConfidence: true` flag so the UI can render it with the `AiUncertainty` component. Separately, compare the submission's content/description against the linked task's description and flag a likely mismatch with a clear, non-punitive message if they don't align, rather than silently accepting it. Persist all of this to the submission record for display in the Submission Detail drawer.

*(Agent reference: Claude Opus 4.5 — highest-risk-of-hallucination phase, review carefully)*

---

## Phase 37 — Submissions: Detail Drawer & Review Workflow
**Deliverables:** File preview, AI review display (pass/fail first, then commentary), human Approve/Request Changes/Comment actions, revision history stack.

**Build Prompt:**
> Build the Submission Detail drawer for Paceup, opening as a right-side panel when a submission row is clicked. Show a file preview where feasible (code diff view, document preview, image for designs) or a clean open/download link otherwise. Show the linked task context with a link back to it. Show the AI Review section from Phase 36: lint/test pass-fail results first and plainly, then the labeled LLM commentary below it, with any low-confidence points rendered using the `AiUncertainty` component. If a task mismatch was flagged, show that message prominently with an option to resubmit. Add human reviewer actions: Approve, Request Changes, and Comment — approving should move the linked task to Done and trigger a dashboard progress recalculation; Request Changes should keep it in review and log a new entry in a visible revision history stack for that task's submissions.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 38 — Team Page: Roster & Workload UI
**Deliverables:** Member grid, workload indicators, skill tags, standup consistency dots, composite contribution chips.

**Build Prompt:**
> Build the Paceup Team page at `/projects/[id]/team`. Show a header with team size and Invite actions (reusing the handle-search and link/code components from Phase 17). Build a member grid where each card shows: avatar, name, handle, role for this project, a workload indicator bar (green = balanced, gold = over/under-loaded), the project-specific skill chips, a standup consistency dot pattern, and a composite contribution chip row (Tasks Completed / Standup Participation / Submissions Reviewed — not a single opaque score). Add a Workload Balance Summary section near the top showing all members' load side by side as horizontal bars.

*(Agent reference: Gemini 3.1 Pro)*

---

## Phase 39 — Team Page: Member Detail & Rebalancing Logic
**Deliverables:** Member detail drawer, owner-only actions, AI workload-rebalancing suggestion generation.

**Build Prompt:**
> Build the Member Detail drawer for the Paceup Team page, opening when a member card is clicked. Show their fuller project profile (bio if available, full skill list with confidence levels, availability, resume-derived summary if added), their task history within this project, and their standup history (reusing the filter logic from the Standup Feed). Add owner-only actions: adjust role, remove from project, change their AI key policy if per-member keys are enabled. Separately, build a Trigger.dev job that recalculates workload balance whenever task assignments change, and generates an `AiSuggestionCard` (gold, Accept/Dismiss) when imbalance crosses a configurable threshold — e.g., "Rahul is at 40% capacity while Priya is at 110% — consider rebalancing 2 tasks." Accepting the suggestion should run the same reassignment logic as a manual reassign; dismissing should simply clear it without action.

*(Agent reference: Claude Opus 4.5)*

---

## Phase 40 — Project Memory: Timeline UI & Manual Entry
**Deliverables:** Entry types (Decision/Architecture/Milestone/Issue/AI Summary), filter chips, manual "Add Note" action.

**Build Prompt:**
> Build the Paceup Project Memory page at `/projects/[id]/memory`. Build a chronological timeline grouped by week or milestone, showing entries with distinct small icons per type: Decision, Architecture Note, Milestone Reached (auto-logged), Issue/Resolution (pulled from standup blocker data plus its eventual resolution), and AI Summary (periodic recap entries, styled with the `AiGeneratedContent` treatment). Entries expand inline (accordion-style) on click to show full context and links to related tasks/submissions/standup entries. Add filter chips for each entry type. Add a manual "Add Note" action allowing a team member to log something the AI wouldn't naturally capture (e.g., an in-person meeting decision) — these appear with a plain human-authored treatment, no AI glyph. No motion on scrolling through history; only new real-time entries get a subtle insert animation.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 41 — Project Memory: Semantic Search Backend
**Deliverables:** pgvector embedding pipeline for AI-generated summaries, semantic search API, relevance-ranked results.

**Build Prompt:**
> Build the semantic search backend for Paceup Project Memory. Create a pipeline that generates embeddings (via the project's configured AI provider or a fixed embedding model) for periodic AI-generated summaries and significant memory entries — not raw chat/logs — and stores them using pgvector in Postgres via Drizzle. Build a search API that takes a natural-language query, embeds it, and returns relevance-ranked memory entries with short excerpts. Wire this into the search bar at the top of the Project Memory page from Phase 40, with results shown as excerpt cards linking to full entries.

*(Agent reference: Claude Opus 4.5)*

---

## Phase 42 — Settings: Project Tab
**Deliverables:** Basic info editing, team/access management, AI provider policy toggle, Danger Zone (archive/delete with typed confirmation).

**Build Prompt:**
> Build the Project Settings tab of Paceup's Settings page at `/projects/[id]/settings`. Include editable fields for title, problem statement, scope, deadline, project type, tech stack (reusing the Phase 14/15 field components). Include a Team & Access section reusing the invite components, a pending invites list, and an owner-only "Remove member" action with a confirmation step. Include the AI Provider Policy toggle (owner-only key vs. per-member key), with a clarifying note shown if changed mid-project about how it affects in-flight AI actions. Add a visually separated Danger Zone at the bottom with red accent border for Archive Project and Delete Project actions, each requiring the user to type the project name before the action is enabled.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 43 — Settings: Account Tab
**Deliverables:** Profile editing, notification preferences (frequency, quiet hours, channel toggles), connected accounts, account deletion.

**Build Prompt:**
> Build the Account Settings tab of Paceup's Settings page. Include editable name, avatar, and handle (with the same live availability check pattern as Sign Up) and profile links (GitHub, LeetCode, Twitter, LinkedIn, etc.). Build a Notification Preferences section: a reminder frequency preference (standard/minimal), a quiet-hours time range picker, and independent channel toggles (in-app/email) for standup reminders, deadline alerts, invite notifications, and AI suggestions. Add a Connected Accounts section showing Google/GitHub OAuth connections with connect/disconnect actions. Add an Account Deletion action using the same Danger Zone treatment as Project Settings.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 44 — Settings: API Key Management Tab
**Deliverables:** Key list (masked), add/remove/rotate flows, per-project key assignment display.

**Build Prompt:**
> Build the API Key Management tab of Paceup's Settings page. List all connected AI provider keys as cards showing provider name/logo, a masked key (e.g., `sk-••••••••4f2a`), the date added, and status (active/needs attention if a key fails on use). Implement an "Add New Key" flow (provider select → key input → save) using the same envelope-encryption backend from Phase 18 — the key should immediately mask after saving and never be shown again. Implement Remove and Rotate actions per key, with a confirmation step on removal warning that it may affect active projects using that key. If the user is on multiple projects with different provider policies, show a small note clarifying which key is active on which project.

*(Agent reference: Claude Opus 4.5 — security-critical)*

---

## Phase 45 — Notifications Center
**Deliverables:** Filtered notification list, inline AI Suggestion Accept/Dismiss, unread/read states, empty state.

**Build Prompt:**
> Build the Paceup Notifications Center at `/notifications`. Include a header with a "Mark all as read" action and unread count. Add filter tabs: All / Unread / Invites / Reminders / AI Suggestions / Mentions. Build the list grouped by recency (Today / Earlier this week / Older), each item with a small type-coded icon, short description, timestamp, and a link to relevant context. Unread items get a subtle dot and brighter text; read items recede to muted. AI Suggestion notifications should use the `AiSuggestionCard` component with inline Accept/Dismiss actions available directly from this list. Build an empty state: "You're all caught up." New notifications arriving while the page is open should slide in at the top with a brief highlight pulse.

*(Agent reference: Gemini Flash 3.5 High)*

---

## Phase 46 — Invites & Requests Page
**Deliverables:** Received/Sent tabs, accept/decline/resend/revoke actions.

**Build Prompt:**
> Build the Paceup Invites & Requests page at `/invites`. Build a Received tab listing pending project invites (from handle-search) with project name, inviting owner, a short project preview snippet, and inline Accept/Decline actions — Accept should route into the Member Profile Setup flow for that project. Build a Sent tab listing invites the user has sent, with recipient handle/name, project, and a status chip (Pending/Accepted/Declined/Expired), plus Resend (on expired) and Revoke (on pending) actions. Build empty states for both tabs. Actioned rows should fade out briefly once handled rather than being instantly removed.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 47 — Global Profile Page
**Deliverables:** Profile header with handle + copy action, global skillset editor, activity overview (GitHub/LeetCode reuse from portfolio components), project history, privacy controls.

**Build Prompt:**
> Build the Paceup Global Profile page at `/profile`. Build a profile header with avatar, name, handle (with a copy-to-clipboard action), short bio, and a links row (GitHub, LeetCode, Twitter, LinkedIn, etc.). Build an editable Global Skillset section (the canonical skill/interest tags that pre-fill project-specific onboarding), with a note clarifying it's distinct from per-project skillsets. Build an Activity Overview section showing GitHub and LeetCode activity if the user has connected those accounts (reuse any existing heatmap/calendar components from prior portfolio work if available, or build lightweight equivalents). Build a Project History list showing past/current projects with role badges (Owner/Member). Build simple Privacy Controls letting the user choose what's visible to others who find their handle before inviting them (e.g., name + skills visible by default, activity history hidden unless toggled on).

*(Agent reference: Gemini 3.1 Pro)*

---

## Phase 48 — Final Submission Checklist: UI
**Deliverables:** Readiness indicator, checklist sections, missing items panel, team sign-off checkboxes.

**Build Prompt:**
> Build the Paceup Final Submission Checklist page at `/projects/[id]/final-submission`. Show a header with an overall readiness indicator (large percentage or "8/10 items ready"). Build checklist sections grouped by deliverable type (Documentation, Source Code, Presentation, Report, Testing, Required Deliverables specific to the project type), each row showing a status icon (green/gold/gray) and a short AI note where relevant, styled with `AiRationaleCallout`. Build a prominent Missing Items panel at the top listing everything outstanding with direct links to the relevant Task or Submissions page. Add a Team Sign-Off section where each member can check themselves off as "reviewed and ready," visible to the whole team.

*(Agent reference: Claude Sonnet 4.5)*

---

## Phase 49 — Final Submission Checklist: AI Readiness Logic
**Deliverables:** Cross-checking logic against submissions/tasks, AI final summary generation, post-mortem generation trigger, submit-lock logic.

**Build Prompt:**
> Build the backend logic for the Paceup Final Submission Checklist. Implement a job that cross-checks task completion status and submission approval status against the project's expected deliverables (based on project type and scope from creation) to populate the checklist and Missing Items panel from Phase 48. Once most/all items are addressed, generate an honest, specific AI final readiness summary using the Vercel AI SDK, styled with `AiGeneratedContent`. Implement the "Mark Project as Submitted" action: enabled only once critical items are green, requiring a confirmation step styled with a celebratory green tone (not the red Danger Zone treatment). On confirmation, set the project status to Completed (reflected in the Projects Hub), and show a prompt offering to generate a Post-Mortem/Retrospective.

*(Agent reference: Claude Opus 4.5)*

---

## Phase 50 — App-Wide QA & Motion Polish Pass
**Deliverables:** Consistency audit of motion durations/easing, AI-state visual consistency check across all pages, accessibility pass (contrast ratios on dark theme), responsive/mobile pass.

**Build Prompt:**
> Perform an app-wide QA and polish pass across all built Paceup pages. Audit every motion/transition against the presets from Phase 1 (150–250ms for micro-interactions, 300–400ms for page/modal transitions) and fix any inconsistent durations or easing curves. Audit every use of the six AI-state components from Phase 2 across all pages to confirm consistent application (green = AI at rest, gold = needs decision, dashed/muted = uncertain, gray = error, red reserved only for critical project risk). Run a contrast-ratio accessibility check on all text/background color pairs in the dark theme and fix any that fail WCAG AA. Do a responsive pass across all pages for tablet and mobile breakpoints, prioritizing the Dashboard, Tasks, and Standup Feed pages since they're the most-used.

*(Agent reference: Gemini 3.1 Pro)*

---

## Phase 51 — Deployment
**Deliverables:** Vercel project setup, Neon production DB, environment variable configuration, Trigger.dev production jobs, Resend domain verification, final smoke test.

**Build Prompt:**
> Prepare Paceup for production deployment. Set up a Vercel project connected to the repository, configure a production Neon PostgreSQL database and run all Drizzle migrations against it, and populate all required production environment variables (Better Auth secrets, Supabase Storage keys, Resend API key, Upstash Redis credentials, Trigger.dev production keys, encryption master key). Deploy all Trigger.dev background jobs to production. Verify the sending domain in Resend. Run a full smoke test covering: sign up, create project, AI breakdown generation, invite a member, submit a standup, upload a submission, and view the dashboard — confirm each works end-to-end in the production environment before considering this phase complete.

*(Agent reference: Claude Opus 4.5)*

---

**Total: 52 phases (0–51).** Each phase should be treated as a standalone task in Antigravity — complete, test, and confirm before starting the next.
