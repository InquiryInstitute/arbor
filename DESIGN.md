# Inquiry Institute

# The Tree of Vines

Curriculum · Microcredentials · Samwise · Faculty · Maieutic Navigation

⸻

## 0. Executive summary

The Tree of Vines is a living, navigable curriculum graph spanning K → Faculty.
It combines:
- A canonical knowledge graph of microcredentials
- A personalized learner overlay showing progress and readiness
- A maieutic tutor (Samwise) that traverses the graph by asking questions
- Faculty personae that hang from the tree like 🍎 fruit
- A question-to-path illumination system that shows what must come before any question, relative to the learner's current position

The result is not a course catalog, but an epistemic landscape.

⸻

## 1. Core metaphors (non-negotiable)

| Concept | Representation |
|---------|----------------|
| Knowledge | A living tree |
| Curriculum | Vines climbing a trunk |
| Colleges | Individual vines |
| Levels | Growth rings |
| 🌙 Monthly credentials | Buds |
| 🌱 Seasonal credentials | Leaves / flowers |
| Faculty | 🍎 Fruit |
| Prerequisites | Tendrils |
| Learning | Climbing |
| Understanding | Illumination |

This metaphor governs UI, data model, and pedagogy.

⸻

## 2. Canonical curriculum graph

### 2.1 Nodes (Credentials)

Each credential is a node.

**Cadence**
- 🌙 Monthly — atomic learning units (≈4 weeks)
- 🌱 Seasonal — compositional coherence units (≈8–13 weeks)

**Attributes**
- `id`
- `title`
- `cadence`
- `college_primary`
- `level_band` (K→Faculty)
- `duration_weeks`
- `status`
- `parent_seasonal_id` (for 🌙 → 🌱)

### 2.2 Edges (Relations)

| Type | Meaning |
|------|---------|
| PART_OF | 🌙 composes 🌱 |
| PREREQ | Required prior knowledge |
| RECOMMENDED | Helpful but optional |
| COREQ | Taken together |

The graph is a DAG, not a strict tree.

⸻

## 3. The Tree of Vines visualization

### 3.1 Layout
- Vertical axis: level bands (K at roots → Faculty canopy)
- Horizontal lanes: colleges (vines)
- Nodes:
  - 🌱 large, visible by default
  - 🌙 collapsed inside 🌱 until expanded
- Edges:
  - PART_OF: thick stems
  - PREREQ: thin tendrils behind nodes

### 3.2 Interaction
- Expand/collapse 🌙 buds
- Filter by college
- Toggle tendrils
- Zoom levels:
  - Macro: seasonal only
  - Meso: monthly buds
  - Micro: questions, artifacts

⸻

## 4. Personalization layer (learner progress)

The canonical graph is static.
Personalization is a transparent overlay.

### 4.1 Learner states per credential
- LOCKED
- AVAILABLE
- IN_PROGRESS
- SUBMITTED
- PASSED
- REVISE
- FAILED

### 4.2 Visual encoding

| Status | Visual |
|--------|--------|
| PASSED | Fruit / check / solid glow |
| IN_PROGRESS | Partial ring |
| AVAILABLE | Inviting glow |
| LOCKED | Faded + lock |
| REVISE | Amber outline |

### 4.3 Personalized visualization rules ("tree reflects progress")

**Node rendering (simple, intuitive)**
- PASSED → bright outline + checkmark + "fruit" badge
- IN_PROGRESS → partial ring / progress bar
- AVAILABLE → normal but slightly "glowing" (inviting)
- LOCKED → faded + small lock icon
- REVISE → amber outline + "needs pruning" icon

**Edge rendering**
- edges on the "active path" get higher opacity
- locked nodes: hide outgoing edges by default
- show a "you are here" marker on current seasonal goal

**Growth metaphor mapping**
- Passed monthly 🌙 = buds turned into leaves
- Passed seasonal 🌱 = flowering nodes
- Capstones = fruit (bigger badge)

### 4.4 Completion tracking design decision

Track completion at 🌙 monthly as the primary atomic unit.
Then compute 🌱 seasonal completion as:
- auto-pass when all required 🌙 passed, or
- pass on a "coherence review" node (mentor signoff)

This keeps the system granular and avoids "season-only" ambiguity.

⸻

## 5. Samwise: maieutic traversal engine

### 5.1 Principle

Every node owns its questions.
Sam does not improvise curriculum; he executes and adapts node-authored question sets.

### 5.2 Question sets (per credential)

Each credential has a versioned Question Set.

