import { useEffect, useRef, useState, useCallback } from 'react';
import type { CommonCoreNode, CommonCoreRelation } from '../data/commoncore';
import { allCommonCoreNodes, commonCoreRelations } from '../data/commoncore';

// Type definitions for layout
interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  node: CommonCoreNode;
}

interface LayoutEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relation: CommonCoreRelation;
}

// Color mapping for relation types
const relationColors: Record<CommonCoreRelation['relation_type'], string> = {
  contains: '#2d5a27',      // Dark green - hierarchical
  prerequisite: '#1976d2',   // Blue - prerequisite
  builds_on: '#ff9800',      // Orange - progression
};

// Color mapping for node types
const nodeTypeColors: Record<CommonCoreNode['type'], string> = {
  grade: '#2196f3',
  subject: '#4caf50',
  domain: '#66bb6a',
  cluster: '#81c784',
  standard: '#a5d6a7',
};

interface CommonCoreTreeProps {
  width?: number;
  height?: number;
}

export default function CommonCoreTree({ 
  width = 1600,
  height = 1200,
}: CommonCoreTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const [layout, setLayout] = useState<{ nodes: LayoutNode[]; edges: LayoutEdge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Pan/zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    function computeLayout() {
      const nodes: LayoutNode[] = [];
      const edges: LayoutEdge[] = [];
      
      // Layout parameters
      const margin = 50;
      const gradeSpacing = (height - 2 * margin) / 13; // 13 grade levels (K + 1-12)
      const centerX = width / 2;
      
      // Group nodes by level and grade
      const gradeLevelNodes = allCommonCoreNodes.filter(n => n.type === 'grade');
      const subjectNodes = allCommonCoreNodes.filter(n => n.type === 'subject');
      const domainNodes = allCommonCoreNodes.filter(n => n.type === 'domain');
      const clusterNodes = allCommonCoreNodes.filter(n => n.type === 'cluster');
      
      // Layout grade nodes (bottom to top)
      gradeLevelNodes.forEach((node, index) => {
        const gradeNum = node.grade ?? 0;
        // Invert: K (0) at bottom, 12 at top
        const y = height - margin - (gradeNum * gradeSpacing) - gradeSpacing / 2;
        
        nodes.push({
          id: node.id,
          x: centerX,
          y: y,
          width: 200,
          height: 60,
          label: node.name,
          node,
        });
      });
      
      // Layout subject nodes (left and right of grade nodes)
      // For K-8, create subject nodes for each grade
      // For HS, create one subject node per grade (9-12) that links to math-hs/ela-hs
      subjectNodes.forEach(subject => {
        if (subject.grade! <= 8) {
          // K-8: one subject node per grade
          const gradeNum = subject.grade ?? 0;
          const y = height - margin - (gradeNum * gradeSpacing) - gradeSpacing / 2;
          const offsetX = subject.subject === 'math' ? -250 : 250;
          
          nodes.push({
            id: subject.id,
            x: centerX + offsetX,
            y: y,
            width: 180,
            height: 50,
            label: subject.name,
            node: subject,
          });
        } else {
          // HS: create subject nodes for each grade 9-12, all pointing to same content
          for (let grade = 9; grade <= 12; grade++) {
            const gradeNum = grade;
            const y = height - margin - (gradeNum * gradeSpacing) - gradeSpacing / 2;
            const offsetX = subject.subject === 'math' ? -250 : 250;
            
            // Use the subject ID but create unique instances per grade
            nodes.push({
              id: `${subject.id}-${grade}`,
              x: centerX + offsetX,
              y: y,
              width: 180,
              height: 50,
              label: subject.name,
              node: { ...subject, grade },
            });
          }
        }
      });
      
      // Layout domain nodes (further out from subjects)
      domainNodes.forEach(domain => {
        const gradeNum = domain.grade ?? 0;
        const y = height - margin - (gradeNum * gradeSpacing) - gradeSpacing / 2;
        
        // Find position within subject's domains for this grade
        const domainsInSubject = domainNodes.filter(d => 
          d.subject === domain.subject && 
          d.grade === domain.grade
        );
        const domainIndex = domainsInSubject.findIndex(d => d.id === domain.id);
        const totalDomains = domainsInSubject.length;
        
        const baseOffsetX = domain.subject === 'math' ? -450 : 450;
        const domainSpacing = 80;
        const offsetX = baseOffsetX + (domainIndex - (totalDomains - 1) / 2) * domainSpacing;
        
        nodes.push({
          id: domain.id,
          x: centerX + offsetX,
          y: y,
          width: 140,
          height: 40,
          label: domain.name,
          node: domain,
        });
      });
      
      // Layout cluster nodes (furthest out)
      clusterNodes.forEach(cluster => {
        const gradeNum = cluster.grade ?? 0;
        const y = height - margin - (gradeNum * gradeSpacing) - gradeSpacing / 2;
        
        const baseOffsetX = cluster.subject === 'math' ? -650 : 650;
        
        nodes.push({
          id: cluster.id,
          x: centerX + baseOffsetX,
          y: y,
          width: 120,
          height: 35,
          label: cluster.name,
          node: cluster,
        });
      });
      
      // Create edges from relations
      commonCoreRelations.forEach(relation => {
        // Handle grade to subject relations
        if (relation.from_id.startsWith('grade-') && (relation.to_id.startsWith('math-') || relation.to_id.startsWith('ela-'))) {
          const gradeId = relation.from_id;
          const subjectId = relation.to_id;
          const gradeNum = parseInt(gradeId.split('-')[1] === 'k' ? '0' : gradeId.split('-')[1]);
          
          // For high school, create edges to all grade-specific subject nodes
          if (gradeNum >= 9 && subjectId.includes('-hs')) {
            for (let grade = 9; grade <= 12; grade++) {
              const sourceNode = nodes.find(n => n.id === gradeId);
              const targetNode = nodes.find(n => n.id === `${subjectId}-${grade}`);
              if (sourceNode && targetNode) {
                edges.push({
                  id: `${relation.id}-${grade}`,
                  sourceId: gradeId,
                  targetId: `${subjectId}-${grade}`,
                  relation,
                });
              }
            }
          } else {
            // For K-8, use the relation as-is
            const sourceNode = nodes.find(n => n.id === relation.from_id);
            const targetNode = nodes.find(n => n.id === relation.to_id);
            if (sourceNode && targetNode) {
              edges.push({
                id: relation.id,
                sourceId: relation.from_id,
                targetId: relation.to_id,
                relation,
              });
            }
          }
        } else {
          // For other relations, check if nodes exist (may need to map subject IDs)
          let sourceId = relation.from_id;
          let targetId = relation.to_id;
          
          // If relation is from a high school subject, we need to create edges for all grades
          if (sourceId === 'math-hs' || sourceId === 'ela-hs') {
            // Find all grade-specific subject nodes for this subject
            const subjectType = sourceId.split('-')[0];
            for (let grade = 9; grade <= 12; grade++) {
              const sourceNode = nodes.find(n => n.id === `${sourceId}-${grade}`);
              const targetNode = nodes.find(n => {
                // Target should be a domain for this grade
                return n.id === targetId && n.node.grade === grade;
              });
              if (sourceNode && targetNode) {
                edges.push({
                  id: `${relation.id}-${grade}`,
                  sourceId: `${sourceId}-${grade}`,
                  targetId: targetId,
                  relation,
                });
              }
            }
          } else {
            // Regular relation
            const sourceNode = nodes.find(n => n.id === sourceId);
            const targetNode = nodes.find(n => n.id === targetId);
            if (sourceNode && targetNode) {
              edges.push({
                id: relation.id,
                sourceId: sourceId,
                targetId: targetId,
                relation,
              });
            }
          }
        }
      });
      
      setLayout({ nodes, edges });
      setLoading(false);
    }

    computeLayout();
  }, [width, height]);

  // Calculate bounding box
  const getBoundingBox = useCallback(() => {
    if (!layout || !layout.nodes || layout.nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: width, maxY: height, width: width, height: height };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    layout.nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
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
        <p>Loading Common Core curriculum tree...</p>
      </div>
    );
  }

  const selectedNode = selectedNodeId ? allCommonCoreNodes.find(n => n.id === selectedNodeId) : null;

  return (
    <div style={{ position: 'relative', width, height, display: 'flex' }}>
      {/* Main SVG area */}
      <div style={{ 
        flex: 1, 
        position: 'relative',
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
          width={width}
          height={height}
          style={{ 
            border: '1px solid #ccc', 
            background: '#fafafa', 
            cursor: isPanning ? 'grabbing' : 'grab',
            display: 'block',
          }}
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
            {/* Render edges */}
            {layout.edges.map(edge => {
              const sourceNode = layout.nodes.find(n => n.id === edge.sourceId);
              const targetNode = layout.nodes.find(n => n.id === edge.targetId);
              
              if (!sourceNode || !targetNode) {
                return null;
              }

              const relationType = edge.relation.relation_type;
              const strokeColor = relationColors[relationType] || '#666';
              const strokeWidth = relationType === 'contains' ? 2 : 1.5;
              const strokeDasharray = relationType === 'prerequisite' ? '5,5' : undefined;
              const opacity = 0.6;

              const sourceX = sourceNode.x + sourceNode.width / 2;
              const sourceY = sourceNode.y + sourceNode.height / 2;
              const targetX = targetNode.x + targetNode.width / 2;
              const targetY = targetNode.y + targetNode.height / 2;

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
            {layout.nodes.map(layoutNode => {
              const node = layoutNode.node;
              const isHovered = hoveredNodeId === node.id;
              const isSelected = selectedNodeId === node.id;
              const nodeColor = node.color || nodeTypeColors[node.type] || '#888';
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
                    x={layoutNode.x}
                    y={layoutNode.y}
                    width={layoutNode.width}
                    height={layoutNode.height}
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
                    x={layoutNode.x + layoutNode.width / 2}
                    y={layoutNode.y + layoutNode.height / 2}
                    fontSize={node.type === 'grade' ? 14 : node.type === 'subject' ? 12 : node.type === 'domain' ? 10 : 9}
                    fontWeight={node.type === 'grade' ? 'bold' : node.type === 'subject' ? '600' : 'normal'}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ 
                      pointerEvents: 'none',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >
                    {layoutNode.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Side Panel */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: '350px',
          height: '100%',
          background: 'white',
          borderLeft: '2px solid #ccc',
          padding: '1.5rem',
          overflowY: 'auto',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, color: '#333' }}>{selectedNode.name}</h2>
            <button
              onClick={() => setSelectedNodeId(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#666',
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Type:</strong> {selectedNode.type}
          </div>
          
          {selectedNode.grade !== undefined && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Grade:</strong> {selectedNode.grade === 0 ? 'Kindergarten' : `Grade ${selectedNode.grade}`}
            </div>
          )}
          
          {selectedNode.subject && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Subject:</strong> {selectedNode.subject === 'math' ? 'Mathematics' : 'English Language Arts'}
            </div>
          )}
          
          {selectedNode.domain && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Domain:</strong> {selectedNode.domain}
            </div>
          )}
          
          {selectedNode.description && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Description:</strong>
              <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{selectedNode.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
