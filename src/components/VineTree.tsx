import { useEffect, useRef, useState, useCallback } from 'react';
import ELK from 'elkjs';
import type { Credential, CredentialRelation, ELKGraph, ELKNode, ELKEdge, College, LevelBand } from '../types/credential';
import { sampleCredentials, sampleRelations } from '../data/sample-credentials';

// College color palette
const collegeColors: Record<College, string> = {
  'HUM': '#8B4513',    // Brown (humanities)
  'MATH': '#1E88E5',   // Blue (mathematics)
  'NAT': '#43A047',    // Green (natural sciences)
  'AINS': '#7B1FA2',   // Purple (AI/CS)
  'SOC': '#E53935',    // Red (social sciences)
  'ELA': '#F57C00',    // Orange (language arts)
  'ARTS': '#E91E63',   // Pink (arts)
  'HEAL': '#00ACC1',   // Cyan (health)
  'CEF': '#558B2F',    // Dark green (ecology/environment)
  'META': '#5D4037',   // Dark brown (meta/learning)
};

// Level band order for tinting (darker at roots, lighter at canopy)
const levelOrder: LevelBand[] = ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'];

// Convert hex to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
};

// Convert RGB to hex
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Generate tinted color based on level (darker at roots, lighter at canopy)
const getTintedColor = (baseColor: string, levelBand: LevelBand): string => {
  const levelIndex = levelOrder.indexOf(levelBand);
  const maxLevels = levelOrder.length;
  
  // Calculate tint factor: 0 (darkest/roots) to 1 (lightest/canopy)
  const tintFactor = levelIndex / (maxLevels - 1);
  
  // Interpolate between base color and white
  // Lower levels (roots) = darker, higher levels (canopy) = lighter
  const [r, g, b] = hexToRgb(baseColor);
  const whiteR = 255;
  const whiteG = 255;
  const whiteB = 255;
  
  const newR = r + (whiteR - r) * tintFactor * 0.4; // Max 40% lighter
  const newG = g + (whiteG - g) * tintFactor * 0.4;
  const newB = b + (whiteB - b) * tintFactor * 0.4;
  
  return rgbToHex(newR, newG, newB);
};

