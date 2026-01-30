#!/usr/bin/env python3
"""
Fetch MIT OpenCourseWare course data and build a prerequisite graph.

This script scrapes MIT OCW course pages to extract course information
and prerequisite relationships, then builds a graph structure.
"""

import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Set
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: Missing required packages. Install with:")
    print("  pip install requests beautifulsoup4")
    sys.exit(1)


@dataclass
class Course:
    """Represents a MIT OCW course."""
    course_id: str  # e.g., "18.01"
    title: str
    url: str
    department: Optional[str] = None
    level: Optional[str] = None  # Undergraduate, Graduate, etc.
    description: Optional[str] = None
    prerequisites: List[str] = None  # List of course IDs
    corequisites: List[str] = None
    ocw_published: bool = False

    def __post_init__(self):
        if self.prerequisites is None:
            self.prerequisites = []
        if self.corequisites is None:
            self.corequisites = []


class MITOCWScraper:
    """Scraper for MIT OpenCourseWare course data."""

    BASE_URL = "https://ocw.mit.edu"
    COURSES_URL = "https://ocw.mit.edu/courses/"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; MIT OCW Graph Builder)'
        })
        self.courses: Dict[str, Course] = {}
        self.course_pattern = re.compile(r'(\d{2}\.\d{2,3}[A-Z]?)', re.IGNORECASE)

    def extract_course_id(self, text: str) -> Optional[str]:
        """Extract course ID from text (e.g., '18.01', '6.042J')."""
        match = self.course_pattern.search(text)
        if match:
            return match.group(1).upper()
        return None

    def parse_prerequisites(self, text: str) -> List[str]:
        """Parse prerequisite course IDs from text."""
        if not text:
            return []
        
        # Find all course ID patterns
        course_ids = set()
        for match in self.course_pattern.finditer(text):
            course_id = match.group(1).upper()
            course_ids.add(course_id)
        
        return sorted(list(course_ids))

    def fetch_course_list(self) -> List[str]:
        """Fetch list of course URLs from MIT OCW."""
        print("Fetching course list from MIT OCW...")
        
        try:
            response = self.session.get(self.COURSES_URL, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            course_links = []
            # Look for links to course pages
            for link in soup.find_all('a', href=True):
                href = link['href']
                # MIT OCW course URLs typically look like /courses/course-name/
                if '/courses/' in href and href != '/courses/':
                    full_url = urljoin(self.BASE_URL, href)
                    if full_url not in course_links:
                        course_links.append(full_url)
            
            print(f"Found {len(course_links)} potential course pages")
            return course_links[:100]  # Limit for initial testing
            
        except Exception as e:
            print(f"Error fetching course list: {e}")
            return []

    def fetch_course_page(self, url: str) -> Optional[Course]:
        """Fetch and parse a single course page."""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract course ID from URL or page content
            course_id = None
            title = None
            description = None
            prerequisites = []
            corequisites = []
            department = None
            level = None
            
            # Try to find course ID in the page
            page_text = soup.get_text()
            
            # Look for course ID in title or headings
            title_elem = soup.find('h1') or soup.find('title')
            if title_elem:
                title_text = title_elem.get_text()
                course_id = self.extract_course_id(title_text)
                if not title:
                    title = title_text.strip()
            
            # Look for prerequisites section
            prereq_section = soup.find(string=re.compile(r'prerequisite', re.I))
            if prereq_section:
                parent = prereq_section.find_parent()
                if parent:
                    prereq_text = parent.get_text()
                    prerequisites = self.parse_prerequisites(prereq_text)
            
            # Look for corequisites
            coreq_section = soup.find(string=re.compile(r'corequisite', re.I))
            if coreq_section:
                parent = coreq_section.find_parent()
                if parent:
                    coreq_text = parent.get_text()
                    corequisites = self.parse_prerequisites(coreq_text)
            
            # Extract description
            desc_elem = soup.find('meta', {'name': 'description'})
            if desc_elem:
                description = desc_elem.get('content', '').strip()
            
            if not course_id:
                # Try to extract from URL
                url_parts = url.rstrip('/').split('/')
                if url_parts:
                    last_part = url_parts[-1]
                    course_id = self.extract_course_id(last_part)
            
            if not course_id:
                return None
            
            course = Course(
                course_id=course_id,
                title=title or f"Course {course_id}",
                url=url,
                department=department,
                level=level,
                description=description,
                prerequisites=prerequisites,
                corequisites=corequisites,
                ocw_published=True
            )
            
            return course
            
        except Exception as e:
            print(f"Error fetching course {url}: {e}")
            return None

    def build_graph(self) -> Dict:
        """Build graph structure from collected courses."""
        nodes = []
        edges = []
        
        # Create nodes
        for course_id, course in self.courses.items():
            nodes.append({
                'id': course.course_id,
                'label': f"{course.course_id}: {course.title}",
                'title': course.title,
                'url': course.url,
                'department': course.department,
                'level': course.level,
                'description': course.description,
            })
        
        # Create edges for prerequisites
        for course_id, course in self.courses.items():
            for prereq_id in course.prerequisites:
                if prereq_id in self.courses:
                    edges.append({
                        'source': prereq_id,
                        'target': course_id,
                        'type': 'prerequisite',
                        'label': 'prerequisite'
                    })
        
        # Create edges for corequisites
        for course_id, course in self.courses.items():
            for coreq_id in course.corequisites:
                if coreq_id in self.courses:
                    edges.append({
                        'source': coreq_id,
                        'target': course_id,
                        'type': 'corequisite',
                        'label': 'corequisite'
                    })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'metadata': {
                'total_courses': len(self.courses),
                'total_prerequisites': sum(len(c.prerequisites) for c in self.courses.values()),
                'total_corequisites': sum(len(c.corequisites) for c in self.courses.values()),
            }
        }

    def run(self, max_courses: int = 50):
        """Main execution: fetch courses and build graph."""
        print("Starting MIT OCW course graph builder...")
        
        # Fetch course list
        course_urls = self.fetch_course_list()
        
        if not course_urls:
            print("No courses found. Using sample data for testing...")
            self._add_sample_courses()
        else:
            # Fetch individual courses
            print(f"\nFetching up to {max_courses} courses...")
            for i, url in enumerate(course_urls[:max_courses], 1):
                print(f"  [{i}/{min(max_courses, len(course_urls))}] Fetching {url}...")
                course = self.fetch_course_page(url)
                if course:
                    self.courses[course.course_id] = course
        
        # Build graph
        print("\nBuilding graph structure...")
        graph = self.build_graph()
        
        # Save to JSON (save to both data/ and public/data/ for flexibility)
        output_paths = [
            Path(__file__).parent.parent / 'public' / 'data' / 'mit-ocw-graph.json',
            Path(__file__).parent.parent / 'data' / 'mit-ocw-graph.json',
        ]
        
        for output_path in output_paths:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(graph, f, indent=2)
            print(f"Graph saved to: {output_path}")
        
        print(f"\n  Nodes: {len(graph['nodes'])}")
        print(f"  Edges: {len(graph['edges'])}")
        
        return graph

    def _add_sample_courses(self):
        """Add sample MIT courses for testing when scraping fails."""
        sample_courses = [
            Course(
                course_id="18.01",
                title="Single Variable Calculus",
                url="https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/",
                department="Mathematics",
                level="Undergraduate",
                prerequisites=[],
            ),
            Course(
                course_id="18.02",
                title="Multivariable Calculus",
                url="https://ocw.mit.edu/courses/18-02-multivariable-calculus-fall-2007/",
                department="Mathematics",
                level="Undergraduate",
                prerequisites=["18.01"],
            ),
            Course(
                course_id="6.042",
                title="Mathematics for Computer Science",
                url="https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/",
                department="Electrical Engineering and Computer Science",
                level="Undergraduate",
                prerequisites=[],
            ),
            Course(
                course_id="6.006",
                title="Introduction to Algorithms",
                url="https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
                department="Electrical Engineering and Computer Science",
                level="Undergraduate",
                prerequisites=["6.042"],
            ),
            Course(
                course_id="6.046",
                title="Design and Analysis of Algorithms",
                url="https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/",
                department="Electrical Engineering and Computer Science",
                level="Undergraduate",
                prerequisites=["6.006"],
            ),
        ]
        
        for course in sample_courses:
            self.courses[course.course_id] = course


if __name__ == "__main__":
    scraper = MITOCWScraper()
    
    # Allow command-line argument for max courses
    max_courses = 50
    if len(sys.argv) > 1:
        try:
            max_courses = int(sys.argv[1])
        except ValueError:
            print(f"Invalid max_courses argument: {sys.argv[1]}. Using default: {max_courses}")
    
    graph = scraper.run(max_courses=max_courses)
