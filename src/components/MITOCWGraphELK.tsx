import { useEffect, useRef, useState, useMemo } from 'react';
import ELK from 'elkjs';
import type { MITOCWGraph, MITOCWNode } from '../types/mit-ocw';

// Map course number prefixes to topics (same as MITOCWTopics)
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
  if (course.department) {
    return course.department;
  }
  const match = course.id.match(/^(\d+[A-Z]?)/);
  if (match) {
    const prefix = match[1];
    if (COURSE_PREFIX_TO_TOPIC[prefix]) {
      return COURSE_PREFIX_TO_TOPIC[prefix];
    }
    const numPrefix = prefix.replace(/[A-Z]/g, '');
    if (COURSE_PREFIX_TO_TOPIC[numPrefix]) {
      return COURSE_PREFIX_TO_TOPIC[numPrefix];
    }
  }
  return 'Other';
}

// Color palette for topics
const TOPIC_COLORS: Record<string, { fill: string; stroke: string }> = {
  'Computer Science': { fill: '#3b82f6', stroke: '#1e40af' },
  'Mathematics': { fill: '#8b5cf6', stroke: '#6d28d9' },
  'Physics': { fill: '#ef4444', stroke: '#dc2626' },
  'Chemistry': { fill: '#10b981', stroke: '#059669' },
  'Biology': { fill: '#14b8a6', stroke: '#0d9488' },
  'Engineering': { fill: '#f59e0b', stroke: '#d97706' },
  'Mechanical Engineering': { fill: '#f97316', stroke: '#ea580c' },
  'Electrical Engineering': { fill: '#ec4899', stroke: '#db2777' },
  'Economics': { fill: '#06b6d4', stroke: '#0891b2' },
  'Management': { fill: '#84cc16', stroke: '#65a30d' },
  'Urban Studies and Planning': { fill: '#22c55e', stroke: '#16a34a' },
  'Architecture': { fill: '#a855f7', stroke: '#9333ea' },
  'Political Science': { fill: '#6366f1', stroke: '#4f46e5' },
  'Brain and Cognitive Sciences': { fill: '#ec4899', stroke: '#db2777' },
  'Earth, Atmospheric, and Planetary Sciences': { fill: '#0ea5e9', stroke: '#0284c7' },
  'Aerospace Engineering': { fill: '#64748b', stroke: '#475569' },
  'Materials Science': { fill: '#f43f5e', stroke: '#e11d48' },
  'Chemical Engineering': { fill: '#14b8a6', stroke: '#0d9488' },
  'Biological Engineering': { fill: '#22c55e', stroke: '#16a34a' },
  'Nuclear Science and Engineering': { fill: '#fbbf24', stroke: '#f59e0b' },
  'Linguistics and Philosophy': { fill: '#a78bfa', stroke: '#8b5cf6' },
  'Humanities': { fill: '#fb7185', stroke: '#f43f5e' },
  'Anthropology': { fill: '#c084fc', stroke: '#a855f7' },
  'History': { fill: '#f472b6', stroke: '#ec4899' },
  'Literature': { fill: '#60a5fa', stroke: '#3b82f6' },
  'Music and Theater Arts': { fill: '#34d399', stroke: '#10b981' },
  'Other': { fill: '#94a3b8', stroke: '#64748b' },
};

function getTopicColor(topic: string): { fill: string; stroke: string } {
  return TOPIC_COLORS[topic] || TOPIC_COLORS['Other'];
}

interface ELKNode {
  id: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  labels?: Array<{ text: string; x?: number; y?: number }>;
}

interface ELKEdge {
  id: string;
  sources: string[];
  targets: string[];
}