// Get stroke color (darker version for contrast)
const getStrokeColor = (baseColor: string, levelBand: LevelBand): string => {
  const levelIndex = levelOrder.indexOf(levelBand);
  const maxLevels = levelOrder.length;
  const darkenFactor = 1 - (levelIndex / (maxLevels - 1)) * 0.3; // Darken by up to 30%
  
  const [r, g, b] = hexToRgb(baseColor);
  return rgbToHex(r * darkenFactor, g * darkenFactor, b * darkenFactor);
};

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
  const containerRef = useRef<SVGGElement>(null);
  const [layout, setLayout] = useState<ELKGraph | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Pan/zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Handle node hover - just track which node is hovered
  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  };

  useEffect(() => {
    async function computeLayout() {
      const elk = new ELK();
      
      // Level order for layer assignment
      const levelOrder = ['K-1', 'G2-3', 'G4-6', 'G7-8', 'G9-10', 'G11-12', 'UG', 'MS', 'PhD', 'Faculty'];
      const collegeOrder = ['HUM', 'MATH', 'NAT', 'AINS', 'SOC', 'ELA', 'ARTS', 'HEAL', 'CEF', 'META'];
      
      // Create flat list of credential nodes with layer hints
      const elkNodes: ELKNode[] = credentials.map(cred => {
        const levelIndex = levelOrder.indexOf(cred.level_band);
        const collegeIndex = collegeOrder.indexOf(cred.college_primary);
        
        return {
          id: cred.id,
          labels: [{ text: cred.title }],
          width: cred.cadence === 'seasonal' ? 200 : 150,
          height: cred.cadence === 'seasonal' ? 80 : 60,
          layoutOptions: {
            'elk.layered.layer': levelIndex >= 0 ? levelIndex.toString() : undefined,
            'elk.portAlignment.basic': 'JUSTIFIED',
            // Use priority to help with horizontal ordering within layer
            'elk.priority': collegeIndex >= 0 ? collegeIndex.toString() : undefined,
          },
        };
      });

      // Convert relations to edges
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
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'UP', // Bottom to top
          'elk.spacing.nodeNode': '40',
          'elk.layered.spacing.nodeNodeBetweenLayers': '120',
          'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
          'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
          'elk.layered.spacing.edgeNodeBetweenLayers': '40',
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

  // Calculate bounding box of all nodes
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

    // Add padding
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
    const scale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to add some padding
    
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
    if (e.button === 0) { // Left mouse button
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

  // Zoom handler - must use native event listener with passive: false
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      
      // Get current transform from state using a ref or functional update
      setTransform(prev => {
        const newScale = Math.max(0.1, Math.min(5, prev.scale * delta));
        
        // Zoom towards mouse position
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

    // Attach with passive: false to allow preventDefault
    svgElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      svgElement.removeEventListener('wheel', handleWheel);
    };
  }, [setTransform]);

  // Zoom to fit on layout change
  useEffect(() => {
    if (layout && !loading) {
      setTimeout(zoomToFit, 100); // Small delay to ensure layout is rendered
    }
  }, [layout, loading, zoomToFit]);

  if (loading || !layout) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading tree...</p>
      </div>
    );
  }

  const allCredentialNodes = layout.children || [];

  return (
    <div style={{ position: 'relative', width, height }}>
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
          onClick={() => setTransform({ ...transform, scale: Math.min(5, transform.scale * 1.2) })}
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
        <g
          ref={containerRef}
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        >
      {/* Render edges first (so they appear behind nodes) */}
      {layout.edges?.map(edge => {
        const sourceNode = allCredentialNodes.find(n => n.id === edge.sources[0]);
        const targetNode = allCredentialNodes.find(n => n.id === edge.targets[0]);
        
        if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
          return null;
        }

        const sourceX = sourceNode.x + (sourceNode.width || 0) / 2;
        const sourceY = sourceNode.y + (sourceNode.height || 0) / 2;
        const targetX = targetNode.x + (targetNode.width || 0) / 2;
        const targetY = targetNode.y + (targetNode.height || 0) / 2;

        // Determine edge type from relation - style only, no labels
        const relation = relations.find(r => r.id === edge.id);
        const isPartOf = relation?.relation_type === 'PART_OF';
        const isRecommended = relation?.relation_type === 'RECOMMENDED';
        const isCoreq = relation?.relation_type === 'COREQ';
        const isPrereq = relation?.relation_type === 'PREREQ';
        
        // Visual encoding by edge type:
        // PART_OF: thick green with arrow
        // PREREQ: thin gray, subtle
        // RECOMMENDED: dotted
        // COREQ: dashed
        const strokeWidth = isPartOf ? 3 : isPrereq ? 1.5 : 1;
        const strokeColor = isPartOf ? '#2d5a27' : isPrereq ? '#888' : isRecommended ? '#999' : '#aaa';
        const strokeDasharray = isRecommended ? '5,5' : isCoreq ? '3,3' : undefined;
        const opacity = isPrereq ? 0.5 : 1; // Prereqs are more subtle

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
            markerEnd={isPartOf ? 'url(#arrowhead)' : undefined}
          />
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
        const baseColor = collegeColors[cred.college_primary] || '#888';
        const fillColor = getTintedColor(baseColor, cred.level_band);
        const strokeColor = getStrokeColor(baseColor, cred.level_band);
        const strokeWidth = isSeasonal ? 2.5 : 2;
        const isHovered = hoveredNodeId === node.id;
        
        // Zoom factor for hovered nodes
        const hoverScale = isHovered ? 1.5 : 1;
        const centerX = node.x + (node.width || 0) / 2;
        const centerY = node.y + (node.height || 0) / 2;
        
        // Calculate scaled dimensions and position
        const scaledWidth = (node.width || 0) * hoverScale;
        const scaledHeight = (node.height || 0) * hoverScale;
        const scaledX = centerX - scaledWidth / 2;
        const scaledY = centerY - scaledHeight / 2;

        return (
          <g 
            key={node.id}
            onMouseEnter={() => handleNodeHover(node.id)}
            onMouseLeave={() => handleNodeHover(null)}
            transform={`translate(${centerX}, ${centerY}) scale(${hoverScale}) translate(${-centerX}, ${-centerY})`}
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
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth * (isHovered ? 1.2 : 1)}
              rx={4}
              style={{ 
                filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none',
                transition: 'filter 0.2s ease-out',
              }}
            />
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height / 2 - 8}
              fontSize={isHovered ? (isSeasonal ? 16 : 13) : (isSeasonal ? 11 : 9)}
              fontWeight={isSeasonal ? 'bold' : 'normal'}
              fill="#333"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ 
                transition: 'font-size 0.2s ease-out',
                pointerEvents: 'none',
              }}
            >
              {node.labels?.[0]?.text || cred.title}
            </text>
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height - 8}
              fontSize={isHovered ? 10 : 7}
              fill="#666"
              textAnchor="middle"
              fontWeight="500"
              style={{ 
                transition: 'font-size 0.2s ease-out',
                pointerEvents: 'none',
              }}
            >
              {cred.level_band}
            </text>
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height - 2}
              fontSize={isHovered ? 10 : 7}
              fill="#888"
              textAnchor="middle"
              style={{ 
                transition: 'font-size 0.2s ease-out',
                pointerEvents: 'none',
              }}
            >
              {cred.college_primary}
            </text>
          </g>
        );
      })}
        </g>
      </svg>
    </div>
  );
}
