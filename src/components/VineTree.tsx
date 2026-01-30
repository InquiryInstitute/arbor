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
      
      // Convert credentials to ELK nodes
      const elkNodes: ELKNode[] = credentials.map(cred => ({
        id: cred.id,
        labels: [{ text: cred.title }],
        width: cred.cadence === 'seasonal' ? 200 : 150,
        height: cred.cadence === 'seasonal' ? 80 : 60,
      }));

      // Convert relations to ELK edges
      const elkEdges: ELKEdge[] = relations.map(rel => ({
        id: rel.id,
        sources: [rel.from_credential_id],
        targets: [rel.to_credential_id],
        labels: rel.relation_type === 'PART_OF' 
          ? [{ text: 'PART_OF' }] 
          : rel.relation_type === 'PREREQ'
          ? [{ text: 'PREREQ' }]
          : undefined,
      }));

      const graph: ELKGraph = {
        id: 'root',
        children: elkNodes,
        edges: elkEdges,
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

  if (loading || !layout) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading tree...</p>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ border: '1px solid #ccc', background: '#fafafa' }}
    >
      {/* Render edges first (so they appear behind nodes) */}
      {layout.edges?.map(edge => {
        const sourceNode = layout.children?.find(n => n.id === edge.sources[0]);
        const targetNode = layout.children?.find(n => n.id === edge.targets[0]);
        
        if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
          return null;
        }

        const sourceX = sourceNode.x + (sourceNode.width || 0) / 2;
        const sourceY = sourceNode.y + (sourceNode.height || 0) / 2;
        const targetX = targetNode.x + (targetNode.width || 0) / 2;
        const targetY = targetNode.y + (targetNode.height || 0) / 2;

        const isPartOf = edge.labels?.[0]?.text === 'PART_OF';
        const strokeWidth = isPartOf ? 3 : 1;
        const strokeColor = isPartOf ? '#2d5a27' : '#888';
        const strokeDasharray = edge.labels?.[0]?.text === 'RECOMMENDED' ? '5,5' : undefined;

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
            {edge.labels?.[0] && (
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
      {layout.children?.map(node => {
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
