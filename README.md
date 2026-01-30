# Arbor

**The Tree of Vines** — A living, navigable knowledge system for Inquiry Institute.

## Overview

This repository contains two complementary knowledge visualization systems:

### 🌳 Arbor Scientiae (Tree of Knowledge)

The curriculum system for Inquiry Institute. It combines:

- A canonical knowledge graph of microcredentials
- A personalized learner overlay showing progress and readiness
- A maieutic tutor (Samwise) that traverses the graph by asking questions
- Faculty personae that hang from the tree like 🍎 fruit
- A question-to-path illumination system

### ⏳ Arbor Temporis (Tree of Time)

A temporal knowledge structure where time flows upward. It represents:

- Five primary vines: History, Music, Art, Literature, Science
- Temporal bands from Mythic to Emergent
- Cross-vine entanglements (braids) showing moments of intense interdisciplinary activity
- Nodes that answer: What came before? What follows? Who was creating at this moment?
- Personalized growth where each pupil's tree reflects their learning journey

## Documentation

### Arbor Scientiae
- [DESIGN.md](./DESIGN.md) — Complete, authoritative design document
- [SYSTEM_GRAPH.md](./SYSTEM_GRAPH.md) — System architecture diagram
- [MICROCREDENTIALS.md](./MICROCREDENTIALS.md) — Full list of 70 microcredentials
- [TODO.md](./TODO.md) — Implementation roadmap
- [scripts/README.md](./scripts/README.md) — MIT OCW graph builder documentation

### Arbor Temporis
- [ARBOR_TEMPORIS.md](./ARBOR_TEMPORIS.md) — Complete definition and design document

## Vision

> A pupil asks a question, and the tree shows them where they are, what came before, and who has walked this path before them.

## Development

This is an Astro site deployed to GitHub Pages.

### Setup

```bash
npm install
npm run dev
```

### MIT OCW Course Graph

To generate the MIT OpenCourseWare course prerequisite graph:

```bash
cd scripts
pip install -r requirements.txt
python fetch_mit_ocw.py
```

This will create `public/data/mit-ocw-graph.json` which is used by the visualization at `/mit-ocw`.

### Build

```bash
npm run build
```

### Deploy

The site is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to `main`.

**Note:** Make sure GitHub Pages is enabled in the repository settings:
1. Go to Settings → Pages
2. Source: GitHub Actions
3. The workflow will deploy automatically on push to `main`

## Live Site

Once deployed, the site will be available at:
https://inquiryinstitute.github.io/arbor/
