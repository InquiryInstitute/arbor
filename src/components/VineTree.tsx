import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  
  // Increased tinting from 40% to 60% for better visibility
  const newR = r + (whiteR - r) * tintFactor * 0.6; // Max 60% lighter
  const newG = g + (whiteG - g) * tintFactor * 0.6;
  const newB = b + (whiteB - b) * tintFactor * 0.6;
  
  return rgbToHex(newR, newG, newB);
};

// Calculate luminance to determine if background is light or dark
const getLuminance = (r: number, g: number, b: number): number => {
  // Relative luminance formula from WCAG
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Get text color with good contrast against background
const getTextColor = (backgroundColor: string): string => {
  const [r, g, b] = hexToRgb(backgroundColor);
  const luminance = getLuminance(r, g, b);
  // Use dark text on light backgrounds, light text on dark backgrounds
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
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

  // Zoom to a specific node
  const zoomToNode = useCallback((node: ELKNode) => {
    if (!node.x || !node.y || !node.width || !node.height || !svgRef.current) {
      return;
    }

    const nodeCenterX = node.x + node.width / 2;
    const nodeCenterY = node.y + node.height / 2;
    
    // Calculate zoom to make node fill about 40% of viewport width for good readability
    const targetWidth = width * 0.4;
    const nodeWidth = node.width;
    const zoomScale = targetWidth / nodeWidth;
    const newScale = Math.min(Math.max(zoomScale, 0.5), 10); // Clamp between 0.5x and 10x
    
    // Center the node in the viewport
    const newX = width / 2 - nodeCenterX * newScale;
    const newY = height / 2 - nodeCenterY * newScale;
    
    setTransform({
      x: newX,
      y: newY,
      scale: newScale,
    });
  }, [width, height]);

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
        const newScale = Math.max(0.1, Math.min(10, prev.scale * delta));
        
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

  // Calculate college lane positions for labeling
  const collegePositions = useMemo(() => {
    const positions: Record<College, { x: number; y: number; count: number }> = {} as Record<College, { x: number; y: number; count: number }>;
    
    allCredentialNodes.forEach(node => {
      const cred = credentials.find(c => c.id === node.id);
      if (!cred || !node.x || !node.y) return;
      
      const college = cred.college_primary;
      if (!positions[college]) {
        positions[college] = { x: 0, y: 0, count: 0 };
      }
      
      // Accumulate X positions to calculate median
      positions[college].x += node.x + (node.width || 0) / 2;
      // Track bottom-most Y position
      const nodeBottom = (node.y || 0) + (node.height || 0);
      if (nodeBottom > positions[college].y) {
        positions[college].y = nodeBottom;
      }
      positions[college].count += 1;
    });
    
    // Calculate median X for each college
    Object.keys(positions).forEach(college => {
      const pos = positions[college as College];
      if (pos.count > 0) {
        pos.x = pos.x / pos.count; // Average X position (approximation of median)
        pos.y = pos.y + 20; // Add padding below bottom node
      }
    });
    
    return positions;
  }, [allCredentialNodes, credentials]);

  // Calculate vine art data
  const vineArtData = useMemo(() => {
    if (!allCredentialNodes.length) return null;
    
    // Calculate vine spine positions for each college
    const collegeSpines: Record<College, { x: number; nodes: ELKNode[] }> = {} as Record<College, { x: number; nodes: ELKNode[] }>;
    
    allCredentialNodes.forEach(node => {
      const cred = credentials.find(c => c.id === node.id);
      if (!cred || !node.x) return;
      
      const college = cred.college_primary;
      if (!collegeSpines[college]) {
        collegeSpines[college] = { x: 0, nodes: [] };
      }
      collegeSpines[college].nodes.push(node);
      collegeSpines[college].x += node.x + (node.width || 0) / 2;
    });
    
    // Calculate median X for each college spine
    Object.keys(collegeSpines).forEach(college => {
      const spine = collegeSpines[college as College];
      if (spine.nodes.length > 0) {
        spine.x = spine.x / spine.nodes.length;
      }
    });
    
    // Find overall bounds
    const allX = allCredentialNodes.map(n => n.x || 0);
    const allY = allCredentialNodes.map(n => n.y || 0);
    const allBottom = allCredentialNodes.map(n => (n.y || 0) + (n.height || 0));
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX.map((x, i) => x + (allCredentialNodes[i].width || 0)));
    const minY = Math.min(...allY);
    const maxY = Math.max(...allBottom);
    
    // Calculate trunk position (median of all college spines)
    const spineXs = Object.values(collegeSpines).map(s => s.x);
    const trunkX = spineXs.length > 0 ? spineXs.reduce((a, b) => a + b, 0) / spineXs.length : (minX + maxX) / 2;
    
    return { collegeSpines, trunkX, minY, maxY };
  }, [allCredentialNodes, credentials]);

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
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: '5px',
          gap: '2px',
        }}>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={transform.scale}
            onChange={(e) => {
              const newScale = parseFloat(e.target.value);
              // Keep current center point when zooming with slider
              const rect = svgRef.current?.getBoundingClientRect();
              if (rect) {
                const centerX = width / 2;
                const centerY = height / 2;
                const scaleChange = newScale / transform.scale;
                setTransform({
                  x: centerX - (centerX - transform.x) * scaleChange,
                  y: centerY - (centerY - transform.y) * scaleChange,
                  scale: newScale,
                });
              } else {
                setTransform({ ...transform, scale: newScale });
              }
            }}
            style={{ width: '60px', cursor: 'pointer' }}
            title={`Zoom: ${transform.scale.toFixed(1)}x`}
          />
          <span style={{ fontSize: '9px', color: '#666' }}>
            {transform.scale.toFixed(1)}x
          </span>
        </div>
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
      {/* Render vine art background first */}
      {vineArtData && (
        <>
          {/* Central trunk - wide, blurred, organic */}
          <defs>
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d5a27" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#2d5a27" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1a3d1a" stopOpacity="0.2" />
            </linearGradient>
            <filter id="trunkBlur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
            </filter>
          </defs>
          
          {/* Trunk background */}
          <rect
            x={vineArtData.trunkX - 60}
            y={vineArtData.minY - 20}
            width={120}
            height={vineArtData.maxY - vineArtData.minY + 40}
            fill="url(#trunkGradient)"
            opacity={0.4}
            filter="url(#trunkBlur)"
            rx={60}
          />
          
          {/* Individual vine spines for each college */}
          {Object.entries(vineArtData.collegeSpines).map(([college, spine]) => {
            if (spine.nodes.length === 0) return null;
            
            const baseColor = collegeColors[college as College] || '#888';
            const [r, g, b] = hexToRgb(baseColor);
            
            // Sort nodes by Y position
            const sortedNodes = [...spine.nodes].sort((a, b) => (a.y || 0) - (b.y || 0));
            
            // Create path for organic vine spine
            const spineWidth = 40;
            const pathPoints: string[] = [];
            
            // Add some organic variation
            sortedNodes.forEach((node, i) => {
              const nodeY = (node.y || 0) + (node.height || 0) / 2;
              const variation = Math.sin(i * 0.5) * 3; // Slight organic curve
              const x = spine.x + variation;
              if (i === 0) {
                pathPoints.push(`M ${x} ${nodeY}`);
              } else {
                pathPoints.push(`L ${x} ${nodeY}`);
              }
            });
            
            const pathData = pathPoints.join(' ');
            
            return (
              <g key={`vine-spine-${college}`}>
                <defs>
                  <linearGradient id={`vineGradient-${college}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={baseColor} stopOpacity="0.2" />
                    <stop offset="50%" stopColor={baseColor} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={baseColor} stopOpacity="0.1" />
                  </linearGradient>
                  <filter id={`vineBlur-${college}`}>
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                  </filter>
                </defs>
                
                {/* Vine spine background */}
                <path
                  d={pathData}
                  stroke={`rgba(${r}, ${g}, ${b}, 0.3)`}
                  strokeWidth={spineWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#vineBlur-${college})`}
                  opacity={0.6}
                />
                
                {/* Vine spine highlight */}
                <path
                  d={pathData}
                  stroke={`rgba(${r}, ${g}, ${b}, 0.2)`}
                  strokeWidth={spineWidth * 0.6}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.8}
                />
              </g>
            );
          })}
        </>
      )}
      
      {/* Render edges next (so they appear behind nodes) */}
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
        const textColor = getTextColor(fillColor);
        const cadenceEmoji = isSeasonal ? '🌱' : '🌙';
        
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
            onDoubleClick={(e) => {
              e.stopPropagation();
              zoomToNode(node);
            }}
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
            {/* Cadence emoji */}
            <text
              x={node.x + 8}
              y={node.y + (isHovered ? 20 : 14)}
              fontSize={isHovered ? 18 : 14}
              textAnchor="start"
              dominantBaseline="middle"
              style={{ 
                transition: 'font-size 0.2s ease-out',
                pointerEvents: 'none',
              }}
            >
              {cadenceEmoji}
            </text>
            {/* Title */}
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height / 2 - 8}
              fontSize={isHovered ? (isSeasonal ? 16 : 13) : (isSeasonal ? 11 : 9)}
              fontWeight={isSeasonal ? 'bold' : 'normal'}
              fill={textColor}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ 
                transition: 'font-size 0.2s ease-out, fill 0.2s ease-out',
                pointerEvents: 'none',
              }}
            >
              {node.labels?.[0]?.text || cred.title}
            </text>
            {/* Level band */}
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height - 8}
              fontSize={isHovered ? 10 : 7}
              fill={textColor}
              textAnchor="middle"
              fontWeight="500"
              opacity={0.9}
              style={{ 
                transition: 'font-size 0.2s ease-out, fill 0.2s ease-out',
                pointerEvents: 'none',
              }}
            >
              {cred.level_band}
            </text>
            {/* College */}
            <text
              x={node.x + node.width / 2}
              y={node.y + node.height - 2}
              fontSize={isHovered ? 10 : 7}
              fill={textColor}
              textAnchor="middle"
              opacity={0.8}
              style={{ 
                transition: 'font-size 0.2s ease-out, fill 0.2s ease-out',
                pointerEvents: 'none',
              }}
            >
              {cred.college_primary}
            </text>
          </g>
        );
      })}

      {/* College labels at bottom - render outside transform group so they stay at bottom */}
      <g>
        {Object.entries(collegePositions).map(([college, pos]) => {
          if (pos.count === 0) return null;
          const baseColor = collegeColors[college as College] || '#888';
          const bgColor = getTintedColor(baseColor, 'K-1'); // Use root level color for label background
          const labelColor = getTextColor(bgColor);
          
          // Transform label position based on current view transform
          const labelX = pos.x * transform.scale + transform.x;
          const labelY = pos.y * transform.scale + transform.y;
          
          return (
            <g key={`college-label-${college}`}>
              {/* Background rectangle for label */}
              <rect
                x={labelX - 40}
                y={labelY}
                width={80}
                height={28}
                fill={bgColor}
                stroke={getStrokeColor(baseColor, 'K-1')}
                strokeWidth={2}
                rx={4}
                opacity={0.95}
              />
              {/* College name */}
              <text
                x={labelX}
                y={labelY + 18}
                fontSize="13"
                fontWeight="bold"
                fill={labelColor}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ pointerEvents: 'none' }}
              >
                {college}
              </text>
            </g>
          );
        })}
      </g>
        </g>
      </svg>
    </div>
  );
}