**Question kinds**
- EVOKE (definition in learner's words)
- EXAMPLE
- NON_EXAMPLE
- JUSTIFY
- TRANSFER
- EDGE_TEST (touches prereqs)
- REFLECTION
- GATE (must pass)

### 5.3 Outcomes
- Updates beliefs (readiness/confidence)
- Updates credential status
- Routes learner:
  - upward (same vine)
  - sideways (supporting vine)
  - backward (missing prereq)

⸻

## 6. Faculty as 🍎 fruit

### 6.1 Meaning

A faculty fruit is a persona anchored to one or more nodes, representing:
- a canonical voice
- a school of thought
- a guide, examiner, heretic, or curator

### 6.2 Attachment

Fruit hang off nodes, not inside them.
- Multiple fruit per node allowed
- Fruit have roles:
  - GUIDE
  - CURATOR
  - EXAMINER
  - HERETIC
  - PATRON

### 6.3 Interaction

Clicking 🍎 opens a Faculty Drawer:
- persona intro
- readings
- "Ask through this faculty"
- salons / symposia (future)

⸻

## 7. NEW FEATURE: Ask a question → Tree illuminates

### 7.1 User experience

A pupil asks:

> "What is a derivative?"

The tree responds by:
1. Highlighting target nodes
2. Illuminating preceding prerequisites
3. Styling each node relative to learner status
4. Identifying the first missing step
5. Offering to begin there with Sam

This turns the tree into a living answer.

⸻

## 8. Question-to-path illumination (technical design)

### 8.1 Step A — Locate relevant nodes

Map the question to candidate credentials using:
- title + summary
- tags
- question-set prompts
- (later) embeddings

Output: ranked credential candidates.

### 8.2 Step B — Compute ancestor closure

For each candidate:
- compute all PREREQ ancestors
- compute shortest path(s)

### 8.3 Step C — Personalize

Intersect the path with learner progress:
- mark PASSED / AVAILABLE / LOCKED
- identify first missing credential

### 8.4 Output

A highlight payload:
- nodes to illuminate
- edges to glow
- explanation text
- recommended starting point

⸻

## 9. Integration with Samwise

After illumination, Sam says:

> "To reach this, the first missing bud is X. Shall we begin?"

Accepting:
- opens that node's question set
- starts a maieutic session
- updates beliefs and progress

This creates a closed loop:
**question → diagnosis → action**

⸻

## 10. Data model (summary)

**Canonical**
- `credentials`
- `credential_relations`

**Personalization**
- `learner_credentials`
- `learner_beliefs`
- `dialogue_trace`

**Questions**
- `question_sets`
- `questions`
- (optional) `question_edges`

**Faculty**
- `faculty_fruit`
- `fruit_anchors`

**Search / illumination**
- `credential_search_docs` (text + optional embeddings)

⸻

## 11. API (Supabase Edge Functions)

**Public**
- `GET /vines/master`

**Authenticated**
- `GET /vines/progress`
- `GET /vines/questionset`
- `GET /vines/recommendations` ← next best nodes
- `POST /vines/mark-started`
- `POST /vines/submit`
- `POST /sam/session/start`
- `POST /sam/session/answer`
- `POST /sam/session/complete`
- `POST /vines/ask` ← locate + illuminate
- `GET /vines/fruit`

### 11.1 GET /vines/recommendations

Returns "next best nodes" based on:
- unlocked nodes (all prereqs passed)
- learner interests (optional)
- balance across colleges (optional)
- time budget (🌙 vs 🌱)

### 11.2 POST /vines/mark-started

Marks a credential as IN_PROGRESS.

### 11.3 POST /vines/submit

Submits a credential for review. Later: hook to evidence uploads / review workflow.

⸻

## 12. Frontend stack
- Astro (static shell, GitHub Pages)
- React island for Vine Tree
- ELK.js for layered DAG layout
- SVG for nodes, tendrils, fruit
- Supabase Auth (client-side)
- Supabase Edge Functions for all dynamic logic

### 12.1 Auth implementation on GitHub Pages

You can still do it cleanly:

**Frontend (Astro static)**
- uses `@supabase/supabase-js` in the browser
- login via magic link / OAuth
- store session in local storage

**Calls to Edge Functions**
- browser includes the JWT automatically:
- `Authorization: Bearer <access_token>`

No server required.

⸻

## 13. Pedagogical stance (why this matters)

This system:
- rejects linear curricula
- replaces grades with readiness
- treats misunderstanding as a path signal
- makes tradition visible (faculty fruit)
- makes curiosity actionable (illumination)

It teaches students not what to learn next, but how knowledge is structured.

⸻

## 14. Roadmap (updated)
1. Canonical vine tree (public)
2. Progress overlay
3. Node question sets
4. Samwise traversal
5. Faculty fruit
6. Ask → illuminate → begin
7. Authoring + salons + symposia

## 15. Implementation plan (fastest path)

### Phase 1 — MVP personalization (1–2 sprints)
1. Add `learner_credentials` table + RLS
2. Build Edge function `vines/progress`
3. Add Supabase auth UI (simple sign-in)
4. Overlay statuses in VineTree (colors/badges)
5. Add "My Next 🌙" and "My Next 🌱" panels

### Phase 2 — Review workflow
- evidence upload
- reviewer assignment
- rubrics
- revise loop

### Phase 3 — Tutor integration (Samwise)
- recommend next steps
- explain why something is locked
- generate practice artifacts

⸻

## 16. One-line vision statement

A pupil asks a question, and the tree shows them where they are, what came before, and who has walked this path before them.

---

If you want, next I can:
- produce the SQL DDL + RLS for all tables, or
- generate a first complete example vine (e.g., HS Mathematics) with nodes, questions, faculty fruit, and sample illumination paths.
