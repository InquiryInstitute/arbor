# MIT OpenCourseWare Course Graph

A visualization of MIT OpenCourseWare courses and their prerequisite relationships, integrated into the Arbor Scientiae project.

## Overview

This feature fetches course data from MIT OpenCourseWare and builds an interactive graph showing:
- **Nodes**: Individual courses (identified by course numbers like "18.01", "6.042")
- **Edges**: Prerequisite and corequisite relationships between courses
- **Visualization**: Interactive SVG graph with clickable nodes and hover tooltips

## Files Created

### Python Scripts
- `scripts/fetch_mit_ocw.py` - Main script to fetch and parse MIT OCW course data
- `scripts/requirements.txt` - Python dependencies
- `scripts/README.md` - Detailed documentation for the scripts

### TypeScript/JavaScript
- `src/types/mit-ocw.ts` - TypeScript type definitions for the graph data structure
- `src/components/MITOCWGraph.astro` - Astro component for rendering the graph
- `src/pages/mit-ocw.astro` - Page displaying the MIT OCW graph

### Data
- `public/data/mit-ocw-graph.json` - Generated graph data (JSON format)
- `data/mit-ocw-graph.json` - Alternative location (also generated)

## Usage

### Generating the Graph

1. Install Python dependencies:
```bash
cd scripts
pip install -r requirements.txt
```

2. Run the scraper:
```bash
python fetch_mit_ocw.py [max_courses]
```

The script will:
- Fetch course pages from MIT OCW
- Extract course information and prerequisites
- Build a graph structure
- Save to `public/data/mit-ocw-graph.json`

### Viewing the Graph

Visit `/mit-ocw` in the Arbor Scientiae site to see the interactive visualization.

## Graph Structure

The graph JSON has the following structure:

```json
{
  "nodes": [
    {
      "id": "18.01",
      "label": "18.01: Single Variable Calculus",
      "title": "Single Variable Calculus",
      "url": "https://ocw.mit.edu/courses/...",
      "department": "Mathematics",
      "level": "Undergraduate",
      "description": "..."
    }
  ],
  "edges": [
    {
      "source": "18.01",
      "target": "18.02",
      "type": "prerequisite",
      "label": "prerequisite"
    }
  ],
  "metadata": {
    "total_courses": 5,
    "total_prerequisites": 3,
    "total_corequisites": 0
  }
}
```

## Features

- **Interactive Nodes**: Click on any course node to open its MIT OCW page
- **Hover Tooltips**: Hover over nodes to see course details
- **Color Coding**: 
  - Blue edges = Prerequisites
  - Green edges = Corequisites
- **Responsive Layout**: Grid-based layout that adapts to the number of courses

## Future Enhancements

Potential improvements:
- Force-directed layout algorithm for better node positioning
- Filtering by department or level
- Search functionality
- Path finding (show all prerequisites for a course)
- Integration with Arbor Scientiae's main curriculum graph
- Better parsing of prerequisite text (handling "or", "and", etc.)

## Notes

- The script includes sample MIT courses for testing if web scraping fails
- Course IDs are extracted using regex pattern matching
- The graph is a directed acyclic graph (DAG) where edges point from prerequisite to dependent course
- Rate limiting may apply when fetching from MIT OCW - adjust `max_courses` accordingly
