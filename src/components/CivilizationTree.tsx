import { useEffect, useRef, useState, useCallback } from 'react';
import ELK from 'elkjs';
import type { CivilizationNode, CivilizationRelation } from '../data/civilizations';
import { allCivilizationNodes, civilizationRelations } from '../data/civilizations';
import CivilizationSidePanel from './CivilizationSidePanel';

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

// Generate fluid, curved vine paths for shadow art
function generateVinePaths(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  seed: number,
  nodeType: 'trunk' | 'vine' | 'cross-vine'
): string[] {
  const paths: string[] = [];
  
  // Different vine patterns based on node type
  let numVines: number;
  let vineLength: number;
  let vineSpread: number;
  
  if (nodeType === 'trunk') {
    numVines = 3 + Math.floor(seed % 2); // 3-4 vines for trunk
    vineLength = height * 2.5;
    vineSpread = width * 1.2;
  } else if (nodeType === 'cross-vine') {
    numVines = 2 + Math.floor(seed % 2); // 2-3 vines for cross-vines
    vineLength = height * 1.8;
    vineSpread = width * 0.8;
  } else {
    numVines = 2 + Math.floor(seed % 3); // 2-4 vines for major civilizations
    vineLength = height * 3;
    vineSpread = width * 1.5;
  }
  
  // Helper to generate pseudo-random but consistent values
  const rand = (offset: number) => {
    const combined = seed + offset;
    return (Math.sin(combined * 12.9898) * 43758.5453) % 1;
  };
  
  for (let i = 0; i < numVines; i++) {
    const angle = (i / numVines) * Math.PI * 2 + (rand(i) * 0.5 - 0.25);
    const startX = centerX + Math.cos(angle) * (width * 0.4);
    const startY = centerY + Math.sin(angle) * (height * 0.4);
    
    // Create organic, flowing curves with multiple control points
    const variation1 = (rand(i * 10) - 0.5) * 0.6;
    const variation2 = (rand(i * 20) - 0.5) * 0.4;
    const variation3 = (rand(i * 30) - 0.5) * 0.3;
    
    // First curve segment - flows upward and outward
    const cp1X = startX + Math.cos(angle + Math.PI / 3 + variation1) * vineSpread * 0.6;
    const cp1Y = startY - vineLength * 0.4 + (rand(i * 5) - 0.5) * height * 0.3;
    const cp2X = startX + Math.cos(angle + Math.PI / 6 + variation2) * vineSpread * 0.8;
    const cp2Y = startY - vineLength * 0.7 + (rand(i * 15) - 0.5) * height * 0.2;
    
    // Second curve segment - continues upward with different curvature
    const cp3X = cp2X + Math.cos(angle - Math.PI / 4 + variation3) * vineSpread * 0.5;
    const cp3Y = cp2Y - vineLength * 0.5 + (rand(i * 25) - 0.5) * height * 0.15;
    const endX = cp3X + Math.cos(angle + Math.PI / 2 + variation1) * vineSpread * 0.3;
    const endY = cp3Y - vineLength * 0.4 + (rand(i * 35) - 0.5) * height * 0.1;
    
    // Create a smooth, flowing S-curve using cubic bezier
    const finalX = endX + (rand(i * 40) - 0.5) * width * 0.2;
    const finalY = endY - vineLength * 0.2;
    const mainPath = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)}, ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)}, ${cp3X.toFixed(1)} ${cp3Y.toFixed(1)} S ${endX.toFixed(1)} ${endY.toFixed(1)}, ${finalX.toFixed(1)} ${finalY.toFixed(1)}`;
    
    paths.push(mainPath);
    
    // Add branching vines for more organic feel (50% chance)
    if (rand(i * 7) > 0.5) {
      const branchStartX = cp1X + (rand(i * 11) - 0.5) * width * 0.3;
      const branchStartY = cp1Y + (rand(i * 13) - 0.5) * height * 0.2;
      const branchAngle = angle + (rand(i * 17) - 0.5) * Math.PI / 3;
      
      const branchCpX = branchStartX + Math.cos(branchAngle) * vineSpread * 0.4;
      const branchCpY = branchStartY - vineLength * 0.3 + (rand(i * 19) - 0.5) * height * 0.15;
      const branchEndX = branchCpX + Math.cos(branchAngle + Math.PI / 4) * vineSpread * 0.3;
      const branchEndY = branchCpY - vineLength * 0.4 + (rand(i * 23) - 0.5) * height * 0.1;
      
      const branchPath = `M ${branchStartX.toFixed(1)} ${branchStartY.toFixed(1)} Q ${branchCpX.toFixed(1)} ${branchCpY.toFixed(1)}, ${branchEndX.toFixed(1)} ${branchEndY.toFixed(1)}`;
      paths.push(branchPath);
    }
  }
  
  return paths;
}

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
  const [timeRange, setTimeRange] = useState<{ min: number; max: number } | null>(null);
  const [longitudeRange, setLongitudeRange] = useState<{ min: number; max: number } | null>(null);
  
  // Pan/zoom state (panning disabled)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    async function computeLayout() {
      // Fixed time range: 3500 BCE to 2026 CE
      const minTime = -3500;
      const maxTime = 2026;
      
      // Calculate longitude range from nodes
      const nodesWithLongitude = allCivilizationNodes.filter(n => n.longitude !== undefined);
      
      if (nodesWithLongitude.length === 0) {
        console.error('Missing longitude data');
        setLoading(false);
        return;
      }
      
      const minLongitude = Math.min(...nodesWithLongitude.map(n => n.longitude!));
      const maxLongitude = Math.max(...nodesWithLongitude.map(n => n.longitude!));
      
      // Store ranges for axis rendering
      setTimeRange({ min: minTime, max: maxTime });
      setLongitudeRange({ min: minLongitude, max: maxLongitude });
      
      // Tree layout: Group nodes by time periods and arrange in tree structure
      const nodes = allCivilizationNodes.filter(node => node.type !== 'trunk');
      
      // Group nodes by time periods (layers of the tree)
      const timeLayers: { [key: number]: typeof nodes } = {};
      const layerInterval = 500; // 500 year intervals
      
      nodes.forEach(node => {
        if (node.timeStart !== undefined) {
          // Round to nearest 500 year interval
          const layer = Math.floor((node.timeStart - minTime) / layerInterval) * layerInterval;
          if (!timeLayers[layer]) {
            timeLayers[layer] = [];
          }
          timeLayers[layer].push(node);
        }
      });
      
      // Sort layers by time (earliest first)
      const sortedLayers = Object.keys(timeLayers)
        .map(Number)
        .sort((a, b) => a - b);
      
      // Tree dimensions
      const trunkWidth = 200; // Width of trunk at bottom
      const trunkY = height * 0.95; // Bottom of tree
      const treeHeight = height * 0.85; // Height of tree
      const treeStartY = height * 0.1; // Top of tree
      const centerX = width / 2;
      
      // Calculate positions using tree layout
      const elkNodes: ELKNode[] = [];
      const nodePositions: { [key: string]: { x: number; y: number; layer: number } } = {};
      
      sortedLayers.forEach((layerTime, layerIndex) => {
        const layerNodes = timeLayers[layerTime];
        const layerY = trunkY - (layerIndex / (sortedLayers.length - 1)) * treeHeight;
        
        // Calculate spread width for this layer (wider at top, narrower at bottom)
        const layerProgress = layerIndex / Math.max(1, sortedLayers.length - 1);
        // Tree shape: narrow at bottom, wide at top (like a real tree)
        const layerWidth = trunkWidth + (width * 0.7 - trunkWidth) * Math.pow(layerProgress, 0.6);
        
        // Sort nodes in layer by longitude for natural spread
        const sortedLayerNodes = [...layerNodes].sort((a, b) => {
          const lonA = a.longitude ?? 0;
          const lonB = b.longitude ?? 0;
          return lonA - lonB;
        });
        
        // Position nodes in this layer
        sortedLayerNodes.forEach((node, nodeIndex) => {
          let nodeWidth = 180;
          let nodeHeight = 100;
          
          if (node.type === 'cross-vine') {
            nodeWidth = 150;
            nodeHeight = 70;
          }
          
          // Spread nodes horizontally across layer width
          // Use longitude as a guide but spread evenly
          const normalizedIndex = sortedLayerNodes.length > 1 
            ? nodeIndex / (sortedLayerNodes.length - 1)
            : 0.5;
          
          // Add some variation based on longitude
          const longitudeOffset = node.longitude !== undefined
            ? ((node.longitude - minLongitude) / (maxLongitude - minLongitude) - 0.5) * 0.3
            : 0;
          
          const x = centerX + (normalizedIndex - 0.5 + longitudeOffset) * layerWidth - nodeWidth / 2;
          const y = layerY - nodeHeight / 2;
          
          nodePositions[node.id] = { x, y, layer: layerIndex };
          
          elkNodes.push({
            id: node.id,
            labels: [{ text: node.name }],
            width: nodeWidth,
            height: nodeHeight,
            x: x,
            y: y,
          });
        });
      });

      // Convert relations to edges
      const elkEdges: ELKEdge[] = civilizationRelations.map(rel => ({
        id: rel.id,
        sources: [rel.from_id],
        targets: [rel.to_id],
        labels: rel.description ? [{ text: rel.description }] : undefined,
      }));

      // Create a simple graph structure (no ELK layout needed since we're positioning manually)
      const graph: ELKGraph = {
        id: 'root',
        children: elkNodes,
        edges: elkEdges,
      };

      setLayout(graph);
      
      // Set initial transform to show the tree
      // Tree is centered horizontally, positioned from bottom
      const treeCenterX = width / 2;
      const treeTopY = treeStartY;
      const treeBottomY = trunkY;
      
      // Calculate scale to fit tree in viewport
      const treeWidth = width * 0.8;
      const treeHeight = treeBottomY - treeTopY;
      const scaleX = (width * 0.9) / treeWidth;
      const scaleY = (height * 0.9) / treeHeight;
      const initialScale = Math.min(scaleX, scaleY, 1) * 0.95;
      
      // Center the tree in the viewport
      const initialX = width / 2 - treeCenterX * initialScale;
      const initialY = height / 2 - ((treeTopY + treeBottomY) / 2) * initialScale;
      
      setTransform({
        x: initialX,
        y: initialY,
        scale: initialScale,
      });
      
      setLoading(false);
    }

    computeLayout();
  }, [width, height]);

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

  // Pan handlers - disabled
  const handleMouseDown = (e: React.MouseEvent) => {
    // Panning disabled
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning disabled
  };

  const handleMouseUp = () => {
    // Panning disabled
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
    if (layout && !loading && layout.children && layout.children.length > 0) {
      // Small delay to ensure layout is rendered
      setTimeout(() => {
        zoomToFit();
      }, 100);
    } else if (layout && !loading) {
      // If no nodes, reset transform
      setTransform({ x: 0, y: 0, scale: 1 });
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
    <div style={{ position: 'relative', width, height, display: 'flex' }}>
      {/* Main SVG area */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
        marginRight: selectedNode ? '400px' : '0',
        transition: 'margin-right 0.3s ease-out',
      }}>
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
          style={{ 
            padding: '8px 12px', 
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#2d5a27',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setTransform({ ...transform, scale: Math.max(0.1, transform.scale * 0.8) })}
          style={{ 
            padding: '8px 12px', 
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#2d5a27',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={zoomToFit}
          style={{ 
            padding: '8px 12px', 
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2d5a27',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Zoom to fit"
        >
          ⌂
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          style={{ 
            padding: '8px 12px', 
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#2d5a27',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,1)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Reset"
        >
          ⟲
        </button>
        </div>

        <svg
          ref={svgRef}
          width={selectedNode ? width - 400 : width}
          height={height}
          style={{ 
            border: 'none',
            borderRadius: '12px',
            background: 'linear-gradient(180deg, #f0f7f0 0%, #e8f0e8 30%, #d4e4d4 70%, #c4d4c4 100%)',
            cursor: 'default',
            display: 'block',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
        <defs>
          {/* Tree trunk gradient */}
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b6f47" />
            <stop offset="50%" stopColor="#6b5437" />
            <stop offset="100%" stopColor="#4a3423" />
          </linearGradient>
          
          {/* Organic branch path pattern */}
          <pattern id="branchPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#5a7a5a" opacity="0.2" />
          </pattern>
        <defs>
          {/* Gradient definitions for beautiful nodes */}
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </linearGradient>
          
          {/* Shadow filter for nodes */}
          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Glow filter for hovered nodes */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Arrow markers for different relation types */}
          {Object.entries(relationColors).map(([type, color]) => (
            <marker
              key={type}
              id={`arrowhead-${type}`}
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 12 4 L 0 8 Z" fill={color} opacity="0.8" />
            </marker>
          ))}
        </defs>

        {/* Time axis (left side) - Fixed range: 3500 BCE to 2026 CE, ticks at 500-year intervals */}
        {timeRange && (
          <g style={{ pointerEvents: 'none' }}>
            <line
              x1={width * 0.05}
              y1={height * 0.05}
              x2={width * 0.05}
              y2={height * 0.95}
              stroke="#4a5568"
              strokeWidth={2.5}
              strokeDasharray="8,4"
              opacity={0.4}
            />
            {/* Time labels - 500 year intervals from 3500 BCE to 2026 CE */}
            {(() => {
              const ticks = [];
              const minTime = -3500;
              const maxTime = 2026;
              const interval = 500;
              
              // Generate ticks at 500-year intervals
              for (let year = minTime; year <= maxTime; year += interval) {
                // Map year to Y position (earlier at bottom)
                const normalizedTime = (year - minTime) / (maxTime - minTime);
                const y = height * 0.05 + (height * 0.9) * (1 - normalizedTime);
                
                // Format label - no decimals, proper BCE/CE
                const label = year < 0 
                  ? `${Math.abs(year)} BCE` 
                  : year === 0 
                  ? '1 CE' 
                  : `${year} CE`;
                
                ticks.push({ year, y, label });
              }
              
              return ticks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={width * 0.05 - 8}
                    y1={tick.y}
                    x2={width * 0.05}
                    y2={tick.y}
                    stroke="#4a5568"
                    strokeWidth={1.5}
                    opacity={0.5}
                  />
                  <text
                    x={width * 0.05 - 12}
                    y={tick.y + 4}
                    fontSize={12}
                    fill="#2d3748"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontFamily="'Crimson Text', serif"
                    fontWeight="500"
                  >
                    {tick.label}
                  </text>
                </g>
              ));
            })()}
          </g>
        )}

        {/* Longitude axis (bottom) */}
        {longitudeRange && (
          <g style={{ pointerEvents: 'none' }}>
            <line
              x1={width * 0.05}
              y1={height * 0.95}
              x2={width * 0.95}
              y2={height * 0.95}
              stroke="#4a5568"
              strokeWidth={2.5}
              strokeDasharray="8,4"
              opacity={0.4}
            />
            {/* Longitude labels */}
            {[0, 1, 2, 3, 4].map(i => {
              const lonValue = longitudeRange.min + (longitudeRange.max - longitudeRange.min) * (i / 4);
              const x = width * 0.05 + (width * 0.9) * (i / 4);
              
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={height * 0.95}
                    x2={x}
                    y2={height * 0.95 + 6}
                    stroke="#4a5568"
                    strokeWidth={1.5}
                    opacity={0.5}
                  />
                  <text
                    x={x}
                    y={height * 0.95 + 22}
                    fontSize={12}
                    fill="#2d3748"
                    textAnchor="middle"
                    fontFamily="'Crimson Text', serif"
                    fontWeight="500"
                  >
                    {lonValue > 0 ? `${lonValue.toFixed(0)}°E` : lonValue < 0 ? `${Math.abs(lonValue).toFixed(0)}°W` : '0°'}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        <g
          ref={containerRef}
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        >
          {/* Render shadow vines first (behind everything) */}
          {allNodes.map(node => {
            const civNode = allCivilizationNodes.find(c => c.id === node.id);
            if (!node.x || !node.y || !node.width || !node.height || !civNode) {
              return null;
            }

            const centerX = node.x + node.width / 2;
            const centerY = node.y + node.height / 2;
            const nodeColor = civNode.color || '#888';
            
            // Generate a seed from node ID for consistent but varied patterns
            const seed = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const vinePaths = generateVinePaths(
              centerX, 
              centerY, 
              node.width, 
              node.height, 
              seed,
              civNode.type
            );
            
            return (
              <g key={`shadow-vines-${node.id}`} style={{ pointerEvents: 'none' }}>
                {vinePaths.map((path, idx) => {
                  // Vary stroke width for more organic look
                  const baseWidth = civNode.thickness ? civNode.thickness * 0.35 : 2;
                  const strokeWidth = baseWidth * (0.8 + (idx % 3) * 0.15);
                  // Vary opacity slightly for depth
                  const opacity = 0.12 + (idx % 2) * 0.06;
                  
                  return (
                    <path
                      key={`vine-${node.id}-${idx}`}
                      d={path}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={opacity}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Render edges */}
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

            // Create organic, tree-like branch path
            // Branches should curve naturally, like real tree branches
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Create a more organic curve - branches grow upward and outward
            // Use a quadratic curve that mimics natural branch growth
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            
            // Add natural variation - branches curve slightly
            const curveAmount = distance * 0.15;
            const curveX = midX + (dy > 0 ? -curveAmount : curveAmount) * 0.5;
            const curveY = midY - Math.abs(dx) * 0.2; // Slight upward curve
            
            // Make the path thicker at the base, thinner at the tip (like real branches)
            const pathId = `branch-${edge.id}`;
            
            return (
              <g key={edge.id}>
                {/* Branch shadow for depth */}
                <path
                  d={`M ${sourceX} ${sourceY} Q ${curveX} ${curveY}, ${targetX} ${targetY}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth={strokeWidth + 2}
                  strokeLinecap="round"
                  opacity={0.3}
                />
                {/* Main branch */}
                <path
                  id={pathId}
                  d={`M ${sourceX} ${sourceY} Q ${curveX} ${curveY}, ${targetX} ${targetY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeOpacity={opacity}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={`url(#arrowhead-${relationType})`}
                  style={{
                    transition: 'opacity 0.2s ease',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                  }}
                />
              </g>
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
            const strokeWidth = isSelected ? 3.5 : isHovered ? 2.5 : 2;
            const nodeOpacity = isSelected ? 1 : isHovered ? 0.95 : 0.85;
            
            // Create gradient ID for this node
            const gradientId = `gradient-${node.id}`;

            return (
              <g 
                key={node.id}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => setSelectedNodeId(isSelected ? null : node.id)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Gradient definition for this node */}
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={nodeColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={nodeColor} stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                
                {/* Shadow/glow effect */}
                {isHovered && (
                  <rect
                    x={node.x - 2}
                    y={node.y - 2}
                    width={node.width + 4}
                    height={node.height + 4}
                    rx={8}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth={1}
                    opacity={0.3}
                    filter="url(#nodeGlow)"
                  />
                )}
                
                {/* Main node rectangle with gradient */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill={`url(#${gradientId})`}
                  stroke={isSelected ? '#1a1a1a' : isHovered ? '#2d2d2d' : 'rgba(0,0,0,0.2)'}
                  strokeWidth={strokeWidth}
                  rx={8}
                  opacity={nodeOpacity}
                  filter={isSelected || isHovered ? 'url(#nodeShadow)' : 'url(#nodeShadow)'}
                  style={{ 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                
                {/* Highlight overlay for depth */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height * 0.4}
                  fill="url(#nodeGradient)"
                  rx={8}
                  opacity={0.2}
                  pointerEvents="none"
                />
                {/* Text with better styling */}
                <text
                  x={node.x + node.width / 2}
                  y={node.y + node.height / 2 - (civNode.type === 'cross-vine' ? 8 : 10)}
                  fontSize={civNode.type === 'cross-vine' ? 12 : 14}
                  fontWeight="600"
                  fill="#ffffff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Crimson Text', serif"
                  style={{ 
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
                  }}
                >
                  {civNode.emoji && `${civNode.emoji} `}
                  {node.labels?.[0]?.text || civNode.name}
                </text>
                {civNode.type !== 'trunk' && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height - 10}
                    fontSize={10}
                    fill="rgba(255,255,255,0.9)"
                    textAnchor="middle"
                    fontFamily="'Crimson Text', serif"
                    fontWeight="500"
                    style={{ 
                      pointerEvents: 'none',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
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

      {/* Side Panel */}
      <CivilizationSidePanel
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
