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
      
      // Calculate actual ranges (no padding for linear scale)
      const timeRange = maxTime - minTime;
      const longitudeRange = maxLongitude - minLongitude;
      
      // Map dimensions (leave space for nodes and axes)
      const mapWidth = width * 0.9;
      const mapHeight = height * 0.9;
      const mapStartX = width * 0.05;
      const mapStartY = height * 0.05;
      
      // Create nodes with positions based on longitude (X) and time (Y)
      const elkNodes: ELKNode[] = allCivilizationNodes
        .filter(node => node.type !== 'trunk') // Filter out trunk nodes (empty now, but just in case)
        .map(node => {
        let nodeWidth = 180;
        let nodeHeight = 100;
        
        if (node.type === 'cross-vine') {
          nodeWidth = 150;
          nodeHeight = 70;
        }
        
        // Calculate position based on longitude and time
        let x = mapStartX;
        let y = mapStartY;
        
        if (node.longitude !== undefined) {
          // Map longitude to X (left to right) - linear mapping
          const normalizedLongitude = longitudeRange > 0 
            ? (node.longitude - minLongitude) / longitudeRange 
            : 0.5;
          x = mapStartX + normalizedLongitude * mapWidth - nodeWidth / 2;
        } else {
          // Center if no longitude
          x = mapStartX + mapWidth / 2 - nodeWidth / 2;
        }
        
        if (node.timeStart !== undefined) {
          // Map time to Y (bottom to top - earlier times at bottom) - LINEAR
          // Linear mapping: earlier times (smaller values) at bottom, later times at top
          const normalizedTime = timeRange > 0 
            ? (node.timeStart - minTime) / timeRange 
            : 0;
          // Invert: 1 - normalizedTime so earlier times are at bottom
          y = mapStartY + (1 - normalizedTime) * mapHeight - nodeHeight / 2;
        } else {
          // Place at bottom if no time data
          y = mapStartY + mapHeight - nodeHeight / 2;
        }
        
        return {
          id: node.id,
          labels: [{ text: node.name }],
          width: nodeWidth,
          height: nodeHeight,
          x: x,
          y: y,
        };
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
          width={selectedNode ? width - 400 : width}
          height={height}
          style={{ 
            border: '1px solid #ccc', 
            background: '#fafafa', 
            cursor: 'default',
            display: 'block',
          }}
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

        {/* Time axis (left side) - Fixed range: 3500 BCE to 2026 CE, ticks at 500-year intervals */}
        {timeRange && (
          <g style={{ pointerEvents: 'none' }}>
            <line
              x1={width * 0.05}
              y1={height * 0.05}
              x2={width * 0.05}
              y2={height * 0.95}
              stroke="#999"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.5}
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
                    x1={width * 0.05 - 5}
                    y1={tick.y}
                    x2={width * 0.05}
                    y2={tick.y}
                    stroke="#999"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                  <text
                    x={width * 0.05 - 10}
                    y={tick.y + 4}
                    fontSize={11}
                    fill="#666"
                    textAnchor="end"
                    dominantBaseline="middle"
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
              stroke="#999"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.5}
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
                    y2={height * 0.95 + 5}
                    stroke="#999"
                    strokeWidth={1}
                    opacity={0.5}
                  />
                  <text
                    x={x}
                    y={height * 0.95 + 20}
                    fontSize={11}
                    fill="#666"
                    textAnchor="middle"
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

      {/* Side Panel */}
      <CivilizationSidePanel
        node={selectedNode}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
