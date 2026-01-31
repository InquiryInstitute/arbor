import { useEffect, useState, useMemo } from 'react';
import type { MITOCWGraph, MITOCWNode } from '../types/mit-ocw';

interface TopicGroup {
  topic: string;
  courses: MITOCWNode[];
  undergraduate: MITOCWNode[];
  graduate: MITOCWNode[];
  count: number;
}

// Map course number prefixes to topics (vines)
const COURSE_PREFIX_TO_TOPIC: Record<string, string> = {
  '1': 'Engineering',
  '2': 'Mechanical Engineering',
  '3': 'Materials Science',
  '4': 'Architecture',
  '5': 'Chemistry',
  '6': 'Computer Science',
  '7': 'Biology',
  '8': 'Physics',
  '9': 'Brain and Cognitive Sciences',
  '10': 'Chemical Engineering',
  '11': 'Urban Studies and Planning',
  '12': 'Earth, Atmospheric, and Planetary Sciences',
  '14': 'Economics',
  '15': 'Management',
  '16': 'Aerospace Engineering',
  '17': 'Political Science',
  '18': 'Mathematics',
  '20': 'Biological Engineering',
  '21': 'Humanities',
  '21A': 'Anthropology',
  '21H': 'History',
  '21L': 'Literature',
  '21M': 'Music and Theater Arts',
  '22': 'Nuclear Science and Engineering',
  '24': 'Linguistics and Philosophy',
  'CC': 'Comparative Media Studies',
  'CMS': 'Comparative Media Studies',
  'ES': 'Experimental Study Group',
  'HST': 'Health Sciences and Technology',
  'IDS': 'Institute for Data, Systems, and Society',
  'MAS': 'Media Arts and Sciences',
  'SCM': 'Supply Chain Management',
  'SP': 'Special Programs',
  'STS': 'Science, Technology, and Society',
  'WGS': 'Women\'s and Gender Studies',
};

function getTopicFromCourse(course: MITOCWNode): string {
  // First try department if available
  if (course.department) {
    return course.department;
  }
  
  // Extract course prefix (e.g., "18" from "18.01", "6" from "6.042")
  const match = course.id.match(/^(\d+[A-Z]?)/);
  if (match) {
    const prefix = match[1];
    // Check exact match first
    if (COURSE_PREFIX_TO_TOPIC[prefix]) {
      return COURSE_PREFIX_TO_TOPIC[prefix];
    }
    // Check numeric prefix
    const numPrefix = prefix.replace(/[A-Z]/g, '');
    if (COURSE_PREFIX_TO_TOPIC[numPrefix]) {
      return COURSE_PREFIX_TO_TOPIC[numPrefix];
    }
  }
  
  return 'Other';
}

function isGraduate(course: MITOCWNode): boolean {
  if (course.level) {
    return course.level.toLowerCase().includes('graduate') || course.level.toLowerCase().includes('grad');
  }
  // MIT course numbers: 7xx+ are typically graduate
  const match = course.id.match(/\.(\d+)/);
  if (match) {
    const courseNum = parseInt(match[1]);
    return courseNum >= 700;
  }
  return false;
}

