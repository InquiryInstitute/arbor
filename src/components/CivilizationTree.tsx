import { useEffect, useRef, useState, useCallback } from 'react';
import ELK from 'elkjs';
import type { CivilizationNode, CivilizationRelation } from '../data/civilizations';
import { allCivilizationNodes, civilizationRelations } from '../data/civilizations';

// Type definitions for ELK
interface ELKNode {
  id: string;
  labels?: Array<{ text: string }>;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  children?: ELKNode[];
  layoutOptions?: Record<string, string>;
}

interface ELKEdge {
  id: string;
  sources: string[];
  targets: string[];
  labels?: Array<{ text: string }>;
}

interface ELKGraph {
  id: string;
  children: ELKNode[];
  edges: ELKEdge[];
}

// Color mapping for relation types
const relationColors: Record<CivilizationRelation['relation_type'], string> = {
  grows_from: '#2d5a27',      // Dark green - strong connection
  grafts: '#8b4513',          // Brown - merging
  pollinates: '#ff9800',      // Orange - cross-fertilization
  strangles: '#d32f2f',       // Red - suppression
  carries: '#1976d2',         // Blue - transmission
  synthesizes: '#9c27b0',     // Purple - combination
};

interface CivilizationTreeProps {
  width?: number;
  height?: number;
}

