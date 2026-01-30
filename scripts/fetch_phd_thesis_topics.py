#!/usr/bin/env python3
"""
Script to download and curate PhD thesis topics from various sources.

Sources:
- GitHub repositories tagged with "phd" or "thesis"
- ProQuest Dissertations (if API access available)
- University thesis databases
- Manual curation from academic papers

Usage:
    python fetch_phd_thesis_topics.py [--source SOURCE] [--output OUTPUT] [--limit LIMIT]
"""

import json
import argparse
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path
import time

# GitHub API base URL
GITHUB_API_BASE = "https://api.github.com"

# Rate limiting
RATE_LIMIT_DELAY = 1  # seconds between requests


def fetch_github_thesis_repos(query: str = "phd thesis", limit: int = 100) -> List[Dict[str, Any]]:
    """
    Fetch GitHub repositories related to PhD theses.
    
    Args:
        query: Search query for GitHub
        limit: Maximum number of repositories to fetch
        
    Returns:
        List of repository metadata
    """
    repos = []
    page = 1
    per_page = min(100, limit)
    
    print(f"Fetching GitHub repositories with query: '{query}'...")
    
    while len(repos) < limit:
        url = f"{GITHUB_API_BASE}/search/repositories"
        params = {
            "q": query,
            "sort": "stars",
            "order": "desc",
            "per_page": per_page,
            "page": page,
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            items = data.get("items", [])
            
            if not items:
                break
            
            for item in items:
                if len(repos) >= limit:
                    break
                    
                repo_data = {
                    "id": item.get("id"),
                    "title": item.get("name"),
                    "description": item.get("description", ""),
                    "url": item.get("html_url"),
                    "stars": item.get("stargazers_count", 0),
                    "language": item.get("language"),
                    "topics": item.get("topics", []),
                    "created_at": item.get("created_at"),
                    "updated_at": item.get("updated_at"),
                    "author": item.get("owner", {}).get("login"),
                    "source": "github",
                }
                
                # Try to extract more information from README
                readme_url = item.get("url") + "/readme"
                try:
                    readme_response = requests.get(readme_url)
                    if readme_response.status_code == 200:
                        readme_data = readme_response.json()
                        repo_data["readme_content"] = readme_data.get("content", "")
                except:
                    pass
                
                repos.append(repo_data)
                print(f"  Found: {repo_data['title']} by {repo_data['author']}")
            
            page += 1
            time.sleep(RATE_LIMIT_DELAY)
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching from GitHub: {e}")
            break
    
    print(f"Fetched {len(repos)} repositories from GitHub")
    return repos


def extract_thesis_info_from_repo(repo: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Extract thesis topic information from a GitHub repository.
    
    Args:
        repo: Repository metadata from GitHub
        
    Returns:
        Extracted thesis topic information or None
    """
    title = repo.get("title", "")
    description = repo.get("description", "")
    
    # Try to infer discipline from topics or description
    discipline_keywords = {
        "Computer Science": ["computer", "cs", "software", "algorithm", "programming", "ai", "machine learning"],
        "Mathematics": ["math", "mathematical", "statistics", "algebra", "geometry"],
        "Physics": ["physics", "quantum", "particle", "theoretical physics"],
        "Chemistry": ["chemistry", "chemical", "molecular"],
        "Biology": ["biology", "biological", "genetics", "evolution"],
        "Philosophy": ["philosophy", "philosophical", "ethics", "metaphysics"],
        "Literature": ["literature", "literary", "narrative", "text"],
        "History": ["history", "historical", "historian"],
        "Economics": ["economics", "economic", "economy"],
        "Psychology": ["psychology", "psychological", "cognitive"],
    }
    
    discipline = "Interdisciplinary"
    text_to_check = (title + " " + description).lower()
    
    for disc, keywords in discipline_keywords.items():
        if any(keyword in text_to_check for keyword in keywords):
            discipline = disc
            break
    
    # Extract keywords from topics and description
    keywords = repo.get("topics", [])
    if description:
        # Simple keyword extraction (could be improved with NLP)
        keywords.extend([word for word in description.split() if len(word) > 4])
    
    thesis_info = {
        "id": f"github-{repo.get('id')}",
        "title": title.replace("-", " ").replace("_", " ").title(),
        "discipline": discipline,
        "abstract": description,
        "keywords": list(set(keywords[:10])),  # Limit to 10 keywords
        "author": repo.get("author"),
        "status": "completed" if "completed" in description.lower() else "in_progress",
        "source": "github",
        "source_url": repo.get("url"),
        "tags": repo.get("topics", []),
        "year": None,
        "links": [
            {
                "title": "GitHub Repository",
                "url": repo.get("url"),
                "type": "code",
            }
        ],
    }
    
    # Try to extract year from created_at
    created_at = repo.get("created_at")
    if created_at:
        try:
            thesis_info["year"] = int(created_at[:4])
        except:
            pass
    
    return thesis_info


def fetch_from_ship_of_thesis() -> List[Dict[str, Any]]:
    """
    Fetch thesis topics from Ship of Thesis GitHub database.
    
    Returns:
        List of thesis topic information
    """
    print("Fetching from Ship of Thesis database...")
    
    # Ship of Thesis uses a specific structure
    # This would need to be adapted based on their actual API/structure
    url = "https://api.github.com/repos/shipofthesis/shipofthesis/contents/Database"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        files = response.json()
        
        topics = []
        for file_info in files:
            if file_info.get("type") == "file" and file_info.get("name").endswith(".json"):
                file_url = file_info.get("download_url")
                if file_url:
                    file_response = requests.get(file_url)
                    if file_response.status_code == 200:
                        try:
                            data = json.loads(file_response.text)
                            topics.append(data)
                        except json.JSONDecodeError:
                            pass
        
        print(f"Fetched {len(topics)} topics from Ship of Thesis")
        return topics
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching from Ship of Thesis: {e}")
        return []


def save_topics_to_typescript(topics: List[Dict[str, Any]], output_path: Path):
    """
    Save curated thesis topics to a TypeScript data file.
    
    Args:
        topics: List of thesis topic dictionaries
        output_path: Path to output TypeScript file
    """
    print(f"\nSaving {len(topics)} topics to {output_path}...")
    
    # Read existing file if it exists
    existing_topics = []
    if output_path.exists():
        content = output_path.read_text()
        # Extract existing topics (simplified - would need proper parsing for production)
        # For now, we'll append to the file
    
    # Generate TypeScript code
    ts_content = "// Auto-generated thesis topics - DO NOT EDIT MANUALLY\n"
    ts_content += f"// Generated on {datetime.now().isoformat()}\n\n"
    ts_content += "import type { PhDThesisTopic } from '../types/phd-thesis';\n"
    ts_content += "import { generateThesisTopicId } from '../types/phd-thesis';\n\n"
    ts_content += "export const autoGeneratedThesisTopics: PhDThesisTopic[] = [\n"
    
    for topic in topics:
        ts_content += "  {\n"
        ts_content += f'    id: "{topic.get("id", "unknown")}",\n'
        ts_content += f'    title: "{topic.get("title", "").replace('"', '\\"')}",\n'
        ts_content += f'    discipline: "{topic.get("discipline", "Interdisciplinary")}",\n'
        
        if topic.get("subdiscipline"):
            ts_content += f'    subdiscipline: "{topic.get("subdiscipline")}",\n'
        
        if topic.get("abstract"):
            ts_content += f'    abstract: "{topic.get("abstract", "").replace('"', '\\"')}",\n'
        
        if topic.get("keywords"):
            ts_content += "    keywords: [\n"
            for keyword in topic.get("keywords", [])[:10]:
                ts_content += f'      "{keyword}",\n'
            ts_content += "    ],\n"
        
        if topic.get("author"):
            ts_content += f'    author: "{topic.get("author")}",\n'
        
        ts_content += f'    status: "{topic.get("status", "proposed")}",\n'
        ts_content += f'    source: "{topic.get("source", "other")}",\n'
        
        if topic.get("source_url"):
            ts_content += f'    source_url: "{topic.get("source_url")}",\n'
        
        if topic.get("tags"):
            ts_content += "    tags: [\n"
            for tag in topic.get("tags", [])[:10]:
                ts_content += f'      "{tag}",\n'
            ts_content += "    ],\n"
        
        if topic.get("year"):
            ts_content += f'    year: {topic.get("year")},\n'
        
        if topic.get("links"):
            ts_content += "    links: [\n"
            for link in topic.get("links", []):
                ts_content += "      {\n"
                ts_content += f'        title: "{link.get("title", "")}",\n'
                ts_content += f'        url: "{link.get("url", "")}",\n'
                if link.get("type"):
                    ts_content += f'        type: "{link.get("type")}",\n'
                ts_content += "      },\n"
            ts_content += "    ],\n"
        
        ts_content += f'    curated_date: "{datetime.now().isoformat()}",\n'
        ts_content += "  },\n"
    
    ts_content += "];\n"
    
    # Append to file or create new
    if output_path.exists():
        # Append to existing file
        existing_content = output_path.read_text()
        if "autoGeneratedThesisTopics" not in existing_content:
            output_path.write_text(existing_content + "\n\n" + ts_content)
        else:
            print("Warning: autoGeneratedThesisTopics already exists in file")
    else:
        output_path.write_text(ts_content)
    
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
            "title": "PhD Thesis Topics (Auto-generated)",
            "description": "Auto-generated thesis topics from various sources",
            "version": "1.0.0",
            "last_updated": datetime.now().isoformat(),
            "total_topics": len(topics),
        },
        "topics": topics,
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(topics)} topics to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Download and curate PhD thesis topics")
    parser.add_argument(
        "--source",
        choices=["github", "shipofthesis", "all"],
        default="all",
        help="Source to fetch from",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="src/data/auto-generated-thesis-topics.ts",
        help="Output file path",
    )
    parser.add_argument(
        "--json-output",
        type=str,
        default="data/thesis-topics-raw.json",
        help="JSON output file path (for raw data)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Maximum number of topics to fetch",
    )
    
    args = parser.parse_args()
    
    all_topics = []
    
    # Fetch from GitHub
    if args.source in ["github", "all"]:
        repos = fetch_github_thesis_repos(limit=args.limit)
        for repo in repos:
            thesis_info = extract_thesis_info_from_repo(repo)
            if thesis_info:
                all_topics.append(thesis_info)
    
    # Fetch from Ship of Thesis
    if args.source in ["shipofthesis", "all"]:
        ship_topics = fetch_from_ship_of_thesis()
        all_topics.extend(ship_topics)
    
    # Remove duplicates based on title similarity
    unique_topics = []
    seen_titles = set()
    
    for topic in all_topics:
        title_lower = topic.get("title", "").lower()
        if title_lower not in seen_titles:
            seen_titles.add(title_lower)
            unique_topics.append(topic)
    
    print(f"\nTotal unique topics: {len(unique_topics)}")
    
    # Save to files
    if unique_topics:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save as TypeScript
        save_topics_to_typescript(unique_topics, output_path)
        
        # Save as JSON for reference
        json_output_path = Path(args.json_output)
        json_output_path.parent.mkdir(parents=True, exist_ok=True)
        save_topics_to_json(unique_topics, json_output_path)
    
    print("\nDone!")


if __name__ == "__main__":
    main()
