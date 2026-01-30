import type { CivilizationNode, CivilizationRelation } from '../data/civilizations';
import { allCivilizationNodes, civilizationRelations } from '../data/civilizations';

interface CivilizationSidePanelProps {
  node: CivilizationNode | null;
  onClose: () => void;
}

export default function CivilizationSidePanel({ node, onClose }: CivilizationSidePanelProps) {
  if (!node) return null;

  // Find related nodes (nodes connected to this one)
  const incomingRelations = civilizationRelations.filter(rel => rel.to_id === node.id);
  const outgoingRelations = civilizationRelations.filter(rel => rel.from_id === node.id);
  
  const incomingNodes = incomingRelations.map(rel => 
    allCivilizationNodes.find(n => n.id === rel.from_id)
  ).filter(Boolean) as CivilizationNode[];
  
  const outgoingNodes = outgoingRelations.map(rel => 
    allCivilizationNodes.find(n => n.id === rel.to_id)
  ).filter(Boolean) as CivilizationNode[];

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '400px',
      height: '100vh',
      background: 'white',
      boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
      overflowY: 'auto',
      zIndex: 1000,
      borderLeft: `4px solid ${node.color || '#666'}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        background: node.color || '#666',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {node.emoji && <span>{node.emoji}</span>}
              {node.name}
            </h2>
            {node.timePeriod && (
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                {node.timePeriod}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Description */}
        {node.description && (
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ 
              fontSize: '1rem', 
              lineHeight: '1.6', 
              color: '#333',
              fontStyle: 'italic',
              margin: 0,
            }}>
              {node.description}
            </p>
          </div>
        )}

        {/* Key Figures */}
        {node.keyFigures && node.keyFigures.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              margin: '0 0 0.75rem 0',
              color: '#2d5a27',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '0.5rem',
            }}>
              Key Figures
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {node.keyFigures.map((figure, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f5f5f5',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    color: '#333',
                  }}
                >
                  {figure}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Themes */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            margin: '0 0 0.75rem 0',
            color: '#2d5a27',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '0.5rem',
          }}>
            Themes
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            {node.themes.map((theme, idx) => (
              <li key={idx} style={{ color: '#555' }}>{theme}</li>
            ))}
          </ul>
        </div>

        {/* Gifts */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            margin: '0 0 0.75rem 0',
            color: '#2d5a27',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '0.5rem',
          }}>
            Gifts to Humanity
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            {node.gifts.map((gift, idx) => (
              <li key={idx} style={{ color: '#555' }}>{gift}</li>
            ))}
          </ul>
        </div>

        {/* Questions */}
        {node.questions && node.questions.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              margin: '0 0 0.75rem 0',
              color: '#2d5a27',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '0.5rem',
            }}>
              Inquiry Questions
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              {node.questions.map((question, idx) => (
                <li key={idx} style={{ color: '#555', marginBottom: '0.5rem' }}>
                  <em>{question}</em>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rubric */}
        {node.rubric && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              margin: '0 0 0.75rem 0',
              color: '#2d5a27',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '0.5rem',
            }}>
              Evaluation Rubric
            </h3>
            {node.rubric.categories.map((category, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  fontSize: '1rem', 
                  margin: '0 0 0.5rem 0',
                  color: '#444',
                  fontWeight: '600',
                }}>
                  {category.name}
                  {category.weight && (
                    <span style={{ 
                      fontSize: '0.85rem', 
                      color: '#666', 
                      fontWeight: 'normal',
                      marginLeft: '0.5rem',
                    }}>
                      ({category.weight}%)
                    </span>
                  )}
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                  {category.criteria.map((criterion, cIdx) => (
                    <li key={cIdx} style={{ color: '#555', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {node.links && node.links.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              margin: '0 0 0.75rem 0',
              color: '#2d5a27',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '0.5rem',
            }}>
              Resources & Links
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              {node.links.map((link, idx) => (
                <li key={idx} style={{ marginBottom: '0.75rem' }}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: node.color || '#1e88e5',
                      textDecoration: 'none',
                      fontWeight: '500',
                    }}
                  >
                    {link.title}
                  </a>
                  {link.description && (
                    <p style={{ 
                      margin: '0.25rem 0 0 0', 
                      fontSize: '0.85rem', 
                      color: '#666',
                      fontStyle: 'italic',
                    }}>
                      {link.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Readings */}
        {node.relatedReadings && node.relatedReadings.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              margin: '0 0 0.75rem 0',
              color: '#2d5a27',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '0.5rem',
            }}>
              Related Readings
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              {node.relatedReadings.map((reading, idx) => (
                <li key={idx} style={{ color: '#555', marginBottom: '0.5rem' }}>
                  <strong>{reading.title}</strong>
                  {reading.author && (
                    <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                      by {reading.author}
                    </span>
                  )}
                  {reading.url && (
                    <a
                      href={reading.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: node.color || '#1e88e5',
                        textDecoration: 'none',
                        marginLeft: '0.5rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      [Link]
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Connections */}
        {(incomingNodes.length > 0 || outgoingNodes.length > 0) && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              margin: '0 0 0.75rem 0',
              color: '#2d5a27',
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '0.5rem',
            }}>
              Connections
            </h3>
            
            {incomingNodes.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0', color: '#666' }}>
                  Grows From / Influenced By:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {incomingNodes.map((relatedNode) => {
                    const relation = incomingRelations.find(r => r.from_id === relatedNode.id && r.to_id === node.id);
                    return (
                      <div
                        key={relatedNode.id}
                        style={{
                          background: '#f9f9f9',
                          border: `2px solid ${relatedNode.color || '#ccc'}`,
                          padding: '0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {relatedNode.emoji && <span>{relatedNode.emoji}</span>}
                          <strong>{relatedNode.name}</strong>
                        </div>
                        {relation && (
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#666', 
                            marginTop: '0.25rem',
                            fontStyle: 'italic',
                          }}>
                            {relation.relation_type.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {outgoingNodes.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0', color: '#666' }}>
                  Influences / Connects To:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {outgoingNodes.map((relatedNode) => {
                    const relation = outgoingRelations.find(r => r.from_id === node.id && r.to_id === relatedNode.id);
                    return (
                      <div
                        key={relatedNode.id}
                        style={{
                          background: '#f9f9f9',
                          border: `2px solid ${relatedNode.color || '#ccc'}`,
                          padding: '0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {relatedNode.emoji && <span>{relatedNode.emoji}</span>}
                          <strong>{relatedNode.name}</strong>
                        </div>
                        {relation && (
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#666', 
                            marginTop: '0.25rem',
                            fontStyle: 'italic',
                          }}>
                            {relation.relation_type.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