export default function CivilizationTree({ 
  width = 1600,
  height = 1000,
}: CivilizationTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const [layout, setLayout] = useState<ELKGraph | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Pan/zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    async function computeLayout() {
      const elk = new ELK();
      
      // Create nodes with appropriate sizes based on type
      const elkNodes: ELKNode[] = allCivilizationNodes.map(node => {
        let nodeWidth = 180;
        let nodeHeight = 100;
        
        if (node.type === 'trunk') {
          nodeWidth = 200;
          nodeHeight = 80;
        } else if (node.type === 'cross-vine') {
          nodeWidth = 150;
          nodeHeight = 70;
        }
        
        // Layer assignment: trunk at bottom (layer 0), then major vines, then cross-vines at top
        let layer = 0;
        if (node.type === 'vine') {
          layer = 1;
        } else if (node.type === 'cross-vine') {
          layer = 2;
        }
        
        return {
          id: node.id,
          labels: [{ text: node.name }],
          width: nodeWidth,
          height: nodeHeight,
          layoutOptions: {
            'elk.layered.layer': layer.toString(),
            'elk.portAlignment.basic': 'JUSTIFIED',
          },
        };
      });

      // Convert relations to edges
      const elkEdges: ELKEdge[] = civilizationRelations.map(rel => ({
        id: rel.id,
        sources: [rel.from_id],
        targets: [rel.to_id],
        labels: rel.description ? [{ text: rel.description }] : undefined,
      }));

      const graph: ELKGraph = {
        id: 'root',
        children: elkNodes,
        edges: elkEdges,
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'UP', // Bottom to top (trunk at bottom)
          'elk.spacing.nodeNode': '50',
          'elk.layered.spacing.nodeNodeBetweenLayers': '150',
          'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
          'elk.layered.spacing.edgeNodeBetweenLayers': '60',
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
  }, []);

  // Calculate bounding box
  const getBoundingBox = useCallback(() => {
    if (!layout || !layout.children || layout.children.length === 0) {
      return { minX: 0, minY: 0, maxX: width, maxY: height, width: width, height: height };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    layout.children.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        const nodeWidth = node.width || 200;
        const nodeHeight = node.height || 80;
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + nodeWidth);
        maxY = Math.max(maxY, node.y + nodeHeight);
      }
    });

    const padding = 50;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: maxX - minX + 2 * padding,
      height: maxY - minY + 2 * padding,
    };
  }, [layout, width, height]);

  // Zoom to fit
  const zoomToFit = useCallback(() => {
    const bbox = getBoundingBox();
    const scaleX = width / bbox.width;
    const scaleY = height / bbox.height;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;
    
    const centerX = (bbox.minX + bbox.maxX) / 2;
    const centerY = (bbox.minY + bbox.maxY) / 2;
    
    setTransform({
      x: width / 2 - centerX * scale,
      y: height / 2 - centerY * scale,
      scale,
    });
  }, [getBoundingBox, width, height]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setTransform({
        ...transform,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom handler
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      
      setTransform(prev => {
        const newScale = Math.max(0.1, Math.min(10, prev.scale * delta));
        
        const rect = svgElement.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleChange = newScale / prev.scale;
        return {
          x: mouseX - (mouseX - prev.x) * scaleChange,
          y: mouseY - (mouseY - prev.y) * scaleChange,
          scale: newScale,
        };
      });
    };

    svgElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      svgElement.removeEventListener('wheel', handleWheel);
    };
  }, [setTransform]);

  // Zoom to fit on layout change
  useEffect(() => {
    if (layout && !loading) {
      setTimeout(zoomToFit, 100);
    }
  }, [layout, loading, zoomToFit]);

  if (loading || !layout) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading tree of vines...</p>
      </div>
    );
  }

  const allNodes = layout.children || [];
  const selectedNode = selectedNodeId ? allCivilizationNodes.find(n => n.id === selectedNodeId) : null;

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Info panel for selected node */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          background: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '300px',
          border: `3px solid ${selectedNode.color || '#666'}`,
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {selectedNode.emoji} {selectedNode.name}
          </div>
          {selectedNode.description && (
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', fontStyle: 'italic' }}>
              {selectedNode.description}
            </p>
          )}
          <div style={{ marginTop: '0.75rem' }}>
            <strong>Themes:</strong>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
              {selectedNode.themes.map(theme => (
                <li key={theme}>{theme}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <strong>Gifts:</strong>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem', fontSize: '0.85rem' }}>
              {selectedNode.gifts.map(gift => (
                <li key={gift}>{gift}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            style={{
              marginTop: '0.75rem',
              padding: '0.25rem 0.75rem',
              background: '#f5f5f5',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
      }}>
        <button
          onClick={() => setTransform({ ...transform, scale: Math.min(10, transform.scale * 1.2) })}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setTransform({ ...transform, scale: Math.max(0.1, transform.scale * 0.8) })}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={zoomToFit}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
          title="Zoom to fit"
        >
          ⌂
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
          title="Reset"
        >
          ⟲
        </button>
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #ccc', background: '#fafafa', cursor: isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Arrow markers for different relation types */}
          {Object.entries(relationColors).map(([type, color]) => (
            <marker
              key={type}
              id={`arrowhead-${type}`}
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill={color} />
            </marker>
          ))}
        </defs>

        <g
          ref={containerRef}
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        >
          {/* Render edges first */}
          {layout.edges?.map(edge => {
            const sourceNode = allNodes.find(n => n.id === edge.sources[0]);
            const targetNode = allNodes.find(n => n.id === edge.targets[0]);
            
            if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
              return null;
            }

            const relation = civilizationRelations.find(r => r.id === edge.id);
            const relationType = relation?.relation_type || 'grows_from';
            const strokeColor = relationColors[relationType] || '#666';
            const strokeWidth = relationType === 'grows_from' ? 3 : relationType === 'grafts' ? 2.5 : 2;
            const strokeDasharray = relationType === 'strangles' ? '5,5' : undefined;
            const opacity = relationType === 'strangles' ? 0.6 : 0.8;

            const sourceX = sourceNode.x + (sourceNode.width || 0) / 2;
            const sourceY = sourceNode.y + (sourceNode.height || 0) / 2;
            const targetX = targetNode.x + (targetNode.width || 0) / 2;
            const targetY = targetNode.y + (targetNode.height || 0) / 2;

            return (
              <line
                key={edge.id}
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeOpacity={opacity}
                markerEnd={`url(#arrowhead-${relationType})`}
              />
            );
          })}

          {/* Render nodes */}
          {allNodes.map(node => {
            const civNode = allCivilizationNodes.find(c => c.id === node.id);
            if (!node.x || !node.y || !node.width || !node.height || !civNode) {
              return null;
            }

            const isHovered = hoveredNodeId === node.id;
            const isSelected = selectedNodeId === node.id;
            const nodeColor = civNode.color || '#888';
            const strokeWidth = isSelected ? 4 : isHovered ? 3 : 2;
            const nodeOpacity = isSelected ? 1 : isHovered ? 0.9 : 0.8;

            return (
              <g 
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-out',
                }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={nodeColor}
                  stroke={isSelected ? '#000' : nodeColor}
                  strokeWidth={strokeWidth}
                  rx={6}
                  opacity={nodeOpacity}
                  style={{ 
                    filter: isSelected ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' : 
                            isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none',
                    transition: 'all 0.2s ease-out',
                  }}
                />
                <text
                  x={node.x + node.width / 2}
                  y={node.y + node.height / 2 - 12}
                  fontSize={civNode.type === 'trunk' ? 14 : civNode.type === 'cross-vine' ? 11 : 13}
                  fontWeight={civNode.type === 'trunk' ? 'bold' : 'normal'}
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ 
                    pointerEvents: 'none',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {civNode.emoji && `${civNode.emoji} `}
                  {node.labels?.[0]?.text || civNode.name}
                </text>
                {civNode.type !== 'trunk' && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height - 8}
                    fontSize={9}
                    fill="#fff"
                    textAnchor="middle"
                    style={{ 
                      pointerEvents: 'none',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {civNode.type === 'vine' ? 'Civilization' : 'Force'}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
