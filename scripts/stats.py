#!/usr/bin/env python3
"""
Generate statistics about the MIT OCW course graph.
"""

import json
import sys
from collections import defaultdict
from pathlib import Path

def analyze_graph(graph_path: str):
    """Analyze the graph and print statistics."""
    try:
        with open(graph_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Graph file not found at {graph_path}")
        print("Run 'python fetch_mit_ocw.py' to generate the graph first.")
        sys.exit(1)
    
    nodes = data.get('nodes', [])
    edges = data.get('edges', [])
    metadata = data.get('metadata', {})
    
    # Basic statistics
    print("=" * 60)
    print("MIT OpenCourseWare Course Graph Statistics")
    print("=" * 60)
    print()
    
    print("📊 Overall Statistics")
    print(f"  Total Courses: {len(nodes)}")
    print(f"  Total Edges: {len(edges)}")
    print(f"  Prerequisite Relationships: {metadata.get('total_prerequisites', 0)}")
    print(f"  Corequisite Relationships: {metadata.get('total_corequisites', 0)}")
    print()
    
    # Department breakdown
    dept_counts = defaultdict(int)
    dept_courses = defaultdict(list)
    
    for node in nodes:
        dept = node.get('department') or 'Unknown'
        dept_counts[dept] += 1
        dept_courses[dept].append(node['id'])
    
    print("📚 Courses by Department")
    if dept_counts:
        for dept, count in sorted(dept_counts.items(), key=lambda x: -x[1]):
            print(f"  {dept}: {count} courses")
            if count <= 10:  # Show course IDs for small departments
                print(f"    {', '.join(dept_courses[dept])}")
    else:
        print("  No department information available")
    print()
    
    # Level breakdown
    level_counts = defaultdict(int)
    for node in nodes:
        level = node.get('level') or 'Unknown'
        level_counts[level] += 1
    
    print("🎓 Courses by Level")
    if level_counts:
        for level, count in sorted(level_counts.items(), key=lambda x: -x[1]):
            print(f"  {level}: {count} courses")
    else:
        print("  No level information available")
    print()
    
    # Prerequisite analysis
    prereq_counts = defaultdict(int)
    for edge in edges:
        if edge.get('type') == 'prerequisite':
            target = edge.get('target')
            prereq_counts[target] += 1
    
    print("🔗 Prerequisite Analysis")
    if prereq_counts:
        courses_with_prereqs = len(prereq_counts)
        courses_without_prereqs = len(nodes) - courses_with_prereqs
        print(f"  Courses with prerequisites: {courses_with_prereqs}")
        print(f"  Courses without prerequisites: {courses_without_prereqs}")
        
        if prereq_counts:
            max_prereqs = max(prereq_counts.values())
            avg_prereqs = sum(prereq_counts.values()) / len(prereq_counts)
            print(f"  Maximum prerequisites for a course: {max_prereqs}")
            print(f"  Average prerequisites per course: {avg_prereqs:.2f}")
            
            # Show courses with most prerequisites
            top_prereqs = sorted(prereq_counts.items(), key=lambda x: -x[1])[:5]
            if top_prereqs:
                print(f"  Courses with most prerequisites:")
                for course_id, count in top_prereqs:
                    course = next((n for n in nodes if n['id'] == course_id), None)
                    title = course['title'] if course else course_id
                    print(f"    {course_id}: {count} prerequisites ({title})")
    else:
        print("  No prerequisite relationships found")
    print()
    
    # Corequisite analysis
    coreq_counts = defaultdict(int)
    for edge in edges:
        if edge.get('type') == 'corequisite':
            target = edge.get('target')
            coreq_counts[target] += 1
    
    if coreq_counts:
        print("🔗 Corequisite Analysis")
        print(f"  Courses with corequisites: {len(coreq_counts)}")
        print(f"  Total corequisite relationships: {sum(coreq_counts.values())}")
        print()
    
    # Graph connectivity
    print("🌐 Graph Connectivity")
    # Find courses with no prerequisites (entry points)
    all_targets = {edge['target'] for edge in edges}
    entry_points = [node['id'] for node in nodes if node['id'] not in all_targets]
    print(f"  Entry points (no prerequisites): {len(entry_points)}")
    if entry_points and len(entry_points) <= 10:
        print(f"    {', '.join(entry_points)}")
    
    # Find courses with no dependents (end points)
    all_sources = {edge['source'] for edge in edges}
    end_points = [node['id'] for node in nodes if node['id'] not in all_sources]
    print(f"  End points (no dependents): {len(end_points)}")
    if end_points and len(end_points) <= 10:
        print(f"    {', '.join(end_points)}")
    print()
    
    print("=" * 60)

if __name__ == "__main__":
    # Try to find the graph file
    script_dir = Path(__file__).parent
    possible_paths = [
        script_dir.parent / 'public' / 'data' / 'mit-ocw-graph.json',
        script_dir.parent / 'data' / 'mit-ocw-graph.json',
    ]
    
    graph_path = None
    for path in possible_paths:
        if path.exists():
            graph_path = str(path)
            break
    
    if not graph_path:
        print("Error: Could not find mit-ocw-graph.json")
        print("Run 'python fetch_mit_ocw.py' to generate the graph first.")
        sys.exit(1)
    
    analyze_graph(graph_path)