export function MITOCWTopics() {
  const [graphData, setGraphData] = useState<MITOCWGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'undergraduate' | 'graduate'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        let response = await fetch('/data/mit-ocw-graph.json');
        if (!response.ok) {
          response = await fetch('/arbor/data/mit-ocw-graph.json');
        }
        if (!response.ok) {
          throw new Error('Graph data not found');
        }
        const data: MITOCWGraph = await response.json();
        setGraphData(data);
      } catch (err) {
        console.error('Error loading graph data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const topicGroups = useMemo(() => {
    if (!graphData) return [];

    // Group courses by topic (vine)
    const groups = new Map<string, { undergraduate: MITOCWNode[]; graduate: MITOCWNode[] }>();
    
    graphData.nodes.forEach(course => {
      const topic = getTopicFromCourse(course);
      if (!groups.has(topic)) {
        groups.set(topic, { undergraduate: [], graduate: [] });
      }
      
      if (isGraduate(course)) {
        groups.get(topic)!.graduate.push(course);
      } else {
        groups.get(topic)!.undergraduate.push(course);
      }
    });

    // Convert to array and sort by total count
    const topicArray: TopicGroup[] = Array.from(groups.entries())
      .map(([topic, { undergraduate, graduate }]) => ({
        topic,
        courses: [...undergraduate, ...graduate],
        undergraduate,
        graduate,
        count: undergraduate.length + graduate.length,
      }))
      .sort((a, b) => b.count - a.count);

    return topicArray;
  }, [graphData]);

  const filteredGroups = useMemo(() => {
    if (!selectedTopic && !searchQuery && selectedLevel === 'all') return topicGroups;

    return topicGroups
      .map(group => {
        let courses = group.courses;
        
        // Filter by topic
        if (selectedTopic && group.topic !== selectedTopic) {
          return { ...group, courses: [], undergraduate: [], graduate: [] };
        }
        
        // Filter by level
        if (selectedLevel === 'undergraduate') {
          courses = group.undergraduate;
        } else if (selectedLevel === 'graduate') {
          courses = group.graduate;
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          courses = courses.filter(course =>
            course.id.toLowerCase().includes(query) ||
            course.title.toLowerCase().includes(query) ||
            course.label.toLowerCase().includes(query)
          );
        }
        
        return {
          ...group,
          courses,
          undergraduate: selectedLevel === 'all' || selectedLevel === 'undergraduate' 
            ? group.undergraduate.filter(c => 
                !searchQuery || c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : [],
          graduate: selectedLevel === 'all' || selectedLevel === 'graduate'
            ? group.graduate.filter(c =>
                !searchQuery || c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : [],
        };
      })
      .filter(group => group.courses.length > 0);
  }, [topicGroups, selectedTopic, selectedLevel, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="p-8 text-center text-gray-600">
        <p>Failed to load course data.</p>
      </div>
    );
  }

  const totalUndergraduate = topicGroups.reduce((sum, g) => sum + g.undergraduate.length, 0);
  const totalGraduate = topicGroups.reduce((sum, g) => sum + g.graduate.length, 0);

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Courses by Vine (Topic)</h2>
        <p className="text-sm text-gray-600 mb-4">
          {totalUndergraduate} Undergraduate • {totalGraduate} Graduate • {graphData.nodes.length} Total
        </p>
        
        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as 'all' | 'undergraduate' | 'graduate')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
          </select>
          <select
            value={selectedTopic || ''}
            onChange={(e) => setSelectedTopic(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Vines</option>
            {topicGroups.map(group => (
              <option key={group.topic} value={group.topic}>
                {group.topic} ({group.count})
              </option>
            ))}
          </select>
        </div>

        {/* Vine Summary - Sortable Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {/* Add sorting logic if needed */}}>
                  Topic (Vine)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Undergraduate
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Graduate
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topicGroups.map((group, index) => (
                <tr
                  key={group.topic}
                  onClick={() => setSelectedTopic(selectedTopic === group.topic ? null : group.topic)}
                  className={`cursor-pointer transition-colors ${
                    selectedTopic === group.topic
                      ? 'bg-green-50 hover:bg-green-100'
                      : 'hover:bg-gray-50'
                  } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🌿</span>
                      <span className="font-medium text-sm text-gray-900">{group.topic}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-blue-700 font-medium">
                    {group.undergraduate.length}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-purple-700 font-medium">
                    {group.graduate.length}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                    {group.count}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 font-semibold text-sm text-gray-900">Total</td>
                <td className="px-4 py-3 text-right text-sm text-blue-700 font-semibold">{totalUndergraduate}</td>
                <td className="px-4 py-3 text-right text-sm text-purple-700 font-semibold">{totalGraduate}</td>
                <td className="px-4 py-3 text-right text-sm text-gray-900 font-bold">{graphData.nodes.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Vines (Topic Groups) */}
      <div className="space-y-8">
        {filteredGroups.map(group => (
          <div key={group.topic} className="border-l-4 border-green-600 bg-white rounded-r-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🌿 {group.topic} 
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({group.undergraduate.length} UG, {group.graduate.length} G)
              </span>
            </h3>
            
            {/* Undergraduate Courses */}
            {group.undergraduate.length > 0 && (selectedLevel === 'all' || selectedLevel === 'undergraduate') && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                  Undergraduate ({group.undergraduate.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.undergraduate.map(course => (
                    <a
                      key={course.id}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-blue-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">{course.id}</div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">{course.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Graduate Courses */}
            {group.graduate.length > 0 && (selectedLevel === 'all' || selectedLevel === 'graduate') && (
              <div>
                <h4 className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide">
                  Graduate ({group.graduate.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.graduate.map(course => (
                    <a
                      key={course.id}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border border-purple-200 rounded hover:border-purple-500 hover:bg-purple-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">{course.id}</div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">{course.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
