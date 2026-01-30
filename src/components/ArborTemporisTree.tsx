import { useEffect, useRef, useState, useCallback } from 'react';
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

  // Calculate time range
  const timeHeights = nodes.map(n => n.time_height);
  const minTime = Math.min(...timeHeights);
  const maxTime = Math.max(...timeHeights);
  const timeRange = maxTime - minTime;

  // Layout parameters
  const vineLaneWidth = width / vineOrder.length;
  const timePadding = 100; // Padding at top and bottom
  const availableHeight = height - 2 * timePadding;

  // Convert time_height to Y position (linear mapping)
  const timeToY = useCallback((timeHeight: number): number => {
    // Normalize: 0 (minTime) to 1 (maxTime)
    const normalized = (timeHeight - minTime) / timeRange;
    // Map to Y: bottom (minTime) to top (maxTime)
    return height - timePadding - (normalized * availableHeight);
  }, [minTime, timeRange, height, timePadding, availableHeight]);

  // Convert vine to X position (horizontal lane)
  const vineToX = useCallback((vine: string): number => {
    const index = vineOrder.indexOf(vine as any);
    if (index === -1) return width / 2;
    return (index + 0.5) * vineLaneWidth;
  }, [width, vineLaneWidth]);

  // Calculate bounding box
  const getBoundingBox = useCallback(() => {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: width, maxY: height, width, height };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const x = vineToX(node.vine);
      const y = timeToY(node.time_height);
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
  }, [nodes, vineToX, timeToY]);

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
  const selectedBraid = braids.find(b => b.node_ids.includes(selectedNode || ''));
  const braidNodes = selectedBraid ? new Set(selectedBraid.node_ids) : null;

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

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
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
          {/* Draw vine lanes (vertical lines) */}
          {vineOrder.map((vine, index) => {
            const x = (index + 0.5) * vineLaneWidth;
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
          {Array.from(nodes.reduce((bands, node) => {
            if (!bands.has(node.temporal_band)) {
              bands.set(node.temporal_band, node.time_height);
            }
            return bands;
          }, new Map()).entries()).map(([band, timeHeight]) => {
            const y = timeToY(timeHeight);
            return (
              <g key={`band-${band}`}>
                <line
                  x1={0}
                  y1={y}
                  x2={width}
                  y2={y}
                  stroke="#999"
                  strokeWidth={1}
                  strokeOpacity={0.3}
                  strokeDasharray="3,3"
                />
                <text
                  x={10}
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
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from_node_id);
            const toNode = nodes.find(n => n.id === conn.to_node_id);
            
            if (!fromNode || !toNode) return null;

            const x1 = vineToX(fromNode.vine);
            const y1 = timeToY(fromNode.time_height);
            const x2 = vineToX(toNode.vine);
            const y2 = timeToY(toNode.time_height);

            const isSelected = selectedNode === fromNode.id || selectedNode === toNode.id;
            const isBraid = braidNodes?.has(fromNode.id) && braidNodes?.has(toNode.id);

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

            return (
              <line
                key={conn.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                markerEnd={conn.connection_type === 'successor' ? 'url(#arrowhead-up)' : undefined}
              />
            );
          })}

          {/* Render nodes */}
          {nodes.map(node => {
            const x = vineToX(node.vine);
            const y = timeToY(node.time_height);
            const nodeWidth = 120;
            const nodeHeight = 60;

            const isSelected = selectedNode === node.id;
            const isInBraid = braidNodes?.has(node.id);

            const baseColor = VINE_COLORS[node.vine];
            const fillColor = isInBraid ? '#fff3cd' : '#ffffff';
            const strokeColor = isSelected ? '#e74c3c' : baseColor;
            const strokeWidth = isSelected ? 3 : isInBraid ? 2.5 : 2;

            return (
              <g key={node.id}>
                <rect
                  x={x - nodeWidth / 2}
                  y={y - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  rx={4}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
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
          {braids.map(braid => {
            const braidNodes = nodes.filter(n => braid.node_ids.includes(n.id));
            if (braidNodes.length === 0) return null;

            // Find bounding box of braid
            const xs = braidNodes.map(n => vineToX(n.vine));
            const ys = braidNodes.map(n => timeToY(n.time_height));
            const minX = Math.min(...xs) - 80;
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
            const node = nodes.find(n => n.id === selectedNode);
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
