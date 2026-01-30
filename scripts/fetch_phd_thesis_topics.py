#!/usr/bin/env python3
"""
Script to download and curate PhD thesis topics from OpenAlex and OATD.

Sources:
- OpenAlex API: For thesis metadata, topics, and institutions
- OATD (Open Access Theses and Dissertations): For full text availability

Usage:
    python fetch_phd_thesis_topics.py [--limit LIMIT] [--output OUTPUT] [--college COLLEGE]
"""

import json
import argparse
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
import time
import re
from urllib.parse import quote

# API endpoints
OPENALEX_API_BASE = "https://api.openalex.org"
OATD_SEARCH_BASE = "https://oatd.org/oatd/search"

# Rate limiting
RATE_LIMIT_DELAY = 0.5  # seconds between requests (OpenAlex allows 10 req/sec)

# College mappings
COLLEGE_MAPPINGS = {
    'MATH': ['mathematics', 'math', 'statistics', 'algebra', 'geometry', 'number theory'],
    'AINS': ['computer science', 'artificial intelligence', 'machine learning', 'ai', 'neural network', 'cs'],
    'NAT': ['physics', 'chemistry', 'biology', 'natural science', 'quantum', 'molecular'],
    'HUM': ['philosophy', 'literature', 'history', 'theology', 'classics', 'humanities'],
    'ELA': ['language', 'linguistics', 'english', 'writing', 'literature'],
    'ARTS': ['art', 'music', 'aesthetic', 'visual', 'creative'],
    'SOC': ['psychology', 'sociology', 'economics', 'political science', 'social science'],
    'HEAL': ['health', 'medicine', 'public health', 'medical'],
    'CEF': ['ecology', 'environment', 'sustainability', 'climate'],
    'META': ['education', 'pedagogy', 'learning', 'teaching'],
}


def map_to_college(discipline: str, topics: List[str] = None, keywords: List[str] = None) -> str:
    """
    Map a discipline and topics to an Arbor college.
    
    Args:
        discipline: Academic discipline
        topics: List of OpenAlex topics
        keywords: List of keywords
        
    Returns:
        College code (e.g., 'MATH', 'AINS')
    """
    text_to_check = (discipline + ' ' + ' '.join(topics or []) + ' ' + ' '.join(keywords or [])).lower()
    
    # Score each college
    scores = {}
    for college, keywords_list in COLLEGE_MAPPINGS.items():
        score = sum(1 for kw in keywords_list if kw in text_to_check)
        if score > 0:
            scores[college] = score
    
    if scores:
        return max(scores.items(), key=lambda x: x[1])[0]
    
    # Default to META for interdisciplinary/unknown
    return 'META'


def fetch_openalex_theses(limit: int = 50, filter_type: str = "dissertation") -> List[Dict[str, Any]]:
    """
    Fetch PhD theses from OpenAlex API.
    
    Args:
        limit: Maximum number of theses to fetch
        filter_type: Type filter (dissertation, thesis, etc.)
        
    Returns:
        List of thesis metadata from OpenAlex
    """
    theses = []
    page = 1
    per_page = min(200, limit)
    
    print(f"Fetching theses from OpenAlex (type={filter_type})...")
    
    # OpenAlex filter for dissertations/theses
    # Using type:dissertation or type:thesis
    filter_param = f"type:{filter_type}"
    
    url = f"{OPENALEX_API_BASE}/works"
    params = {
        "filter": filter_param,
        "per_page": per_page,
        "page": page,
        "sort": "cited_by_count:desc",  # Sort by citations
    }
    
    try:
        while len(theses) < limit:
            print(f"  Fetching page {page}...")
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            results = data.get("results", [])
            
            if not results:
                break
            
            for work in results:
                if len(theses) >= limit:
                    break
                
                # Extract thesis information
                thesis_data = {
                    "openalex_id": work.get("id", "").replace("https://openalex.org/", ""),
                    "title": work.get("title", ""),
                    "abstract": work.get("abstract", ""),
                    "year": work.get("publication_year"),
                    "authors": [],
                    "institutions": [],
                    "topics": [],
                    "keywords": [],
                    "doi": work.get("doi"),
                    "openalex_url": work.get("id"),
                    "cited_by_count": work.get("cited_by_count", 0),
                }
                
                # Extract authors
                for author in work.get("authorships", []):
                    author_name = author.get("author", {}).get("display_name", "")
                    if author_name:
                        thesis_data["authors"].append(author_name)
                
                # Extract institutions
                for authorship in work.get("authorships", []):
                    for inst in authorship.get("institutions", []):
                        inst_name = inst.get("display_name", "")
                        if inst_name:
                            thesis_data["institutions"].append(inst_name)
                
                # Extract OpenAlex topics
                for topic in work.get("topics", []):
                    thesis_data["topics"].append({
                        "id": topic.get("id", "").replace("https://openalex.org/", ""),
                        "display_name": topic.get("display_name", ""),
                        "score": topic.get("score", 0),
                    })
                
                # Extract concepts (additional keywords)
                for concept in work.get("concepts", []):
                    if concept.get("score", 0) > 0.5:  # Only high-scoring concepts
                        thesis_data["keywords"].append(concept.get("display_name", ""))
                
                # Determine discipline from topics
                topic_names = [t["display_name"] for t in thesis_data["topics"]]
                if topic_names:
                    # Use first topic as primary discipline
                    primary_topic = topic_names[0]
                    thesis_data["discipline"] = primary_topic
                else:
                    thesis_data["discipline"] = "Interdisciplinary"
                
                # Map to college
                thesis_data["college"] = map_to_college(
                    thesis_data["discipline"],
                    topic_names,
                    thesis_data["keywords"]
                )
                
                theses.append(thesis_data)
                print(f"  Found: {thesis_data['title'][:60]}... ({thesis_data['college']})")
            
            page += 1
            params["page"] = page
            time.sleep(RATE_LIMIT_DELAY)
            
            # Check if we have more pages
            if len(results) < per_page:
                break
                
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from OpenAlex: {e}")
    
    print(f"Fetched {len(theses)} theses from OpenAlex")
    return theses


