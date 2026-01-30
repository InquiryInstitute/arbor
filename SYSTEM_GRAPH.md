# System Graph: The Tree of Vines

This Mermaid flowchart shows the complete system architecture, including the canonical curriculum DAG, learner personalization, Samwise traversal engine, faculty fruit, and the "ask → illuminate" overlay.

```mermaid
flowchart TB

%% =========================
%% 1) CANONICAL CURRICULUM
%% =========================
subgraph CANON["Canonical Microcredential Graph (DAG)"]
  direction TB

  subgraph LEVELS["Level Bands (Growth Rings)"]
    direction TB
    K1["K–1"] --> G23["G2–3"] --> G46["G4–6"] --> G78["G7–8"] --> G910["G9–10"] --> G1112["G11–12"] --> UG["UG"] --> MS["MS"] --> PHD["PhD"] --> FAC["Faculty"]
  end

  subgraph VINES["Colleges (Vines / Lanes)"]
    direction LR
    HUM["HUM"] --- MATH["MATH"] --- NAT["NAT"] --- AINS["AINS"] --- SOC["SOC"] --- ELA["ELA"] --- ARTS["ARTS"] --- HEAL["HEAL"] --- CEF["CEF"] --- META["META"]
  end

  %% Example credential nodes (pattern, not exhaustive)
  M1["🌙 Monthly Credential\n(id: ...M1)"]
  M2["🌙 Monthly Credential\n(id: ...M2)"]
  S1["🌱 Seasonal Credential\n(id: ...S1)"]

  %% Composition
  M1 -->|PART_OF| S1
  M2 -->|PART_OF| S1

  %% Prereqs / coreqs / recommended
  P0["(Any Credential A)"] -->|PREREQ| S1
  R0["(Any Credential B)"] -.->|RECOMMENDED| S1
  C0["(Any Credential C)"] <-.->|COREQ| S1
end

%% =========================
%% 2) QUESTIONS (NODE-OWNED)
%% =========================
subgraph QSYS["Node-owned Question System (Maieutic)"]
  direction TB
  QS["QuestionSet (versioned)\nper Credential"] --> Q1["Question\nkind=EVOKE/EXAMPLE/..."]
  QS --> Q2["Question\nkind=EDGE_TEST"]
  QS --> QG["Question\nkind=GATE (required)"]
  QEDGE["(optional) Question branching\nquestion_edges"] -.-> Q1
  QEDGE -.-> Q2
end

S1 -->|has| QS
M1 -->|has| QS

%% =========================
%% 3) LEARNER LAYER (PROGRESS)
%% =========================
subgraph LEARN["Learner Progress Overlay"]
  direction TB
  LC["learner_credentials\nstatus: LOCKED/AVAILABLE/\nIN_PROGRESS/SUBMITTED/\nPASSED/REVISE/FAILED"]
  LB["learner_beliefs\nbelief 0..1 per credential"]
  DT["dialogue_trace\n(Q/A log per session)"]
end

%% =========================
%% 4) SAMWISE ENGINE
%% =========================
subgraph SAM["Samwise (Traversal + Judgement)"]
  direction TB
  FRONT["Frontier Selector\n(next plausible nodes)"]
  SESSION["Sam Session Engine\nasks questions in set"]
  JUDGE["Judgement\nupdate beliefs + gate pass/revise"]
  RECO["Recommendations\n(next 🌙 / next 🌱)"]
end

CANON --> FRONT
LC --> FRONT
LB --> FRONT

FRONT --> SESSION
QS --> SESSION

SESSION --> DT
SESSION --> JUDGE
JUDGE --> LB
JUDGE --> LC
JUDGE --> RECO

%% =========================
%% 5) FACULTY FRUIT
%% =========================
subgraph FRUIT["🍎 Faculty Fruit (Personae Anchored to Nodes)"]
  direction TB
  FF["faculty_fruit\n(persona + icon + blurb)"]
  FA["fruit_anchors\nrole: GUIDE/CURATOR/\nEXAMINER/HERETIC/PATRON"]
end

FF --> FA
FA --- S1
FA --- M1

SESSION -. "voice/style overlay" .-> FF

%% =========================
%% 6) ASK → ILLUMINATE
%% =========================
subgraph ASK["Ask a Question → Illuminate Prereq Path"]
  direction TB
  QUERY["Learner Question"] --> LOCATE["Locate Candidate Nodes\n(search / embeddings)\nreturns ranked credential_ids"]
  LOCATE --> ANC["Ancestor Closure\n(all PREREQ ancestors)"]
  ANC --> PATH["Personalized Path\n(shortest path(s)\nfrom learner position)"]
  LC --> PATH
  PATH --> HILITE["Highlight Payload\nnodes+edges + first_missing\n+ explanation"]
end

HILITE --> CANON
HILITE --> SESSION

%% =========================
%% 7) DELIVERY STACK
%% =========================
subgraph STACK["Delivery Stack"]
  direction LR
  ASTRO["Astro on GitHub Pages\n(static shell)"]
  REACT["React Island\nVine Tree + Sam Panel"]
  ELK["ELK.js\nlayered DAG layout"]
  EDGE["Supabase Edge Functions\n/vines/* /sam/*"]
  DB["Supabase Postgres\n+ Auth + RLS"]
end

ASTRO --> REACT --> ELK
REACT --> EDGE --> DB
EDGE --> REACT
```

## Notes

- This is the **system graph** showing architecture and data flow
- For the **actual curriculum content graph** (e.g., K–6 or HS→A-level-aligned), specify the scope ("K–6 Math + HUM", "all K–6", etc.) to generate a real node/edge graph (Mermaid + JSON) that can be loaded into the viewer
