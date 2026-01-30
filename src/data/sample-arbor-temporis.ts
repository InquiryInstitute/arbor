// Sample data for Arbor Temporis - Florence c. 1500 braid
import type { ArborNode, Braid, NodeConnection } from '../types/arbor-temporis';
import { yearToTimeHeight, getTemporalBand } from '../types/arbor-temporis';

// Helper to create nodes
function createNode(
  id: string,
  title: string,
  vine: 'History' | 'Music' | 'Art' | 'Literature' | 'Science',
  year: number,
  isBCE: boolean = false,
  nodeType: 'event' | 'work' | 'idea' | 'movement' | 'technology' | 'person' | 'rupture' | 'cycle' = 'work',
  description: string = '',
  creators: string[] = [],
  tags: string[] = []
): ArborNode {
  const timeHeight = yearToTimeHeight(year, isBCE);
  return {
    id,
    title,
    vine,
    node_type: nodeType,
    time_height: timeHeight,
    temporal_band: getTemporalBand(timeHeight),
    date_approximate: isBCE ? `${year} BCE` : `${year} CE`,
    description,
    creators,
    tags,
    predecessors: [],
    successors: [],
    cross_links: [],
  };
}

// Florence c. 1500 - Renaissance braid
export const florenceNodes: ArborNode[] = [
  // History Vine
  createNode(
    'hist-medici-1434',
    'Medici Rule Begins',
    'History',
    1434,
    false,
    'event',
    'Cosimo de\' Medici becomes de facto ruler of Florence, beginning the Medici dynasty',
    ['Cosimo de\' Medici'],
    ['politics', 'florence', 'renaissance']
  ),
  createNode(
    'hist-italian-wars-1494',
    'Italian Wars Begin',
    'History',
    1494,
    false,
    'rupture',
    'French invasion of Italy marks the beginning of decades of warfare',
    [],
    ['war', 'politics', 'italy']
  ),
  
  // Art Vine
  createNode(
    'art-leonardo-1452',
    'Leonardo da Vinci',
    'Art',
    1452,
    false,
    'person',
    'Renaissance polymath: artist, scientist, inventor',
    ['Leonardo da Vinci'],
    ['renaissance', 'florence', 'polymath']
  ),
  createNode(
    'art-mona-lisa-1503',
    'Mona Lisa',
    'Art',
    1503,
    false,
    'work',
    'Leonardo\'s masterpiece, exemplifying sfumato technique',
    ['Leonardo da Vinci'],
    ['painting', 'portrait', 'masterpiece']
  ),
  createNode(
    'art-last-supper-1495',
    'The Last Supper',
    'Art',
    1495,
    false,
    'work',
    'Leonardo\'s fresco in Milan, revolutionary use of perspective',
    ['Leonardo da Vinci'],
    ['fresco', 'religious', 'perspective']
  ),
  createNode(
    'art-michelangelo-1475',
    'Michelangelo',
    'Art',
    1475,
    false,
    'person',
    'Sculptor, painter, architect, poet of the High Renaissance',
    ['Michelangelo'],
    ['renaissance', 'sculpture', 'florence']
  ),
  createNode(
    'art-david-1501',
    'David',
    'Art',
    1501,
    false,
    'work',
    'Michelangelo\'s marble sculpture, symbol of Florentine republic',
    ['Michelangelo'],
    ['sculpture', 'marble', 'republic']
  ),
  createNode(
    'art-sistine-1508',
    'Sistine Chapel Ceiling',
    'Art',
    1508,
    false,
    'work',
    'Michelangelo\'s fresco cycle, pinnacle of Renaissance art',
    ['Michelangelo'],
    ['fresco', 'religious', 'masterpiece']
  ),
  
  // Science Vine
  createNode(
    'sci-perspective-1435',
    'Perspective Theory',
    'Science',
    1435,
    false,
    'idea',
    'Alberti\'s mathematical system for representing 3D space on 2D surface',
    ['Leon Battista Alberti'],
    ['mathematics', 'optics', 'art']
  ),
  createNode(
    'sci-leonardo-anatomy-1500',
    'Leonardo\'s Anatomical Studies',
    'Science',
    1500,
    false,
    'work',
    'Revolutionary anatomical drawings based on dissection',
    ['Leonardo da Vinci'],
    ['anatomy', 'medicine', 'observation']
  ),
  
  // Literature Vine
  createNode(
    'lit-dante-1320',
    'The Divine Comedy',
    'Literature',
    1320,
    false,
    'work',
    'Dante\'s epic poem, foundation of Italian literature',
    ['Dante Alighieri'],
    ['epic', 'poetry', 'italian']
  ),
  createNode(
    'lit-machiavelli-1469',
    'Niccolò Machiavelli',
    'Literature',
    1469,
    false,
    'person',
    'Florentine diplomat and political theorist',
    ['Niccolò Machiavelli'],
    ['politics', 'philosophy', 'florence']
  ),
  createNode(
    'lit-prince-1513',
    'The Prince',
    'Literature',
    1513,
    false,
    'work',
    'Machiavelli\'s treatise on political power and statecraft',
    ['Niccolò Machiavelli'],
    ['politics', 'philosophy', 'statecraft']
  ),
  
  // Music Vine
  createNode(
    'mus-renaissance-polyphony-1400',
    'Renaissance Polyphony',
    'Music',
    1400,
    false,
    'movement',
    'Complex multi-voice musical style flourishing in Renaissance',
    [],
    ['polyphony', 'renaissance', 'harmony']
  ),
  createNode(
    'mus-medici-patronage-1450',
    'Medici Patronage of Music',
    'Music',
    1450,
    false,
    'event',
    'Medici family becomes major patron of musical arts',
    ['Medici family'],
    ['patronage', 'music', 'florence']
  ),
];

