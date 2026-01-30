# TODO: The Tree of Vines Implementation

Comprehensive task list for building Arbor Scientiae.

---

## Foundation & Setup

- [ ] Set up project structure: Astro app, Supabase project, GitHub Pages deployment
- [ ] Create Supabase database schema: credentials, credential_relations tables with DDL
- [ ] Set up Supabase Auth configuration (magic link, OAuth providers)
- [ ] Create initial seed data: example credentials and relations for one college (e.g., Math K-6)

---

## Phase 0: Canonical Vine Tree (Public)

- [ ] Build canonical vine tree visualization: ELK.js layout engine integration
- [ ] Implement Tree of Vines React component: SVG rendering, node/edge visualization
- [ ] Add tree interactions: expand/collapse 🌙 buds, filter by college, toggle tendrils
- [ ] Implement zoom levels: Macro (seasonal), Meso (monthly), Micro (questions/artifacts)
- [ ] Build Edge Function: `GET /vines/master` (returns canonical graph)

---

## Phase 1: MVP Personalization (1-2 sprints)

### Database & Auth
- [ ] Create `learner_credentials` table: schema with status enum (LOCKED/AVAILABLE/IN_PROGRESS/SUBMITTED/PASSED/REVISE/FAILED)
- [ ] Implement RLS policies for `learner_credentials`: users can only read/write their own records
- [ ] Create `learner_beliefs` table: track readiness/confidence per credential (0..1)
- [ ] Add Supabase auth UI: sign-in component with magic link/OAuth in Astro
- [ ] Implement client-side auth: `@supabase/supabase-js` integration, JWT handling for Edge Functions

### Progress Overlay
- [ ] Build Edge Function: `GET /vines/progress` (returns learner overlay data)
- [ ] Add progress overlay to VineTree: color nodes by status (PASSED/IN_PROGRESS/AVAILABLE/LOCKED/REVISE)
- [ ] Implement visual encoding: badges, checkmarks, progress rings, lock icons per status
- [ ] Implement edge rendering logic: highlight active path, hide edges from locked nodes
- [ ] Add "you are here" marker: visual indicator for current seasonal goal

### Recommendations & Actions
- [ ] Build Edge Function: `GET /vines/recommendations` (next best nodes based on unlocked, interests, balance, time budget)
- [ ] Create "My Next 🌙" panel component: displays recommended monthly credentials
- [ ] Create "My Next 🌱" panel component: displays recommended seasonal credentials
- [ ] Build Edge Function: `POST /vines/mark-started` (sets credential to IN_PROGRESS)

---

## Question Sets

- [ ] Create `question_sets` table: versioned question sets per credential
- [ ] Create `questions` table: question kinds (EVOKE/EXAMPLE/NON_EXAMPLE/JUSTIFY/TRANSFER/EDGE_TEST/REFLECTION/GATE)
- [ ] Create `question_edges` table (optional): branching logic between questions
- [ ] Build Edge Function: `GET /vines/questionset` (returns question set for a credential)
- [ ] Create question set authoring interface: form to create/edit questions per credential

---

## Phase 2: Review Workflow

- [ ] Build evidence upload system: file storage in Supabase Storage, link to learner_credentials
- [ ] Create `reviewers` table: assign reviewers to credentials, roles/permissions
- [ ] Build reviewer assignment logic: auto-assign or manual assignment workflow
- [ ] Create `rubrics` table: scoring criteria per credential/question set
- [ ] Build review interface: reviewer dashboard to view submissions, apply rubrics, provide feedback
- [ ] Implement revise loop: update status to REVISE, notify learner, allow resubmission
- [ ] Build Edge Function: `POST /vines/submit` (submits credential with evidence for review)
- [ ] Implement completion logic: auto-pass 🌱 seasonal when all required 🌙 monthly passed
- [ ] Add coherence review node: mentor signoff option for seasonal credentials

---

## Phase 3: Samwise Traversal Engine

### Core Engine
- [ ] Create `dialogue_trace` table: log Q/A sessions per learner/credential
- [ ] Build Frontier Selector: algorithm to determine next plausible nodes based on progress and beliefs
- [ ] Build Edge Function: `POST /sam/session/start` (initializes maieutic session for a credential)
- [ ] Implement Sam Session Engine: asks questions from question set, adapts based on responses
- [ ] Build Edge Function: `POST /sam/session/answer` (processes learner response, updates beliefs)
- [ ] Implement Judgement system: evaluates responses, updates learner_beliefs, determines pass/revise
- [ ] Build Edge Function: `POST /sam/session/complete` (finalizes session, updates credential status)

### UI & Features
- [ ] Create Samwise UI panel: displays current question, accepts answers, shows progress
- [ ] Implement recommendation engine: explains why something is locked, suggests prerequisites
- [ ] Add practice artifact generation: create exercises/problems based on credential content

---

## Ask → Illuminate Feature

- [ ] Create `credential_search_docs` table: text + optional embeddings for search
- [ ] Build search/indexing: map questions to candidate credentials (title, summary, tags, prompts)
- [ ] Implement ancestor closure algorithm: compute all PREREQ ancestors for candidate nodes
- [ ] Build shortest path algorithm: find path from learner position to target credential
- [ ] Build Edge Function: `POST /vines/ask` (locates nodes + illuminates prereq path)
- [ ] Implement highlight payload: nodes+edges to illuminate, first_missing credential, explanation text
- [ ] Add illumination visualization: highlight target nodes, glow prerequisite edges, style by learner status
- [ ] Integrate with Samwise: after illumination, offer to begin at first missing step

---

## Faculty Fruit

- [ ] Create `faculty_fruit` table: persona data (name, icon, blurb, voice/style)
- [ ] Create `fruit_anchors` table: link faculty to nodes with roles (GUIDE/CURATOR/EXAMINER/HERETIC/PATRON)
- [ ] Build Edge Function: `GET /vines/fruit` (returns faculty fruit for a credential)
- [ ] Add fruit visualization: 🍎 icons hanging from nodes in tree view
- [ ] Create Faculty Drawer UI: persona intro, readings, "Ask through this faculty" button
- [ ] Implement voice/style overlay: Samwise uses faculty persona when asking questions

---

## Authoring & Community

### Authoring Tools
- [ ] Build credential authoring interface: create/edit credentials, set attributes, define relations
- [ ] Create credential relation editor: visual interface to add PREREQ/RECOMMENDED/COREQ edges
- [ ] Build validation system: ensure graph remains DAG, check for cycles, validate level bands
- [ ] Implement versioning: track changes to credentials, question sets, relations over time

### Community Features
- [ ] Design salons feature: scheduled discussions around credentials with faculty
- [ ] Design symposia feature: larger gatherings, presentations, peer review

---

## Polish & Optimization

- [ ] Add growth metaphor animations: buds→leaves, flowering nodes, fruit badges for capstones
- [ ] Implement responsive design: tree visualization works on mobile/tablet
- [ ] Add accessibility: keyboard navigation, screen reader support, ARIA labels
- [ ] Performance optimization: lazy load tree sections, optimize ELK.js layout for large graphs
- [ ] Add analytics: track learner progress, credential completion rates, popular paths

---

## Notes

- Track completion at 🌙 monthly as the primary atomic unit
- 🌱 seasonal completion: auto-pass when all required 🌙 passed, or coherence review
- All dynamic logic in Supabase Edge Functions (no server required)
- Frontend: Astro static shell on GitHub Pages, React islands for interactivity
