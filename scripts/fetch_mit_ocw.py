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
        
        course_links = set()
        
        # Try multiple approaches to find courses
        approaches = [
            self._fetch_from_sitemap,
            self._fetch_from_courses_page,
            self._fetch_from_search,
        ]
        
        for approach in approaches:
            try:
                links = approach()
                course_links.update(links)
                if len(course_links) > 0:
                    print(f"  Found {len(links)} courses via {approach.__name__}")
            except Exception as e:
                print(f"  {approach.__name__} failed: {e}")
                continue
        
        course_links_list = sorted(list(course_links))
        print(f"Total unique course URLs found: {len(course_links_list)}")
        return course_links_list
    
    def _fetch_from_sitemap(self) -> List[str]:
        """Try to fetch from sitemap using regex parsing."""
        sitemap_urls = [
            "https://ocw.mit.edu/sitemap.xml",
        ]
        
        course_links = []
        for sitemap_url in sitemap_urls:
            try:
                print(f"    Fetching sitemap: {sitemap_url}")
                response = self.session.get(sitemap_url, timeout=60)
                if response.status_code == 200:
                    # Parse sitemap using regex (more reliable than XML parsing)
                    content = response.text
                    # Find all URLs in the sitemap
                    urls = re.findall(r'https://ocw\.mit\.edu/courses/[^\s<>\"]+', content)
                    
                    for url in urls:
                        # Remove /sitemap.xml suffix if present and normalize
                        url = url.replace('/sitemap.xml', '').rstrip('/')
                        
                        # MIT OCW course URLs: https://ocw.mit.edu/courses/SUBJECT-NUMBER-title-semester-year/
                        if '/courses/' in url:
                            # Extract course path
                            parts = url.split('/courses/')
                            if len(parts) > 1:
                                course_path = parts[1]
                                # Check if it matches course pattern (has numbers like 18-01 or 6.042)
                                # And has more than just numbers (has title)
                                if re.search(r'\d+[-.]\d+', course_path) and len(course_path.split('-')) >= 3:
                                    # Make sure it's a full course URL, not a partial one
                                    if url.count('/') >= 4:  # Full course URLs have more path segments
                                        course_links.append(url)
                    
                    print(f"    Found {len(course_links)} course URLs in sitemap")
            except Exception as e:
                print(f"    Sitemap error: {e}")
                continue
        
        return course_links
    
    def _fetch_from_courses_page(self) -> List[str]:
        """Fetch from the main courses page."""
        course_links = []
        
        try:
            response = self.session.get(self.COURSES_URL, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # MIT OCW course URLs follow pattern: /courses/SUBJECT-NUMBER-course-title/
            # Look for all links that match this pattern
            for link in soup.find_all('a', href=True):
                href = link['href']
                # Course URLs have format like: /courses/18-01-single-variable-calculus-fall-2006/
                if '/courses/' in href:
                    # Extract the path after /courses/
                    path_parts = href.split('/courses/')
                    if len(path_parts) > 1:
                        course_path = path_parts[1].strip('/')
                        # Check if it looks like a course (has numbers and dashes)
                        if course_path and not course_path.startswith(('about', 'help', 'search', 'sitemap', '#')):
                            # Check if it has the course number pattern (e.g., "18-01" or "6.042")
                            if re.search(r'\d+[-.]\d+', course_path):
                                full_url = urljoin(self.BASE_URL, href)
                                if full_url not in course_links:
                                    course_links.append(full_url)
        except Exception as e:
            print(f"Error in _fetch_from_courses_page: {e}")
        
        return course_links
    
    def _fetch_from_search(self) -> List[str]:
        """Try to get courses from MIT OCW browse/search pages."""
        course_links = []
        
        # Try to get courses from the browse page which lists all courses
        try:
            # MIT OCW has a courses listing page
            browse_url = "https://ocw.mit.edu/courses/"
            print(f"  Fetching from browse page: {browse_url}")
            response = self.session.get(browse_url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for course links - they're typically in lists or cards
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    # MIT OCW course URLs: /courses/SUBJECT-NUMBER-title-semester-year/
                    if '/courses/' in href and href != '/courses/':
                        # Check if it's a full course URL (has numbers and title)
                        if re.search(r'\d+[-.]\d+', href) and href.count('-') >= 3:
                            full_url = urljoin(self.BASE_URL, href)
                            # Make sure it's a complete URL, not a partial one
                            if full_url.count('/') >= 5:  # Full course URLs have more path segments
                                course_links.append(full_url)
        except Exception as e:
            print(f"  Error fetching from browse: {e}")
        
        return course_links

    def fetch_course_page(self, url: str) -> Optional[Course]:
        """Fetch and parse a single course page."""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Also try to fetch syllabus page for prerequisites
            syllabus_url = url.rstrip('/') + '/pages/syllabus/'
            syllabus_soup = None
            try:
                syllabus_response = self.session.get(syllabus_url, timeout=30)
                if syllabus_response.status_code == 200:
                    syllabus_soup = BeautifulSoup(syllabus_response.content, 'html.parser')
            except:
                pass  # Syllabus page might not exist
            
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
            
            # Look for prerequisites in multiple ways
            prerequisites = []
            corequisites = []
            
            # Combine main page and syllabus page for parsing
            pages_to_check = [soup]
            if syllabus_soup:
                pages_to_check.append(syllabus_soup)
            
            for page_soup in pages_to_check:
                # Method 1: Look for prerequisite text in various elements
                for elem in page_soup.find_all(['p', 'div', 'li', 'td', 'th', 'span', 'strong', 'em']):
                    text = elem.get_text()
                    if re.search(r'\bprerequisite', text, re.I):
                        # Get surrounding context
                        parent = elem.find_parent(['div', 'section', 'article', 'td'])
                        if parent:
                            prereq_text = parent.get_text()
                            found = self.parse_prerequisites(prereq_text)
                            prerequisites.extend(found)
                
                # Method 2: Look for "Prerequisites:" label followed by course numbers
                for label in page_soup.find_all(string=re.compile(r'prerequisite[s]?:', re.I)):
                    parent = label.find_parent()
                    if parent:
                        # Get next sibling or parent text
                        prereq_text = parent.get_text()
                        found = self.parse_prerequisites(prereq_text)
                        prerequisites.extend(found)
                
                # Method 3: Look in course info/syllabus sections
                for section in page_soup.find_all(['section', 'div'], class_=re.compile(r'course|syllabus|info', re.I)):
                    text = section.get_text()
                    if 'prerequisite' in text.lower():
                        found = self.parse_prerequisites(text)
                        prerequisites.extend(found)
                
                # Method 4: Look for course numbers near prerequisite keywords in the full page
                page_text = page_soup.get_text()
                # Find sections with prerequisite mentions
                for match in re.finditer(r'prerequisite[s]?[:\s]+([^\.\n]+)', page_text, re.I):
                    prereq_section = match.group(1)
                    found = self.parse_prerequisites(prereq_section)
                    prerequisites.extend(found)
                
                # Look for corequisites
                for elem in page_soup.find_all(['p', 'div', 'li', 'td', 'th']):
                    text = elem.get_text()
                    if re.search(r'\bcorequisite', text, re.I):
                        parent = elem.find_parent(['div', 'section', 'article'])
                        if parent:
                            coreq_text = parent.get_text()
                            found = self.parse_prerequisites(coreq_text)
                            corequisites.extend(found)
            
            # Remove duplicates and normalize
            prerequisites = sorted(list(set(prerequisites)))
            corequisites = sorted(list(set(corequisites)))
            
            # Remove self-references (course shouldn't be its own prerequisite)
            if course_id:
                prerequisites = [p for p in prerequisites if p != course_id]
                corequisites = [c for c in corequisites if c != course_id]
            
            # Extract description
            desc_elem = soup.find('meta', {'name': 'description'})
            if desc_elem:
                description = desc_elem.get('content', '').strip()
            
            if not course_id:
                # Try to extract from URL - MIT OCW URLs are like: /courses/18-01-single-variable-calculus-fall-2006/
                url_parts = url.rstrip('/').split('/')
                if url_parts:
                    last_part = url_parts[-1]
                    # Extract course number from URL (e.g., "18-01" from "18-01-single-variable-calculus-fall-2006")
                    match = re.search(r'(\d+[-.]\d+)', last_part)
                    if match:
                        course_id = match.group(1).replace('-', '.').upper()
                    else:
                        # Try alternative pattern
                        course_id = self.extract_course_id(last_part)
            
            if not course_id:
                # Last resort: try to find any course number pattern in the URL
                match = re.search(r'/(\d+[-.]\d+)-', url)
                if match:
                    course_id = match.group(1).replace('-', '.').upper()
            
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

    def run(self, max_courses: int = None):
        """Main execution: fetch courses and build graph."""
        print("Starting MIT OCW course graph builder...")
        
        # Fetch course list
        course_urls = self.fetch_course_list()
        
        if not course_urls:
            print("No courses found. Using sample data for testing...")
            self._add_sample_courses()
        else:
            # Fetch individual courses
            total_courses = len(course_urls) if max_courses is None else min(max_courses, len(course_urls))
            print(f"\nFetching {total_courses} courses...")
            
            for i, url in enumerate(course_urls[:total_courses] if max_courses else course_urls, 1):
                if i % 10 == 0:
                    print(f"  Progress: {i}/{total_courses} courses processed...")
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
