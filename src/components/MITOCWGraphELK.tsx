import { useEffect, useRef, useState } from 'react';
import ELK from 'elkjs';
import type { MITOCWGraph } from '../types/mit-ocw';

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

            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <rect
                  width={node.width}
                  height={node.height}
                  rx="8"
                  fill="#3b82f6"
                  stroke="#1e40af"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-blue-600 transition-colors"
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
