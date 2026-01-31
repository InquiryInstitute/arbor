#!/usr/bin/env python3
"""
Analyze multidisciplinary courses in MIT OCW data.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

def analyze_multidisciplinary():
    """Analyze which courses are multidisciplinary."""
    
    # Load graph data
    graph_path = Path(__file__).parent.parent / 'public' / 'data' / 'mit-ocw-graph.json'
    if not graph_path.exists():
        graph_path = Path(__file__).parent.parent / 'data' / 'mit-ocw-graph.json'
    
    with open(graph_path, 'r') as f:
        data = json.load(f)
    
    # Indicators of multidisciplinary courses
    multidisciplinary_keywords = [
        'joint', 'cross', 'interdisciplinary', 'multidisciplinary',
        'collaborative', 'combined', 'integrated', 'hybrid', 'cross-listed'
    ]
    
    multidisciplinary_courses = []
    joint_notation_courses = []
    multiple_dept_courses = []
    
    for node in data['nodes']:
        course_id = node['id']
        title = node.get('title', '') or ''
        description = node.get('description', '') or ''
        department = node.get('department', '') or ''
        
        title_lower = title.lower()
        desc_lower = description.lower()
        dept_lower = department.lower() if department else ''
        
        indicators = []
        
        # Check for joint course notation (J, SC, W suffixes)
        if re.search(r'[JSCW]$', course_id) or 'J' in course_id or 'SC' in course_id:
            joint_notation_courses.append(course_id)
            indicators.append('joint_notation')
        
        # Check for multidisciplinary keywords
        for keyword in multidisciplinary_keywords:
            if keyword in title_lower or keyword in desc_lower or keyword in dept_lower:
                indicators.append(f'keyword_{keyword}')
        
        # Check for multiple departments mentioned
        if department and (' and ' in dept_lower or ' & ' in dept_lower or ', ' in dept_lower):
            multiple_dept_courses.append(course_id)
            indicators.append('multiple_departments')
        
        # Check for courses that span multiple subject areas in title
        # (e.g., "Computer Science and Mathematics", "Physics and Chemistry")
        subject_areas = ['computer science', 'mathematics', 'physics', 'chemistry', 
                        'biology', 'engineering', 'economics', 'history', 'literature']
        found_areas = [area for area in subject_areas if area in title_lower]
        if len(found_areas) > 1:
            indicators.append('multiple_subjects_in_title')
        
        if indicators:
            multidisciplinary_courses.append({
                'id': course_id,
                'title': title,
                'department': department,
                'indicators': indicators
            })
    
    # Remove duplicates (courses may have multiple indicators)
    unique_multidisciplinary = {c['id']: c for c in multidisciplinary_courses}.values()
    
    print("=" * 70)
    print("MIT OCW Multidisciplinary Course Analysis")
    print("=" * 70)
    print()
    print(f"Total courses: {len(data['nodes'])}")
    print(f"Multidisciplinary courses: {len(unique_multidisciplinary)}")
    print(f"Percentage: {len(unique_multidisciplinary) / len(data['nodes']) * 100:.1f}%")
    print()
    
    print("Breakdown by indicator type:")
    print(f"  Joint notation (J, SC, W): {len(joint_notation_courses)}")
    print(f"  Multiple departments: {len(multiple_dept_courses)}")
    print()
    
    # Group by indicator type
    by_indicator = defaultdict(list)
    for course in unique_multidisciplinary:
        for indicator in course['indicators']:
            by_indicator[indicator].append(course['id'])
    
    print("Courses by indicator type:")
    for indicator, courses in sorted(by_indicator.items(), key=lambda x: -len(x[1])):
        print(f"  {indicator}: {len(courses)} courses")
    print()
    
    print("Sample multidisciplinary courses:")
    for course in list(unique_multidisciplinary)[:20]:
        print(f"  {course['id']}: {course['title'][:70]}")
        if course['department']:
            print(f"    Department: {course['department']}")
        print(f"    Indicators: {', '.join(course['indicators'])}")
        print()
    
    return unique_multidisciplinary

if __name__ == "__main__":
    analyze_multidisciplinary()
