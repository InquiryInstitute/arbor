# Arbor Scientiae

**The Tree of Vines** — A living, navigable curriculum graph spanning K → Faculty.

## Overview

Arbor Scientiae (Tree of Knowledge) is the curriculum system for Inquiry Institute. It combines:

- A canonical knowledge graph of microcredentials
- A personalized learner overlay showing progress and readiness
- A maieutic tutor (Samwise) that traverses the graph by asking questions
- Faculty personae that hang from the tree like 🍎 fruit
- A question-to-path illumination system

## Documentation

- [DESIGN.md](./DESIGN.md) — Complete, authoritative design document
- [SYSTEM_GRAPH.md](./SYSTEM_GRAPH.md) — System architecture diagram
- [MICROCREDENTIALS.md](./MICROCREDENTIALS.md) — Full list of 70 microcredentials
- [TODO.md](./TODO.md) — Implementation roadmap

## Vision

> A pupil asks a question, and the tree shows them where they are, what came before, and who has walked this path before them.

## Development

This is an Astro site deployed to GitHub Pages.

### Setup

```bash
npm install
npm run dev
```

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