// Add relationships
florenceNodes.forEach(node => {
  // Find predecessors (earlier nodes in same vine)
  const sameVine = florenceNodes.filter(n => n.vine === node.vine && n.time_height < node.time_height);
  if (sameVine.length > 0) {
    // Connect to most recent predecessor
    const latestPredecessor = sameVine.reduce((prev, curr) => 
      curr.time_height > prev.time_height ? curr : prev
    );
    node.predecessors.push(latestPredecessor.id);
  }
  
  // Find successors (later nodes in same vine)
  const laterSameVine = florenceNodes.filter(n => n.vine === node.vine && n.time_height > node.time_height);
  if (laterSameVine.length > 0) {
    // Connect to earliest successor
    const earliestSuccessor = laterSameVine.reduce((prev, curr) => 
      curr.time_height < prev.time_height ? curr : prev
    );
    node.successors.push(earliestSuccessor.id);
  }
  
  // Find cross-links (same time, different vine)
  // Florence braid: nodes around 1450-1513
  const florenceTimeRange = { min: 1430, max: 1520 };
  const nodeYear = Math.abs(node.time_height);
  if (nodeYear >= florenceTimeRange.min && nodeYear <= florenceTimeRange.max) {
    const contemporaries = florenceNodes.filter(n => 
      n.id !== node.id && 
      n.vine !== node.vine &&
      Math.abs(n.time_height) >= florenceTimeRange.min &&
      Math.abs(n.time_height) <= florenceTimeRange.max
    );
    node.cross_links = contemporaries.map(n => n.id);
  }
});

// Create connections
export const florenceConnections: NodeConnection[] = [];

florenceNodes.forEach(node => {
  // Predecessor connections
  node.predecessors.forEach(predId => {
    florenceConnections.push({
      id: `conn-${predId}-${node.id}`,
      from_node_id: predId,
      to_node_id: node.id,
      connection_type: 'predecessor',
      strength: 0.8,
    });
  });
  
  // Successor connections
  node.successors.forEach(succId => {
    florenceConnections.push({
      id: `conn-${node.id}-${succId}`,
      from_node_id: node.id,
      to_node_id: succId,
      connection_type: 'successor',
      strength: 0.8,
    });
  });
  
  // Cross-link connections
  node.cross_links.forEach(crossId => {
    florenceConnections.push({
      id: `cross-${node.id}-${crossId}`,
      from_node_id: node.id,
      to_node_id: crossId,
      connection_type: 'cross_link',
      strength: 0.6,
    });
  });
});

// Create braid
export const florenceBraid: Braid = {
  id: 'braid-florence-1500',
  name: 'Florence c. 1500',
  time_height: 1500,
  temporal_band: 'EarlyModern',
  node_ids: florenceNodes
    .filter(n => {
      const year = Math.abs(n.time_height);
      return year >= 1430 && year <= 1520;
    })
    .map(n => n.id),
  vines: ['History', 'Art', 'Science', 'Literature', 'Music'],
  intensity: 0.9,
  description: 'The Florentine Renaissance: a moment of intense cross-disciplinary creativity where art, science, literature, and politics intertwined.',
};

export const sampleArborTemporis = {
  nodes: florenceNodes,
  connections: florenceConnections,
  braids: [florenceBraid],
};
