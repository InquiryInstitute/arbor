import { useEffect, useRef, useState } from 'react';
import ELK from 'elkjs';
import type { Credential, CredentialRelation, ELKGraph, ELKNode, ELKEdge } from '../types/credential';
import { sampleCredentials, sampleRelations } from '../data/sample-credentials';

interface VineTreeProps {
  credentials?: Credential[];
  relations?: CredentialRelation[];
  width?: number;
  height?: number;
}

export default function VineTree({ 
  credentials = sampleCredentials, 
  relations = sampleRelations,
  width = 1200,
  height = 800,
}: VineTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<ELKGraph | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function computeLayout() {
      const elk = new ELK();
      
      // Group credentials by level_band, then by college
      const byLevel = new Map<string, Map<string, Credential[]>>();
      credentials.forEach(cred => {
        if (!byLevel.has(cred.level_band)) {
          byLevel.set(cred.level_band, new Map());
        }
        const byCollege = byLevel.get(cred.level_band)!;
        if (!byCollege.has(cred.college_primary)) {
          byCollege.set(cred.college_primary, []);
        }
        byCollege.get(cred.college_primary)!.push(cred);
      });

      // Create hierarchical structure: root -> levels -> colleges -> credentials
      const levelNodes: ELKNode[] = [];
      const allEdges: ELKEdge[] = [];
      const collegeOrder = ['HUM', 'MATH', 'NAT', 'AINS', 'SOC', 'ELA', 'ARTS', 'HEAL', 'CEF', 'META'];
      
      // Sort levels from bottom to top
      const levelOrder = ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'];
      const sortedLevels = Array.from(byLevel.entries()).sort((a, b) => {
        const idxA = levelOrder.indexOf(a[0]);
        const idxB = levelOrder.indexOf(b[0]);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });

      sortedLevels.forEach(([levelBand, byCollege]) => {
        const collegeNodes: ELKNode[] = [];
        
        // Sort colleges by defined order
        const sortedColleges = Array.from(byCollege.entries()).sort((a, b) => {
          const idxA = collegeOrder.indexOf(a[0]);
          const idxB = collegeOrder.indexOf(b[0]);
          return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
        });

        sortedColleges.forEach(([college, creds]) => {
          const credentialNodes: ELKNode[] = creds.map(cred => ({
            id: cred.id,
            labels: [{ text: cred.title }],
            width: cred.cadence === 'seasonal' ? 200 : 150,
            height: cred.cadence === 'seasonal' ? 80 : 60,
          }));

          // Create college container node
          const collegeNode: ELKNode = {
            id: `${levelBand}-${college}`,
            labels: [{ text: college }],
            children: credentialNodes,
            width: 0, // Will be calculated
            height: 0, // Will be calculated
            layoutOptions: {
              'elk.padding': '[top=10,left=10,bottom=10,right=10]',
              'elk.spacing.nodeNode': '20',
            },
          };
          collegeNodes.push(collegeNode);
        });

        // Create level container node
        const levelNode: ELKNode = {
          id: `level-${levelBand}`,
          labels: [{ text: levelBand }],
          children: collegeNodes,
          width: 0,
          height: 0,
          layoutOptions: {
            'elk.padding': '[top=20,left=20,bottom=20,right=20]',
            'elk.spacing.nodeNode': '40',
            'elk.direction': 'RIGHT', // Colleges side by side
          },
        };
        levelNodes.push(levelNode);
      });

      // Convert relations to edges (using full paths)
      relations.forEach(rel => {
        allEdges.push({
          id: rel.id,
          sources: [rel.from_credential_id],
          targets: [rel.to_credential_id],
          labels: rel.relation_type === 'PART_OF' 
            ? [{ text: 'PART_OF' }] 
            : rel.relation_type === 'PREREQ'
            ? [{ text: 'PREREQ' }]
            : undefined,
        });
      });

      const graph: ELKGraph = {
        id: 'root',
        children: levelNodes,
        edges: allEdges,
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'UP', // Bottom to top
          'elk.spacing.nodeNode': '100',
          'elk.layered.spacing.nodeNodeBetweenLayers': '150',
          'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        },
      };

      try {
        const layouted = await elk.layout(graph);
        setLayout(layouted);
        setLoading(false);
      } catch (error) {
        console.error('Layout computation failed:', error);
        setLoading(false);
      }
    }

    computeLayout();
  }, [credentials, relations]);

  // Helper to recursively find a node by ID in the hierarchy
  const findNode = (node: ELKNode, id: string): ELKNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Flatten all credential nodes for rendering
  const flattenNodes = (nodes: ELKNode[] | undefined): ELKNode[] => {
    if (!nodes) return [];
    const result: ELKNode[] = [];
    const traverse = (node: ELKNode) => {
      // Only include leaf nodes (credentials), not container nodes
      if (!node.children || node.children.length === 0) {
        result.push(node);
      } else {
        node.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return result;
  };

  if (loading || !layout) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading tree...</p>
      </div>
    );
  }

  const allCredentialNodes = flattenNodes(layout.children);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ccc', background: '#fafafa' }}
    >
      {/* Render edges first (so they appear behind nodes) */}
      {layout.edges?.map(edge => {
        const sourceNode = layout.children ? 
          (findNode({ id: 'root', children: layout.children } as ELKNode, edge.sources[0]) || 
           allCredentialNodes.find(n => n.id === edge.sources[0])) : null;
        const targetNode = layout.children ?
          (findNode({ id: 'root', children: layout.children } as ELKNode, edge.targets[0]) ||
           allCredentialNodes.find(n => n.id === edge.targets[0])) : null;
        
        if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
          return null;
        }

        const sourceX = sourceNode.x + (sourceNode.width || 0) / 2;
        const sourceY = sourceNode.y + (sourceNode.height || 0) / 2;
        const targetX = targetNode.x + (targetNode.width || 0) / 2;
        const targetY = targetNode.y + (targetNode.height || 0) / 2;

        const isPartOf = edge.labels?.[0]?.text === 'PART_OF';
        const isRecommended = edge.labels?.[0]?.text === 'RECOMMENDED';
        const strokeWidth = isPartOf ? 3 : 1;
        const strokeColor = isPartOf ? '#2d5a27' : '#888';
        const strokeDasharray = isRecommended ? '5,5' : undefined;

        return (
          <g key={edge.id}>
            <line
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              markerEnd={isPartOf ? 'url(#arrowhead)' : undefined}
            />
            {/* Only show labels for non-PART_OF edges */}
            {edge.labels?.[0] && !isPartOf && (
              <text
                x={(sourceX + targetX) / 2}
                y={(sourceY + targetY) / 2 - 5}
                fontSize="10"
                fill="#666"
                textAnchor="middle"
              >
                {edge.labels[0].text}
              </text>
            )}
          </g>
        );
      })}

      {/* Arrow marker for PART_OF edges */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#2d5a27" />
        </marker>
      </defs>

      {/* Render nodes */}
      {allCredentialNodes.map(node => {
        const cred = credentials.find(c => c.id === node.id);
        if (!node.x || !node.y || !node.width || !node.height || !cred) {
          return null;
        }

        const isSeasonal = cred.cadence === 'seasonal';
        const fillColor = isSeasonal ? '#e8f5e9' : '#fff9c4';
        const strokeColor = isSeasonal ? '#2d5a27' : '#f57f17';
        const strokeWidth = isSeasonal ? 2 : 1.5;

        return (
          <g key={node.id}>
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              rx={4}
              style={{ cursor: 'pointer' }}
            />
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height / 2}
              fontSize={isSeasonal ? 12 : 10}
              fontWeight={isSeasonal ? 'bold' : 'normal'}
              fill="#333"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {node.labels?.[0]?.text || cred.title}
            </text>
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height - 5}
              fontSize="8"
              fill="#666"
              textAnchor="middle"
            >
              {isSeasonal ? '🌱' : '🌙'} {cred.college_primary}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
