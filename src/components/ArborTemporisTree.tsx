import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { ArborNode, NodeConnection, Braid } from '../types/arbor-temporis';
import { VINE_COLORS, TEMPORAL_BAND_SYMBOLS } from '../types/arbor-temporis';
import { sampleArborTemporis } from '../data/sample-arbor-temporis';

// Vine order for horizontal lanes
const vineOrder: Array<'History' | 'Music' | 'Art' | 'Literature' | 'Science'> = [
  'History',
  'Music',
  'Art',
  'Literature',
  'Science',
];

interface ArborTemporisTreeProps {
  nodes?: ArborNode[];
  connections?: NodeConnection[];
  braids?: Braid[];
  width?: number;
  height?: number;
}

export default function ArborTemporisTree({
  nodes = sampleArborTemporis.nodes,
  connections = sampleArborTemporis.connections,
  braids = sampleArborTemporis.braids,
  width = 1400,
  height = 1000,
}: ArborTemporisTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  
  // Pan/zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Tooltip state
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate full time range (all nodes)
  const timeHeights = nodes.map(n => n.time_height);
  const fullMinTime = Math.min(...timeHeights);
  const fullMaxTime = Math.max(...timeHeights);
  
  // Time zoom state
  const [timeZoomMin, setTimeZoomMin] = useState<number | null>(null);
  const [timeZoomMax, setTimeZoomMax] = useState<number | null>(null);
  
  // Effective time range (zoomed or full)
  const minTime = timeZoomMin ?? fullMinTime;
  const maxTime = timeZoomMax ?? fullMaxTime;
  const timeRange = maxTime - minTime;
  
  // Filter nodes and connections based on time zoom
  const visibleNodes = useMemo(() => {
    return nodes.filter(node => 
      node.time_height >= minTime && node.time_height <= maxTime
    );
  }, [nodes, minTime, maxTime]);
  
  const visibleConnections = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return connections.filter(conn => 
      visibleNodeIds.has(conn.from_node_id) && visibleNodeIds.has(conn.to_node_id)
    );
  }, [connections, visibleNodes]);
  
  const visibleBraids = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return braids.filter(braid => 
      braid.node_ids.some(id => visibleNodeIds.has(id))
    );
  }, [braids, visibleNodes]);

  // Layout parameters
  const timePadding = 100; // Padding at top and bottom
  const yAxisWidth = 80; // Width for Y-axis labels
  const vineLaneWidth = (width - yAxisWidth) / vineOrder.length; // Account for Y-axis
  const availableHeight = height - 2 * timePadding;
  const nodeHeight = 60;
  const minNodeSpacing = 70; // Minimum vertical spacing between nodes

  // Convert time_height to base Y position (linear mapping)
  const timeToBaseY = useCallback((timeHeight: number): number => {
    // Normalize: 0 (minTime) to 1 (maxTime)
    const normalized = (timeHeight - minTime) / timeRange;
    // Map to Y: bottom (minTime) to top (maxTime)
    return height - timePadding - (normalized * availableHeight);
  }, [minTime, timeRange, height, timePadding, availableHeight]);

  // Calculate adjusted Y positions to prevent overlap
  const nodePositions = useMemo(() => {
    const positions = new Map<string, number>();
    
    // Group nodes by vine (using visible nodes)
    const nodesByVine = new Map<string, ArborNode[]>();
    visibleNodes.forEach(node => {
      if (!nodesByVine.has(node.vine)) {
        nodesByVine.set(node.vine, []);
      }
      nodesByVine.get(node.vine)!.push(node);
    });
    
    // For each vine, sort nodes by time and space them out
    nodesByVine.forEach((vineNodes, vine) => {
      // Sort by time_height
      const sorted = [...vineNodes].sort((a, b) => a.time_height - b.time_height);
      
      // Calculate base Y positions
      const baseYs = sorted.map(node => ({
        node,
        baseY: timeToBaseY(node.time_height),
      }));
      
      // Adjust positions to prevent overlap
      // Note: In SVG, Y increases downward, so older nodes (higher time_height) should have higher Y (bottom)
      // Newer nodes (lower time_height) should have lower Y (top)
      const adjusted: Array<{ node: ArborNode; y: number }> = [];
      
      baseYs.forEach(({ node, baseY }, index) => {
        if (index === 0) {
          // First node (oldest): use base position (should be at bottom)
          adjusted.push({ node, y: baseY });
        } else {
          // Check if this node would overlap with previous
          // Previous node is older (higher Y), this node is newer (should be lower Y, higher on screen)
          const prevY = adjusted[index - 1].y;
          const maxY = prevY - minNodeSpacing; // Subtract to move UP (lower Y value)
          
          // Use the minimum of base position and maximum spacing
          // Newer nodes should be above older nodes (lower Y values)
          const idealY = baseY;
          const y = Math.min(idealY, maxY);
          adjusted.push({ node, y });
        }
      });
      
      // Store positions
      adjusted.forEach(({ node, y }) => {
        positions.set(node.id, y);
      });
    });
    
    // Calculate the actual height needed and scale if necessary
    const allYs = Array.from(positions.values());
    if (allYs.length > 0) {
      const minY = Math.min(...allYs);
      const maxY = Math.max(...allYs);
      const actualHeight = maxY - minY;
      const neededHeight = actualHeight + 2 * timePadding;
      
      // If we need more space, we could scale, but for now just ensure padding
      // The zoom-to-fit will handle the rest
    }
    
    return positions;
  }, [visibleNodes, timeToBaseY, minNodeSpacing, timePadding]);

  // Convert time_height to Y position (with spacing adjustments)
  const timeToY = useCallback((nodeId: string, timeHeight: number): number => {
    return nodePositions.get(nodeId) ?? timeToBaseY(timeHeight);
  }, [nodePositions, timeToBaseY]);
  
  // Generate Y-axis time labels
  const yAxisLabels = useMemo(() => {
    const labels: Array<{ time: number; y: number; label: string }> = [];
    const numLabels = 10; // Number of labels to show
    
    for (let i = 0; i <= numLabels; i++) {
      const normalized = i / numLabels;
      const time = minTime + (normalized * timeRange);
      const y = timeToBaseY(time);
      
      // Format label
      let label: string;
      if (time < 0) {
        label = `${Math.abs(Math.round(time))} BCE`;
      } else if (time === 0) {
        label = '0 CE';
      } else {
        label = `${Math.round(time)} CE`;
      }
      
      labels.push({ time, y, label });
    }
    
    return labels;
  }, [minTime, timeRange, timeToBaseY]);
  
  // Format time for display
  const formatTime = useCallback((timeHeight: number): string => {
    if (timeHeight < 0) {
      return `${Math.abs(Math.round(timeHeight))} BCE`;
    } else if (timeHeight === 0) {
      return '0 CE';
    } else {
      return `${Math.round(timeHeight)} CE`;
    }
  }, []);

  // Convert vine to X position (horizontal lane) - offset by yAxisWidth
  const vineToX = useCallback((vine: string): number => {
    const index = vineOrder.indexOf(vine as any);
    if (index === -1) return width / 2;
    return yAxisWidth + (index + 0.5) * vineLaneWidth;
  }, [width, vineLaneWidth, yAxisWidth]);

  // Calculate bounding box
  const getBoundingBox = useCallback(() => {
    if (visibleNodes.length === 0) {
      return { minX: 0, minY: 0, maxX: width, maxY: height, width, height };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    // Include Y-axis in bounding box
    minX = Math.min(minX, 0);
    
    visibleNodes.forEach(node => {
      const x = vineToX(node.vine);
      const y = timeToY(node.id, node.time_height);
      const nodeWidth = 120;
      const nodeHeight = 60;
      
      minX = Math.min(minX, x - nodeWidth / 2);
      minY = Math.min(minY, y - nodeHeight / 2);
      maxX = Math.max(maxX, x + nodeWidth / 2);
      maxY = Math.max(maxY, y + nodeHeight / 2);
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
  }, [visibleNodes, vineToX, timeToY]);
  
  // Time zoom presets
  const timePresets = useMemo(() => [
    { label: 'All Time', min: null, max: null },
    { label: 'Ancient (to 500 CE)', min: fullMinTime, max: 500 },
    { label: 'Medieval (500-1400)', min: 500, max: 1400 },
    { label: 'Renaissance (1400-1800)', min: 1400, max: 1800 },
    { label: 'Modern (1800-2000)', min: 1800, max: 2000 },
    { label: 'Contemporary (2000+)', min: 2000, max: fullMaxTime },
  ], [fullMinTime, fullMaxTime]);
  
  const handleTimePreset = (preset: { min: number | null; max: number | null }) => {
    setTimeZoomMin(preset.min);
    setTimeZoomMax(preset.max);
  };

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

  // Tooltip handlers
  const handleNodeMouseEnter = (e: React.MouseEvent, nodeId: string) => {
    if (!isPanning) {
      setHoveredNode(nodeId);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };
  
  const handleConnectionMouseEnter = (e: React.MouseEvent, connId: string) => {
    if (!isPanning) {
      setHoveredConnection(connId);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleConnectionMouseLeave = () => {
    setHoveredConnection(null);
  };
  
  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - transform.x,
        y: e.clientY - transform.y,
      });
      // Hide tooltips when panning starts
      setHoveredNode(null);
      setHoveredConnection(null);
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
        const newScale = Math.max(0.1, Math.min(5, prev.scale * delta));
        
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
    return () => svgElement.removeEventListener('wheel', handleWheel);
  }, [setTransform]);

  // Zoom to fit on mount
  useEffect(() => {
    setTimeout(zoomToFit, 100);
  }, [zoomToFit]);

  // Get nodes in selected braid
  const selectedBraid = visibleBraids.find(b => b.node_ids.includes(selectedNode || ''));

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
        background: 'white',
        padding: '5px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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

      {/* Time Zoom Controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 10,
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '11px',
        maxWidth: '250px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>Time Zoom</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {timePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleTimePreset(preset)}
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                border: '1px solid #ccc',
                borderRadius: '3px',
                background: (timeZoomMin === preset.min && timeZoomMax === preset.max) ? '#e3f2fd' : 'white',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {(timeZoomMin !== null || timeZoomMax !== null) && (
          <button
            onClick={() => handleTimePreset({ min: null, max: null })}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              border: '1px solid #999',
              borderRadius: '3px',
              background: '#f5f5f5',
              width: '100%',
            }}
          >
            Reset to All Time
          </button>
        )}
        {timeZoomMin !== null || timeZoomMax !== null ? (
          <div style={{ marginTop: '8px', fontSize: '9px', color: '#666' }}>
            Showing: {timeZoomMin !== null ? Math.round(timeZoomMin) : 'start'} - {timeZoomMax !== null ? Math.round(timeZoomMax) : 'end'} CE
          </div>
        ) : null}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        background: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '12px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Vines</div>
        {vineOrder.map(vine => (
          <div key={vine} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
            <div style={{ width: '12px', height: '12px', background: VINE_COLORS[vine], borderRadius: '2px' }} />
            <span>{vine}</span>
          </div>
        ))}
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
          {/* Arrow markers */}
          <marker
            id="arrowhead-up"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>
          <marker
            id="arrowhead-down"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#666" />
          </marker>
        </defs>

        <g
          ref={containerRef}
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
        >
          {/* Y-axis line */}
          <line
            x1={yAxisWidth}
            y1={timePadding}
            x2={yAxisWidth}
            y2={height - timePadding}
            stroke="#333"
            strokeWidth={2}
          />
          
          {/* Y-axis time labels */}
          {yAxisLabels.map(({ time, y, label }, idx) => (
            <g key={`yaxis-${idx}`}>
              <line
                x1={yAxisWidth - 5}
                y1={y}
                x2={yAxisWidth}
                y2={y}
                stroke="#333"
                strokeWidth={1}
              />
              <text
                x={yAxisWidth - 10}
                y={y}
                fontSize="11"
                fill="#333"
                textAnchor="end"
                dominantBaseline="middle"
                fontWeight="500"
              >
                {label}
              </text>
            </g>
          ))}
          
          {/* Draw vine lanes (vertical lines) - offset by yAxisWidth */}
          {vineOrder.map((vine, index) => {
            const x = yAxisWidth + (index + 0.5) * vineLaneWidth;
            return (
              <line
                key={`lane-${vine}`}
                x1={x}
                y1={timePadding}
                x2={x}
                y2={height - timePadding}
                stroke={VINE_COLORS[vine]}
                strokeWidth={2}
                strokeOpacity={0.2}
                strokeDasharray="5,5"
              />
            );
          })}

          {/* Draw temporal band markers */}
          {Array.from(visibleNodes.reduce((bands, node) => {
            if (!bands.has(node.temporal_band)) {
              bands.set(node.temporal_band, node);
            }
            return bands;
          }, new Map()).entries()).map(([band, node]) => {
            const y = timeToY(node.id, node.time_height);
            return (
              <g key={`band-${band}`}>
                <line
                  x1={yAxisWidth}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="#999"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  strokeDasharray="3,3"
                />
                <text
                  x={yAxisWidth + 10}
                  y={y - 5}
                  fontSize="10"
                  fill="#666"
                >
                  {TEMPORAL_BAND_SYMBOLS[band]} {band}
                </text>
              </g>
            );
          })}

          {/* Render connections */}
          {visibleConnections.map(conn => {
            const fromNode = visibleNodes.find(n => n.id === conn.from_node_id);
            const toNode = visibleNodes.find(n => n.id === conn.to_node_id);
            
            if (!fromNode || !toNode) return null;

            const x1 = vineToX(fromNode.vine);
            const y1 = timeToY(fromNode.id, fromNode.time_height);
            const x2 = vineToX(toNode.vine);
            const y2 = timeToY(toNode.id, toNode.time_height);

            const isSelected = selectedNode === fromNode.id || selectedNode === toNode.id;
            const isBraid = selectedBraid && selectedBraid.node_ids.includes(fromNode.id) && selectedBraid.node_ids.includes(toNode.id);
            const isHovered = hoveredConnection === conn.id;

            let strokeColor = '#888';
            let strokeWidth = 1;
            let opacity = 0.4;

            if (conn.connection_type === 'predecessor') {
              // Downward (earlier time)
              strokeColor = '#666';
              strokeWidth = 1.5;
            } else if (conn.connection_type === 'successor') {
              // Upward (later time)
              strokeColor = '#333';
              strokeWidth = 1.5;
            } else if (conn.connection_type === 'cross_link') {
              // Horizontal (same time, different vine)
              strokeColor = '#9b59b6';
              strokeWidth = 2;
              opacity = 0.6;
            }

            if (isSelected) {
              strokeWidth *= 2;
              opacity = 0.8;
            }

            if (isBraid) {
              strokeColor = '#e74c3c';
              strokeWidth *= 1.5;
              opacity = 0.7;
            }
            
            if (isHovered) {
              strokeWidth *= 1.5;
              opacity = Math.min(1, opacity * 1.5);
            }

            // Create an invisible wider line for easier hovering
            const hoverWidth = Math.max(strokeWidth * 3, 8);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={conn.id}>
                {/* Invisible hover area */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={hoverWidth}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => handleConnectionMouseEnter(e, conn.id)}
                  onMouseLeave={handleConnectionMouseLeave}
                />
                {/* Visible connection line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  markerEnd={conn.connection_type === 'successor' ? 'url(#arrowhead-up)' : undefined}
                />
              </g>
            );
          })}

          {/* Render nodes */}
          {visibleNodes.map(node => {
            const x = vineToX(node.vine);
            const y = timeToY(node.id, node.time_height);
            const nodeWidth = 120;
            const nodeHeight = 60;

            const isSelected = selectedNode === node.id;
            const isInBraid = visibleBraids.some(b => b.node_ids.includes(node.id));

            const baseColor = VINE_COLORS[node.vine];
            const fillColor = isInBraid ? '#fff3cd' : '#ffffff';
            const strokeColor = isSelected ? '#e74c3c' : baseColor;
            const strokeWidth = isSelected ? 3 : isInBraid ? 2.5 : 2;

            const isHovered = hoveredNode === node.id;

            return (
              <g key={node.id}>
                <rect
                  x={x - nodeWidth / 2}
                  y={y - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={fillColor}
                  stroke={isHovered ? '#e74c3c' : strokeColor}
                  strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
                  rx={4}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  onMouseEnter={(e) => handleNodeMouseEnter(e, node.id)}
                  onMouseLeave={handleNodeMouseLeave}
                  onMouseMove={(e) => {
                    if (hoveredNode === node.id) {
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                />
                <text
                  x={x}
                  y={y - 12}
                  fontSize={10}
                  fontWeight="bold"
                  fill="#333"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {node.title}
                </text>
                <text
                  x={x}
                  y={y + 5}
                  fontSize={8}
                  fill="#666"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {node.date_approximate || node.temporal_band}
                </text>
                <text
                  x={x}
                  y={y + 18}
                  fontSize={7}
                  fill="#999"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {node.vine}
                </text>
              </g>
            );
          })}

          {/* Highlight braids */}
          {visibleBraids.map(braid => {
            const braidNodes = visibleNodes.filter(n => braid.node_ids.includes(n.id));
            if (braidNodes.length === 0) return null;

            // Find bounding box of braid
            const xs = braidNodes.map(n => vineToX(n.vine));
            const ys = braidNodes.map(n => timeToY(n.id, n.time_height));
            const minX = Math.max(yAxisWidth, Math.min(...xs) - 80);
            const maxX = Math.max(...xs) + 80;
            const minY = Math.min(...ys) - 40;
            const maxY = Math.max(...ys) + 40;

            return (
              <rect
                key={braid.id}
                x={minX}
                y={minY}
                width={maxX - minX}
                height={maxY - minY}
                fill="none"
                stroke="#e74c3c"
                strokeWidth={3}
                strokeOpacity={0.3}
                strokeDasharray="10,5"
                rx={8}
                style={{ pointerEvents: 'none' }}
              />
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {(hoveredNode || hoveredConnection) && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            maxWidth: '300px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transform: 'translateY(-100%)',
          }}
        >
          {hoveredNode && (() => {
            const node = visibleNodes.find(n => n.id === hoveredNode);
            if (!node) return null;
            return (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{node.title}</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  <div>{node.vine} • {node.date_approximate || formatTime(node.time_height)}</div>
                  {node.temporal_band && (
                    <div>{TEMPORAL_BAND_SYMBOLS[node.temporal_band]} {node.temporal_band}</div>
                  )}
                  {node.description && (
                    <div style={{ marginTop: '4px', opacity: 0.8 }}>{node.description.substring(0, 100)}{node.description.length > 100 ? '...' : ''}</div>
                  )}
                </div>
              </>
            );
          })()}
          {hoveredConnection && (() => {
            const conn = visibleConnections.find(c => c.id === hoveredConnection);
            if (!conn) return null;
            const fromNode = visibleNodes.find(n => n.id === conn.from_node_id);
            const toNode = visibleNodes.find(n => n.id === conn.to_node_id);
            if (!fromNode || !toNode) return null;
            
            let connLabel = '';
            if (conn.connection_type === 'predecessor') {
              connLabel = 'Predecessor';
            } else if (conn.connection_type === 'successor') {
              connLabel = 'Successor';
            } else if (conn.connection_type === 'cross_link') {
              connLabel = 'Contemporary';
            }
            
            return (
              <>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{connLabel}</div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  <div><strong>From:</strong> {fromNode.title}</div>
                  <div style={{ marginTop: '2px' }}><strong>To:</strong> {toNode.title}</div>
                  {conn.description && (
                    <div style={{ marginTop: '4px', opacity: 0.8 }}>{conn.description}</div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Node details panel */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          maxWidth: '400px',
          background: 'white',
          padding: '15px',
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 10,
        }}>
          {(() => {
            const node = visibleNodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{node.title}</h3>
                  <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  <div><strong>Vine:</strong> {node.vine}</div>
                  <div><strong>Time:</strong> {node.date_approximate} ({node.temporal_band})</div>
                  {node.creators && node.creators.length > 0 && (
                    <div><strong>Creators:</strong> {node.creators.join(', ')}</div>
                  )}
                </div>
                {node.description && (
                  <p style={{ fontSize: '12px', margin: '10px 0', lineHeight: '1.5' }}>{node.description}</p>
                )}
                {node.predecessors.length > 0 && (
                  <div style={{ fontSize: '11px', marginTop: '10px' }}>
                    <strong>Predecessors:</strong> {node.predecessors.map(id => {
                      const pred = nodes.find(n => n.id === id);
                      return pred ? pred.title : id;
                    }).join(', ')}
                  </div>
                )}
                {node.successors.length > 0 && (
                  <div style={{ fontSize: '11px', marginTop: '5px' }}>
                    <strong>Successors:</strong> {node.successors.map(id => {
                      const succ = nodes.find(n => n.id === id);
                      return succ ? succ.title : id;
                    }).join(', ')}
                  </div>
                )}
                {node.cross_links.length > 0 && (
                  <div style={{ fontSize: '11px', marginTop: '5px', color: '#9b59b6' }}>
                    <strong>Contemporaries:</strong> {node.cross_links.map(id => {
                      const cross = nodes.find(n => n.id === id);
                      return cross ? cross.title : id;
                    }).join(', ')}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