def check_oatd_fulltext(title: str, author: str = None) -> Optional[Dict[str, Any]]:
    """
    Check OATD for full text availability.
    
    Note: OATD doesn't have a public API, so we search via their web interface.
    This is a simplified check - in production, you might want to scrape or use their data dumps.
    
    Args:
        title: Thesis title
        author: Author name (optional)
        
    Returns:
        Dictionary with full text info or None
    """
    # OATD search URL
    # Note: This is a simplified approach - OATD doesn't have a public API
    # You may need to scrape or use their data exports
    
    search_query = title
    if author:
        search_query += f" {author}"
    
    # URL encode the search query
    encoded_query = quote(search_query)
    search_url = f"{OATD_SEARCH_BASE}?q={encoded_query}"
    
    # For now, return a placeholder structure
    # In production, you would:
    # 1. Make a request to OATD search
    # 2. Parse the results
    # 3. Check if full text is available
    # 4. Extract the full text URL
    
    return {
        "oatd_search_url": search_url,
        "has_full_text": None,  # Would be determined by scraping
        "full_text_url": None,  # Would be extracted from OATD
    }


def convert_to_thesis_topic(openalex_data: Dict[str, Any], oatd_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Convert OpenAlex work data to PhDThesisTopic format.
    
    Args:
        openalex_data: Data from OpenAlex API
        oatd_data: Data from OATD (optional)
        
    Returns:
        Thesis topic in our format
    """
    # Generate ID
    title_slug = re.sub(r'[^a-z0-9]+', '-', openalex_data["title"].lower())[:50]
    author_slug = ""
    if openalex_data["authors"]:
        author_slug = re.sub(r'[^a-z0-9]+', '-', openalex_data["authors"][0].lower())[:20]
    
    thesis_id = f"openalex-{openalex_data['openalex_id']}"
    
    # Build links
    links = []
    if openalex_data.get("doi"):
        links.append({
            "title": "DOI",
            "url": f"https://doi.org/{openalex_data['doi']}",
            "type": "paper",
        })
    if openalex_data.get("openalex_url"):
        links.append({
            "title": "OpenAlex",
            "url": openalex_data["openalex_url"],
            "type": "website",
        })
    
    # Add OATD link if available
    if oatd_data:
        if oatd_data.get("full_text_url"):
            links.append({
                "title": "Full Text (OATD)",
                "url": oatd_data["full_text_url"],
                "type": "full_text",
            })
        elif oatd_data.get("oatd_search_url"):
            links.append({
                "title": "OATD Search",
                "url": oatd_data["oatd_search_url"],
                "type": "website",
            })
    
    # Determine status
    status = "completed"  # OpenAlex theses are typically completed
    
    # Map discipline
    discipline_map = {
        "Mathematics": "Mathematics",
        "Computer science": "Computer Science",
        "Physics": "Physics",
        "Chemistry": "Chemistry",
        "Biology": "Biology",
        "Philosophy": "Philosophy",
        "Literature": "Literature",
        "History": "History",
        "Economics": "Economics",
        "Psychology": "Psychology",
        "Sociology": "Sociology",
        "Political science": "Political Science",
        "Education": "Education",
        "Engineering": "Engineering",
        "Art": "Art",
        "Music": "Music",
    }
    
    discipline = discipline_map.get(openalex_data.get("discipline", ""), "Interdisciplinary")
    
    thesis_topic = {
        "id": thesis_id,
        "title": openalex_data["title"],
        "discipline": discipline,
        "college_primary": openalex_data.get("college", "META"),
        "abstract": openalex_data.get("abstract"),
        "keywords": openalex_data.get("keywords", [])[:10],
        "author": ", ".join(openalex_data.get("authors", [])[:3]),  # First 3 authors
        "institution": ", ".join(openalex_data.get("institutions", [])[:2]),  # First 2 institutions
        "year": openalex_data.get("year"),
        "status": status,
        "source": "openalex",
        "source_url": openalex_data.get("openalex_url"),
        "openalex_id": openalex_data.get("openalex_id"),
        "openalex_topics": openalex_data.get("topics", [])[:5],  # Top 5 topics
        "tags": [t["display_name"] for t in openalex_data.get("topics", [])[:5]],
        "links": links,
        "curated_date": datetime.now().isoformat(),
    }
    
    # Add OATD data if available
    if oatd_data:
        thesis_topic["oatd_id"] = None  # Would be extracted from OATD
        thesis_topic["has_full_text"] = oatd_data.get("has_full_text")
        thesis_topic["full_text_url"] = oatd_data.get("full_text_url")
    
    return thesis_topic


def save_topics_to_typescript(topics: List[Dict[str, Any]], output_path: Path):
    """
    Save curated thesis topics to a TypeScript data file.
    
    Args:
        topics: List of thesis topic dictionaries
        output_path: Path to output TypeScript file
    """
    print(f"\nSaving {len(topics)} topics to {output_path}...")
    
    ts_content = "// Auto-generated thesis topics from OpenAlex and OATD\n"
    ts_content += f"// Generated on {datetime.now().isoformat()}\n"
    ts_content += "// DO NOT EDIT MANUALLY - Regenerate using fetch_phd_thesis_topics.py\n\n"
    ts_content += "import type { PhDThesisTopic } from '../types/phd-thesis';\n\n"
    ts_content += "export const autoGeneratedThesisTopics: PhDThesisTopic[] = [\n"
    
    for topic in topics:
        ts_content += "  {\n"
        ts_content += f'    id: "{topic.get("id", "unknown")}",\n'
        ts_content += f'    title: {json.dumps(topic.get("title", ""))},\n'
        ts_content += f'    discipline: "{topic.get("discipline", "Interdisciplinary")}",\n'
        
        if topic.get("college_primary"):
            ts_content += f'    college_primary: "{topic.get("college_primary")}",\n'
        
        if topic.get("abstract"):
            # Escape quotes and newlines for TypeScript string
            abstract = topic.get("abstract", "").replace('"', '\\"').replace('\n', '\\n')
            ts_content += f'    abstract: "{abstract[:500]}",\n'  # Limit length
        
        if topic.get("keywords"):
            ts_content += "    keywords: [\n"
            for keyword in topic.get("keywords", [])[:10]:
                ts_content += f'      {json.dumps(keyword)},\n'
            ts_content += "    ],\n"
        
        if topic.get("author"):
            ts_content += f'    author: {json.dumps(topic.get("author"))},\n'
        
        if topic.get("institution"):
            ts_content += f'    institution: {json.dumps(topic.get("institution"))},\n'
        
        if topic.get("year"):
            ts_content += f'    year: {topic.get("year")},\n'
        
        ts_content += f'    status: "{topic.get("status", "completed")}",\n'
        ts_content += f'    source: "{topic.get("source", "openalex")}",\n'
        
        if topic.get("source_url"):
            ts_content += f'    source_url: {json.dumps(topic.get("source_url"))},\n'
        
        if topic.get("openalex_id"):
            ts_content += f'    openalex_id: "{topic.get("openalex_id")}",\n'
        
        if topic.get("openalex_topics"):
            ts_content += "    openalex_topics: [\n"
            for topic_item in topic.get("openalex_topics", [])[:5]:
                ts_content += "      {\n"
                ts_content += f'        id: "{topic_item.get("id", "")}",\n'
                ts_content += f'        display_name: {json.dumps(topic_item.get("display_name", ""))},\n'
                if topic_item.get("score"):
                    ts_content += f'        score: {topic_item.get("score")},\n'
                ts_content += "      },\n"
            ts_content += "    ],\n"
        
        if topic.get("has_full_text") is not None:
            ts_content += f'    has_full_text: {str(topic.get("has_full_text")).lower()},\n'
        
        if topic.get("full_text_url"):
            ts_content += f'    full_text_url: {json.dumps(topic.get("full_text_url"))},\n'
        
        if topic.get("tags"):
            ts_content += "    tags: [\n"
            for tag in topic.get("tags", [])[:10]:
                ts_content += f'      {json.dumps(tag)},\n'
            ts_content += "    ],\n"
        
        if topic.get("links"):
            ts_content += "    links: [\n"
            for link in topic.get("links", []):
                ts_content += "      {\n"
                ts_content += f'        title: {json.dumps(link.get("title", ""))},\n'
                ts_content += f'        url: {json.dumps(link.get("url", ""))},\n'
                if link.get("type"):
                    ts_content += f'        type: "{link.get("type")}",\n'
                ts_content += "      },\n"
            ts_content += "    ],\n"
        
        ts_content += f'    curated_date: "{topic.get("curated_date", datetime.now().isoformat())}",\n'
        ts_content += "  },\n"
    
    ts_content += "];\n"
    
    # Write to file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(ts_content, encoding="utf-8")
    
    print(f"Saved {len(topics)} topics to {output_path}")


def save_topics_to_json(topics: List[Dict[str, Any]], output_path: Path):
    """
    Save curated thesis topics to a JSON file.
    
    Args:
        topics: List of thesis topic dictionaries
        output_path: Path to output JSON file
    """
    output_data = {
        "metadata": {
            "title": "PhD Thesis Topics (Auto-generated from OpenAlex and OATD)",
            "description": "Auto-generated thesis topics from OpenAlex API with OATD full text indicators",
            "version": "1.0.0",
            "last_updated": datetime.now().isoformat(),
            "total_topics": len(topics),
            "sources": ["openalex", "oatd"],
        },
        "topics": topics,
    }
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(topics)} topics to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Download and curate PhD thesis topics from OpenAlex and OATD")
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Maximum number of topics to fetch (default: 50)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="src/data/auto-generated-thesis-topics.ts",
        help="Output TypeScript file path",
    )
    parser.add_argument(
        "--json-output",
        type=str,
        default="data/thesis-topics-raw.json",
        help="JSON output file path (for raw data)",
    )
    parser.add_argument(
        "--college",
        type=str,
        choices=['HUM', 'MATH', 'NAT', 'AINS', 'SOC', 'ELA', 'ARTS', 'HEAL', 'CEF', 'META'],
        help="Filter by specific college",
    )
    parser.add_argument(
        "--check-oatd",
        action="store_true",
        help="Check OATD for full text availability (slower, requires web scraping)",
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("PhD Thesis Topics Curator")
    print("Using OpenAlex API and OATD")
    print("=" * 60)
    
    # Fetch from OpenAlex
    openalex_theses = fetch_openalex_theses(limit=args.limit)
    
    if not openalex_theses:
        print("No theses found. Exiting.")
        return
    
    # Convert to our format
    all_topics = []
    for openalex_data in openalex_theses:
        # Filter by college if specified
        if args.college and openalex_data.get("college") != args.college:
            continue
        
        # Check OATD if requested
        oatd_data = None
        if args.check_oatd:
            author = openalex_data.get("authors", [""])[0] if openalex_data.get("authors") else None
            oatd_data = check_oatd_fulltext(openalex_data["title"], author)
            time.sleep(RATE_LIMIT_DELAY)  # Be respectful
        
        # Convert to thesis topic format
        thesis_topic = convert_to_thesis_topic(openalex_data, oatd_data)
        all_topics.append(thesis_topic)
    
    print(f"\nTotal topics after filtering: {len(all_topics)}")
    
    # Group by college for summary
    college_counts = {}
    for topic in all_topics:
        college = topic.get("college_primary", "META")
        college_counts[college] = college_counts.get(college, 0) + 1
    
    print("\nTopics by college:")
    for college, count in sorted(college_counts.items()):
        print(f"  {college}: {count}")
    
    # Save to files
    if all_topics:
        output_path = Path(args.output)
        save_topics_to_typescript(all_topics, output_path)
        
        json_output_path = Path(args.json_output)
        save_topics_to_json(all_topics, json_output_path)
    
    print("\nDone!")


if __name__ == "__main__":
    main()
