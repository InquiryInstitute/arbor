import React, { useEffect, useRef, useState, useCallback } from 'react';
import ELK from 'elkjs';
import type { CommonCoreNode, CommonCoreRelation } from '../data/commoncore';
import { allCommonCoreNodes, commonCoreRelations } from '../data/commoncore';

// Type definitions for ELK
interface ELKNode {
  id: string;
  labels?: Array<{ text: string }>;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
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
const relationColors: Record<CommonCoreRelation['relation_type'], string> = {
  contains: '#4caf50',      // Green - hierarchical
  prerequisite: '#2196f3',   // Blue - prerequisite (more visible)
  builds_on: '#ff9800',       // Orange - progression
};

// Color mapping for node types
const nodeTypeColors: Record<CommonCoreNode['type'], string> = {
  grade: '#2196f3',      // Blue
  subject: '#4caf50',    // Green
  domain: '#66bb6a',     // Light green
  cluster: '#81c784',    // Lighter green
  standard: '#a5d6a7',   // Lightest green
};

interface CommonCoreTreeProps {
  width?: number;
  height?: number;
}

export default function CommonCoreTree({ 
  width = 1800,
  height = 1400,
}: CommonCoreTreeProps) {
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
      try {
        const elk = new ELK();
        
        // Get all nodes by type
        const gradeNodes = allCommonCoreNodes.filter(n => n.type === 'grade');
        const subjectNodes = allCommonCoreNodes.filter(n => n.type === 'subject');
        const domainNodes = allCommonCoreNodes.filter(n => n.type === 'domain');
        const clusterNodes = allCommonCoreNodes.filter(n => n.type === 'cluster');
        
        // Create flat list of all nodes with layer assignment
        // Layer 0: Grades (K at bottom, 12 at top)
        // Layer 1: Subjects
        // Layer 2: Domains
        // Layer 3: Clusters
        
        const elkNodes: ELKNode[] = [];
        const nodeToLayer = new Map<string, number>();
        
        // Add grade nodes (layer 0-12, K=0, 1-12)
        // Grades form the central spine
        // With direction UP, lower layer numbers are at bottom, higher at top
        // So K (0) should be at bottom, Grade 12 (12) at top
        gradeNodes.forEach(grade => {
          const gradeNum = grade.grade ?? 0;
          elkNodes.push({
            id: grade.id,
            labels: [{ text: grade.name }],
            width: 180,
            height: 50,
            layoutOptions: {
              // Layer assignment: K=0 (bottom), Grade 12=12 (top)
              'elk.layered.layer': gradeNum.toString(),
              // Center grades as spine - use priority 0 to keep them centered
              'elk.priority': '0',
            },
          });
          nodeToLayer.set(grade.id, gradeNum);
        });
        
        // Add subject nodes (layer = grade + 0.5, positioned between grade and domains)
        // Use port constraints to keep Math and ELA vertically aligned like vines
        subjectNodes.forEach(subject => {
          const gradeNum = subject.grade ?? 0;
          const layer = gradeNum + 0.5;
          const subjectId = subject.grade! <= 8 ? subject.id : `${subject.id}-${gradeNum}`;
          
          elkNodes.push({
            id: subjectId,
            labels: [{ text: subject.name }],
            width: 160,
            height: 45,
            layoutOptions: {
              'elk.layered.layer': layer.toString(),
              // Use port alignment to keep subjects in vertical columns
              'elk.portAlignment.basic': 'JUSTIFIED',
              // Force horizontal position: Math on left (negative priority), ELA on right (positive priority)
              'elk.priority': subject.subject === 'math' ? '-100' : '100',
              // Use port constraints to maintain vertical alignment
              'elk.portConstraints': 'FIXED_SIDE',
              'elk.portAlignment.default': subject.subject === 'math' ? 'LEFT' : 'RIGHT',
            },
          });
          nodeToLayer.set(subjectId, layer);
        });
        
        // Add domain nodes (layer = grade + 1)
        // Keep domains aligned with their parent subjects (vine structure)
        domainNodes.forEach(domain => {
          const gradeNum = domain.grade ?? 0;
          const layer = gradeNum + 1;
          elkNodes.push({
            id: domain.id,
            labels: [{ text: domain.name }],
            width: 150,
            height: 40,
            layoutOptions: {
              'elk.layered.layer': layer.toString(),
              // Align domains with their subject type (Math left, ELA right)
              'elk.priority': domain.subject === 'math' ? '-50' : '50',
              'elk.portAlignment.basic': 'JUSTIFIED',
            },
          });
          nodeToLayer.set(domain.id, layer);
        });
        
        // Add cluster nodes (layer = grade + 1.5)
        // Keep clusters aligned with their parent domains (vine structure)
        clusterNodes.forEach(cluster => {
          const gradeNum = cluster.grade ?? 0;
          const layer = gradeNum + 1.5;
          elkNodes.push({
            id: cluster.id,
            labels: [{ text: cluster.name }],
            width: 140,
            height: 35,
            layoutOptions: {
              'elk.layered.layer': layer.toString(),
              // Align clusters with their subject type (Math left, ELA right)
              'elk.priority': cluster.subject === 'math' ? '-25' : '25',
              'elk.portAlignment.basic': 'JUSTIFIED',
            },
          });
          nodeToLayer.set(cluster.id, layer);
        });
        
        // Create edges
        const elkEdges: ELKEdge[] = [];
        
        commonCoreRelations.forEach(relation => {
          let sourceId = relation.from_id;
          let targetId = relation.to_id;
          
          // Handle high school subject edges
          if (relation.from_id.startsWith('grade-') && relation.to_id.includes('-hs')) {
            const gradeId = relation.from_id;
            const gradeNum = parseInt(gradeId.split('-')[1] === 'k' ? '0' : gradeId.split('-')[1]);
            if (gradeNum >= 9 && gradeNum <= 12) {
              sourceId = gradeId;
              targetId = `${relation.to_id}-${gradeNum}`;
            } else {
              return; // Skip if not a valid HS grade
            }
          }
          
          // Check if both nodes exist
          const sourceExists = elkNodes.some(n => n.id === sourceId);
          const targetExists = elkNodes.some(n => n.id === targetId);
          
          if (sourceExists && targetExists) {
            elkEdges.push({
              id: relation.id,
              sources: [sourceId],
              targets: [targetId],
              labels: relation.description ? [{ text: relation.description }] : undefined,
            });
          }
        });
        
        // Create ELK graph
        const elkGraph: ELKGraph = {
          id: 'root',
          layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': 'UP', // Bottom to top
            'elk.spacing.nodeNode': '80',
            'elk.spacing.edgeNode': '40',
            'elk.layered.spacing.nodeNodeBetweenLayers': '150',
            'elk.layered.spacing.edgeNodeBetweenLayers': '50',
            'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.layered.cycleBreaking.strategy': 'GREEDY',
            'elk.spacing.edgeEdge': '30',
            'elk.portAlignment.basic': 'JUSTIFIED',
            // Force tighter horizontal alignment for vine effect
            'elk.layered.nodePlacement.bk.fixedAlignment': 'BALANCED',
            'elk.layered.compaction.postCompaction.strategy': 'EDGE_LENGTH',
          },
          children: elkNodes,
          edges: elkEdges,
        };
        
        const layoutedGraph = await elk.layout(elkGraph);
        
        // Post-process to create spine structure: grades centered, subjects branching left/right
        if (layoutedGraph.children) {
          // Helper to flatten nodes
          const flattenAllNodes = (nodes: ELKNode[]): ELKNode[] => {
            const result: ELKNode[] = [];
            nodes.forEach(node => {
              result.push(node);
              if (node.children) {
                result.push(...flattenAllNodes(node.children));
              }
            });
            return result;
          };
          
          const allNodes = flattenAllNodes(layoutedGraph.children);
          
          // Find all grade nodes and ensure they're ordered bottom to top (K at bottom, 12 at top)
          const gradeNodesList: Array<{ node: ELKNode; gradeNum: number }> = [];
          allNodes.forEach(node => {
            const nodeData = allCommonCoreNodes.find(n => n.id === node.id);
            if (nodeData?.type === 'grade') {
              gradeNodesList.push({ node, gradeNum: nodeData.grade ?? 0 });
            }
          });
          
          // Sort by Y position (bottom to top: lower Y = bottom, higher Y = top)
          gradeNodesList.sort((a, b) => (a.node.y || 0) - (b.node.y || 0));
          
          // Verify that grade numbers increase from bottom to top
          // If not, we may need to adjust - but with direction UP, this should be correct
          const firstGrade = gradeNodesList[0]?.gradeNum;
          const lastGrade = gradeNodesList[gradeNodesList.length - 1]?.gradeNum;
          
          // If grades are reversed (higher grade at bottom), we need to fix it
          if (firstGrade !== undefined && lastGrade !== undefined && firstGrade > lastGrade) {
            // Reverse the Y positions to fix the order
            const minY = Math.min(...gradeNodesList.map(item => item.node.y || 0));
            const maxY = Math.max(...gradeNodesList.map(item => item.node.y || 0));
            const yRange = maxY - minY;
            
            // Reassign Y positions so lower grades have lower Y values
            gradeNodesList.forEach(({ node, gradeNum }) => {
              // Calculate what Y position this grade should have
              // K (0) should be at minY, Grade 12 (12) should be at maxY
              const totalGrades = 13; // K + 12 grades
              const targetY = minY + (gradeNum / (totalGrades - 1)) * yRange;
              node.y = targetY;
            });
          }
          
          // Calculate center X position for the spine (average of all grade X positions)
          const centerX = gradeNodesList.length > 0
            ? gradeNodesList.reduce((sum, item) => sum + (item.node.x || 0), 0) / gradeNodesList.length
            : width / 2;
          
          // Center all grade nodes as the spine
          gradeNodesList.forEach(({ node }) => {
            if (node.x !== undefined) {
              node.x = centerX;
            }
          });
          
          // Calculate average X positions for Math and ELA subjects
          const mathSubjects: ELKNode[] = [];
          const elaSubjects: ELKNode[] = [];
          
          allNodes.forEach(node => {
            const nodeData = allCommonCoreNodes.find(n => {
              if (node.id.includes('-hs-')) {
                const baseId = node.id.split('-').slice(0, 2).join('-');
                return n.id === baseId;
              }
              return n.id === node.id;
            });
            
            if (nodeData?.type === 'subject') {
              if (nodeData.subject === 'math') {
                mathSubjects.push(node);
              } else if (nodeData.subject === 'ela') {
                elaSubjects.push(node);
              }
            }
          });
          
          // Calculate average X positions for subjects (relative to spine)
          const mathAvgX = mathSubjects.length > 0
            ? mathSubjects.reduce((sum, n) => sum + (n.x || 0), 0) / mathSubjects.length
            : centerX - 300;
          const elaAvgX = elaSubjects.length > 0
            ? elaSubjects.reduce((sum, n) => sum + (n.x || 0), 0) / elaSubjects.length
            : centerX + 300;
          
          // Align all Math subjects to the left of spine (vine alignment)
          mathSubjects.forEach(node => {
            if (node.x !== undefined) {
              node.x = mathAvgX;
            }
          });
          
          // Align all ELA subjects to the right of spine (vine alignment)
          elaSubjects.forEach(node => {
            if (node.x !== undefined) {
              node.x = elaAvgX;
            }
          });
          
          // Align domains and clusters to their parent subjects (maintain vine structure)
          allNodes.forEach(node => {
            const nodeData = allCommonCoreNodes.find(n => {
              if (node.id.includes('-hs-')) {
                const baseId = node.id.split('-').slice(0, 2).join('-');
                return n.id === baseId;
              }
              return n.id === node.id;
            });
            
            if (nodeData && (nodeData.type === 'domain' || nodeData.type === 'cluster')) {
              // Find the subject for this domain/cluster
              const gradeNum = nodeData.grade ?? 0;
              const subjectId = gradeNum <= 8 
                ? `${nodeData.subject}-${gradeNum === 0 ? 'k' : gradeNum}`
                : `${nodeData.subject}-hs-${gradeNum}`;
              
              const subjectNode = allNodes.find(n => n.id === subjectId);
              if (subjectNode && subjectNode.x !== undefined && node.x !== undefined) {
                // Align domain/cluster to its subject's X position (with offset for visual separation)
                const offset = nodeData.type === 'domain' 
                  ? (nodeData.subject === 'math' ? -200 : 200) 
                  : (nodeData.subject === 'math' ? -350 : 350);
                node.x = subjectNode.x + offset;
              }
            }
          });
        }
        
        setLayout(layoutedGraph as ELKGraph);
        setLoading(false);
      } catch (err) {
        console.error('Layout computation failed:', err);
        setLoading(false);
      }
    }

    computeLayout();
  }, [width, height]);

  // Flatten ELK nodes recursively
  const flattenNodes = useCallback((nodes: ELKNode[]): ELKNode[] => {
    const result: ELKNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children) {
        result.push(...flattenNodes(node.children));
      }
    });
    return result;
  }, []);

  // Calculate bounding box
  const getBoundingBox = useCallback(() => {
    if (!layout || !layout.children || layout.children.length === 0) {
      return { minX: 0, minY: 0, maxX: width, maxY: height, width: width, height: height };
    }

    const allNodes = flattenNodes(layout.children);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    allNodes.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        const nodeWidth = node.width || 200;
        const nodeHeight = node.height || 60;
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + nodeWidth);
        maxY = Math.max(maxY, node.y + nodeHeight);
      }
    });

    const padding = 100;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: maxX - minX + 2 * padding,
      height: maxY - minY + 2 * padding,
    };
  }, [layout, width, height, flattenNodes]);

  // Zoom to fit
  const zoomToFit = useCallback(() => {
    const bbox = getBoundingBox();
    const scaleX = width / bbox.width;
    const scaleY = height / bbox.height;
    const scale = Math.min(scaleX, scaleY, 1) * 0.85;
    
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

  const allELKNodes = flattenNodes(layout.children || []);
  const selectedNode = selectedNodeId ? allCommonCoreNodes.find(n => {
    if (selectedNodeId.includes('-hs-')) {
      const baseId = selectedNodeId.split('-').slice(0, 2).join('-');
      return n.id === baseId;
    }
    return n.id === selectedNodeId;
  }) : null;

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
          background: 'white',
          padding: '5px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <button
            onClick={() => setTransform({ ...transform, scale: Math.min(10, transform.scale * 1.2) })}
            style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc' }}
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setTransform({ ...transform, scale: Math.max(0.1, transform.scale * 0.8) })}
            style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc' }}
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={zoomToFit}
            style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc' }}
            title="Zoom to fit"
          >
            ⌂
          </button>
          <button
            onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
            style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc' }}
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
                markerWidth="12"
                markerHeight="12"
                refX="10"
                refY="6"
                orient="auto"
              >
                <polygon points="0 0, 12 6, 0 12" fill={color} />
              </marker>
            ))}
          </defs>

          <g
            ref={containerRef}
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
          >
            {/* Render edges */}
            {(layout.edges || []).map(edge => {
              const sourceNode = allELKNodes.find(n => n.id === edge.sources[0]);
              const targetNode = allELKNodes.find(n => n.id === edge.targets[0]);
              
              if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || 
                  targetNode.x === undefined || targetNode.y === undefined) {
                return null;
              }

              // Find relation data
              const relation = commonCoreRelations.find(r => r.id === edge.id || 
                edge.id.startsWith(r.id + '-'));
              const relationType = relation?.relation_type || 'contains';
              const strokeColor = relationColors[relationType] || '#666';
              const strokeWidth = relationType === 'prerequisite' ? 3.5 : relationType === 'builds_on' ? 2.5 : 2;
              const strokeDasharray = relationType === 'prerequisite' ? '10,5' : relationType === 'builds_on' ? '6,4' : undefined;
              const opacity = relationType === 'prerequisite' ? 0.95 : relationType === 'builds_on' ? 0.85 : 0.65;

              const sourceX = sourceNode.x + (sourceNode.width || 200) / 2;
              const sourceY = sourceNode.y + (sourceNode.height || 60) / 2;
              const targetX = targetNode.x + (targetNode.width || 200) / 2;
              const targetY = targetNode.y + (targetNode.height || 60) / 2;

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
            {allELKNodes.map(elkNode => {
              if (elkNode.x === undefined || elkNode.y === undefined) return null;
              
              const nodeData = allCommonCoreNodes.find(n => {
                if (elkNode.id.includes('-hs-')) {
                  const baseId = elkNode.id.split('-').slice(0, 2).join('-');
                  return n.id === baseId;
                }
                return n.id === elkNode.id;
              });
              
              if (!nodeData) return null;
              
              const isHovered = hoveredNodeId === elkNode.id;
              const isSelected = selectedNodeId === elkNode.id;
              const nodeColor = nodeData.color || nodeTypeColors[nodeData.type] || '#888';
              const strokeWidth = isSelected ? 4 : isHovered ? 3 : 2;
              const nodeOpacity = isSelected ? 1 : isHovered ? 0.95 : 0.9;
              const nodeWidth = elkNode.width || 200;
              const nodeHeight = elkNode.height || 60;
              const label = elkNode.labels?.[0]?.text || nodeData.name;

              return (
                <g key={elkNode.id}>
                  <rect
                    x={elkNode.x}
                    y={elkNode.y}
                    width={nodeWidth}
                    height={nodeHeight}
                    fill={nodeColor}
                    stroke={isSelected ? '#000' : isHovered ? '#333' : nodeColor}
                    strokeWidth={strokeWidth}
                    rx={8}
                    opacity={nodeOpacity}
                    onMouseEnter={() => setHoveredNodeId(elkNode.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => setSelectedNodeId(isSelected ? null : elkNode.id)}
                    style={{ 
                      cursor: 'pointer',
                      filter: isSelected ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' : 
                              isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' : 'none',
                      transition: 'all 0.2s ease-out',
                    }}
                  />
                  <text
                    x={elkNode.x + nodeWidth / 2}
                    y={elkNode.y + nodeHeight / 2}
                    fontSize={nodeData.type === 'grade' ? 13 : nodeData.type === 'subject' ? 11 : nodeData.type === 'domain' ? 10 : 9}
                    fontWeight={nodeData.type === 'grade' ? 'bold' : nodeData.type === 'subject' ? '600' : 'normal'}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ 
                      pointerEvents: 'none',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    }}
                  >
                    {label}
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
          zIndex: 5,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, color: '#333', fontSize: '1.25rem' }}>{selectedNode.name}</h2>
            <button
              onClick={() => setSelectedNodeId(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#666',
                padding: '0 5px',
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
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
              <p style={{ marginTop: '0.5rem', lineHeight: '1.6', color: '#666' }}>{selectedNode.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
