# MIT OCW Graph Builder Scripts

Scripts for fetching and building a graph of MIT OpenCourseWare courses and their prerequisites.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Fetch MIT OCW Course Data

Run the main script to fetch course data and build the graph:

```bash
python fetch_mit_ocw.py [max_courses]
```

**Arguments:**
- `max_courses` (optional): Maximum number of courses to fetch (default: 50)

**Example:**
```bash
# Fetch up to 50 courses (default)
python fetch_mit_ocw.py

# Fetch up to 100 courses
python fetch_mit_ocw.py 100
```

### Output

The script generates `../data/mit-ocw-graph.json` with the following structure:

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

## How It Works

1. **Fetch Course List**: Scrapes MIT OCW to find course pages
2. **Parse Course Pages**: Extracts course information including:
   - Course ID (e.g., "18.01", "6.042")
   - Title and description
   - Prerequisites and corequisites
   - Department and level
3. **Build Graph**: Creates nodes (courses) and edges (prerequisite/corequisite relationships)
4. **Export JSON**: Saves the graph structure to `data/mit-ocw-graph.json`

## Notes

- The script includes sample MIT courses for testing if web scraping fails
- Course IDs are extracted using regex pattern matching (e.g., "18.01", "6.042J")
- Prerequisites are parsed from course page text
- The graph is a directed acyclic graph (DAG) where edges point from prerequisite to dependent course

## Troubleshooting

If the script fails to fetch courses:
- Check your internet connection
- MIT OCW may have rate limiting - try reducing `max_courses`
- The script will fall back to sample data for testing

## Next Steps

After generating the graph data:
1. The JSON file is automatically used by the MIT OCW Graph component
2. View the visualization at `/mit-ocw` in the Arbor Scientiae site
3. The graph can be enhanced with better layout algorithms (e.g., force-directed, hierarchical)