export function MITOCWGraphELK() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [graphData, setGraphData] = useState<MITOCWGraph | null>(null);
  const [layout, setLayout] = useState<{ nodes: ELKNode[]; edges: ELKEdge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load graph data
  useEffect(() => {
    async function loadData() {
      try {
        // Try different paths (with and without base path)
        let response = await fetch('/data/mit-ocw-graph.json');
        if (!response.ok) {
          // Try with base path
          response = await fetch('/arbor/data/mit-ocw-graph.json');
        }
        if (!response.ok) {
          // Try relative path
          response = await fetch('./data/mit-ocw-graph.json');
        }
        if (!response.ok) {
          throw new Error('Graph data not found. Run the Python script to generate it.');
        }
        const data: MITOCWGraph = await response.json();
        setGraphData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph data');
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute ELK layout
  useEffect(() => {
    if (!graphData) return;

    async function computeLayout() {
      try {
        const elk = new ELK();

        // Convert to ELK format
        const elkGraph = {
          id: 'root',
          layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': 'DOWN',
            'elk.spacing.nodeNode': '80',
            'elk.spacing.edgeNode': '20',
            'elk.layered.spacing.nodeNodeBetweenLayers': '100',
            'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
          },
          children: graphData.nodes.map((node): ELKNode => ({
            id: node.id,
            width: 120,
            height: 60,
            labels: [{ text: node.id }],
          })),
          edges: graphData.edges.map((edge): ELKEdge => ({
            id: `${edge.source}-${edge.target}`,
            sources: [edge.source],
            targets: [edge.target],
          })),
        };

        const layoutedGraph = await elk.layout(elkGraph);
        
        if (layoutedGraph.children) {
          setLayout({
            nodes: layoutedGraph.children as ELKNode[],
            edges: layoutedGraph.edges || [],
          });
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Layout computation failed');
        setLoading(false);
      }
    }

    computeLayout();
  }, [graphData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 font-semibold mb-2">Error</p>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-4">
            Run: <code className="bg-red-100 px-2 py-1 rounded">python scripts/fetch_mit_ocw.py</code>
          </p>
        </div>
      </div>
    );
  }

  if (!graphData || !layout) {
    return null;
  }

  // Get node data for rendering
  const nodeMap = new Map(graphData.nodes.map(n => [n.id, n]));
  const edgeMap = new Map(graphData.edges.map(e => [`${e.source}-${e.target}`, e]));
  
  // Create topic color map
  const topicColorMap = useMemo(() => {
    const map = new Map<string, { fill: string; stroke: string }>();
    graphData.nodes.forEach(node => {
      const topic = getTopicFromCourse(node);
      if (!map.has(topic)) {
        map.set(topic, getTopicColor(topic));
      }
    });
    return map;
  }, [graphData]);

  // Calculate viewBox
  const nodes = layout.nodes.filter(n => n.x !== undefined && n.y !== undefined);
  if (nodes.length === 0) return null;

  const minX = Math.min(...nodes.map(n => n.x!)) - 100;
  const minY = Math.min(...nodes.map(n => n.y!)) - 100;
  const maxX = Math.max(...nodes.map(n => n.x! + n.width)) + 100;
  const maxY = Math.max(...nodes.map(n => n.y! + n.height)) + 100;
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <div className="w-full h-full border border-gray-300 rounded-lg bg-white overflow-auto">
      <svg
        ref={svgRef}
        width="100%"
        height="800"
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="block"
      >
        <defs>
          <marker
            id="arrowhead-prereq"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0,0 10,3 0,6" fill="#2563eb" />
          </marker>
          <marker
            id="arrowhead-coreq"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0,0 10,3 0,6" fill="#10b981" />
          </marker>
        </defs>

        {/* Draw edges */}
        <g className="edges">
          {layout.edges.map(edge => {
            const edgeData = edgeMap.get(edge.id);
            const sourceNode = layout.nodes.find(n => n.id === edge.sources[0]);
            const targetNode = layout.nodes.find(n => n.id === edge.targets[0]);
            
            if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || 
                targetNode.x === undefined || targetNode.y === undefined) {
              return null;
            }

            const x1 = sourceNode.x + sourceNode.width / 2;
            const y1 = sourceNode.y + sourceNode.height;
            const x2 = targetNode.x + targetNode.width / 2;
            const y2 = targetNode.y;

            return (
              <line
                key={edge.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edgeData?.type === 'prerequisite' ? '#2563eb' : '#10b981'}
                strokeWidth="2"
                opacity="0.6"
                markerEnd={`url(#arrowhead-${edgeData?.type || 'prereq'})`}
              />
            );
          })}
        </g>

        {/* Draw nodes */}
        <g className="nodes">
          {layout.nodes.map(node => {
            if (node.x === undefined || node.y === undefined) return null;
            
            const nodeData = nodeMap.get(node.id);
            if (!nodeData) return null;

            const topic = getTopicFromCourse(nodeData);
            const colors = topicColorMap.get(topic) || getTopicColor('Other');

            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <rect
                  width={node.width}
                  height={node.height}
                  rx="8"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:opacity-80"
                  onClick={() => window.open(nodeData.url, '_blank')}
                />
                <text
                  x={node.width / 2}
                  y={node.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                  className="pointer-events-none select-none"
                >
                  {node.id}
                </text>
                <title>{nodeData.label}</title>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
