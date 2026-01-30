// Curated collection of PhD thesis topics
// This file contains a curated list of PhD thesis topics across various disciplines

import type { PhDThesisTopic, ThesisTopicCollection } from '../types/phd-thesis';
import { generateThesisTopicId } from '../types/phd-thesis';

// Initial curated thesis topics
const topics: PhDThesisTopic[] = [
  {
    id: generateThesisTopicId('Neural Oscillations and the Architecture of Inquiry', 'Buzsaki', 2024),
    title: 'Neural Oscillations and the Architecture of Inquiry',
    discipline: 'Biology',
    subdiscipline: 'Neuroscience',
    abstract: 'An exploration of how understanding neural rhythms and brain architecture informs our approach to inquiry-based learning and the structure of knowledge systems.',
    keywords: ['neural oscillations', 'brain architecture', 'inquiry-based learning', 'knowledge systems', 'cognitive science'],
    methodology: ['Experimental', 'Theoretical'],
    author: 'György Buzsáki',
    status: 'proposed',
    source: 'manual',
    tags: ['neuroscience', 'learning', 'cognitive architecture', 'rhythms'],
    difficulty: 'advanced',
    notes: 'Based on research by György Buzsáki on neural rhythms and brain architecture',
  },
  {
    id: generateThesisTopicId('The Dialectics of Historical Avatar Creation', 'Nietzsche', 2024),
    title: 'Beyond Good and Evil: The Dialectics of Historical Avatar Creation',
    discipline: 'Philosophy',
    subdiscipline: 'Ethics',
    abstract: 'A philosophical examination of the moral and ethical tensions in recreating historical figures as AI agents, questioning the boundaries between preservation and transformation of intellectual legacies.',
    keywords: ['AI ethics', 'historical avatars', 'digital humanities', 'philosophy of technology', 'identity'],
    methodology: ['Philosophical', 'Qualitative'],
    status: 'proposed',
    source: 'manual',
    tags: ['ethics', 'AI', 'digital humanities', 'historical consciousness'],
    difficulty: 'advanced',
  },
  {
    id: generateThesisTopicId('Physics Rules Out the Simulation Hypothesis', 'Tesla', 2024),
    title: 'Physics Rules Out the Simulation Hypothesis: Experimental Evidence and Theoretical Constraints',
    discipline: 'Physics',
    subdiscipline: 'Theoretical Physics',
    abstract: 'A contemplative physicist\'s examination of recent research that has ruled out the universe being a simulation, exploring the theoretical and empirical constraints that demonstrate why computational simulation cannot account for observed physical reality.',
    keywords: ['simulation hypothesis', 'quantum gravity', 'loop quantum gravity', 'computational limits', 'theoretical physics'],
    methodology: ['Theoretical', 'Computational'],
    status: 'proposed',
    source: 'manual',
    tags: ['physics', 'simulation hypothesis', 'quantum gravity', 'theoretical constraints'],
    difficulty: 'expert',
    links: [
      {
        title: 'Research on Loop Quantum Gravity Corrections',
        url: 'https://arxiv.org/abs/quant-ph/',
        type: 'paper',
      },
    ],
  },
  {
    id: generateThesisTopicId('The Mathematical Foundations of DAO Governance', 'Thales', 2024),
    title: 'The Mathematical Foundations of DAO Governance: From Geometry to Consensus',
    discipline: 'Mathematics',
    subdiscipline: 'Applied Mathematics',
    abstract: 'A dialectical analysis of how mathematical principles—from ancient geometry to modern cryptography—underpin decentralized autonomous organization and democratic governance structures.',
    keywords: ['DAO', 'governance', 'cryptography', 'consensus algorithms', 'mathematical foundations'],
    methodology: ['Theoretical', 'Computational'],
    status: 'proposed',
    source: 'manual',
    tags: ['mathematics', 'blockchain', 'governance', 'cryptography', 'consensus'],
    difficulty: 'advanced',
  },
  {
    id: generateThesisTopicId('The Republic of Inquiry: Platonic Ideals in Digital Academia', 'Plato', 2024),
    title: 'The Republic of Inquiry: Platonic Ideals in Digital Academia',
    discipline: 'Philosophy',
    subdiscipline: 'Political Philosophy',
    abstract: 'A philosophical dialogue on how Platonic ideals of justice, knowledge, and the good inform the structure and mission of the Inquiry Institute as a digital academy.',
    keywords: ['Plato', 'digital academy', 'justice', 'knowledge', 'ideals'],
    methodology: ['Philosophical', 'Historical'],
    status: 'proposed',
    source: 'manual',
    tags: ['philosophy', 'Plato', 'education', 'digital humanities'],
    difficulty: 'intermediate',
  },
  {
    id: generateThesisTopicId('Contemplative Mathematics: Number, Pattern, and the Structure of Inquiry', 'Hypatia', 2024),
    title: 'Contemplative Mathematics: Number, Pattern, and the Structure of Inquiry',
    discipline: 'Mathematics',
    subdiscipline: 'Pure Mathematics',
    abstract: 'A contemplative mathematician\'s reflection on how mathematical beauty and pattern recognition shape our understanding of inquiry, knowledge organization, and digital corpora.',
    keywords: ['mathematical beauty', 'pattern recognition', 'number theory', 'inquiry', 'knowledge organization'],
    methodology: ['Theoretical', 'Philosophical'],
    status: 'proposed',
    source: 'manual',
    tags: ['mathematics', 'beauty', 'patterns', 'philosophy of mathematics'],
    difficulty: 'advanced',
  },
  {
    id: generateThesisTopicId('The Analytical Engine of Inquiry: Computing Historical Consciousness', 'Lovelace', 2024),
    title: 'The Analytical Engine of Inquiry: Computing Historical Consciousness',
    discipline: 'Computer Science',
    subdiscipline: 'Artificial Intelligence',
    abstract: 'A contemplative computer scientist\'s exploration of how algorithmic thinking, data structures, and computational methods enable the coding and embodiment of historical avatars.',
    keywords: ['AI', 'historical avatars', 'algorithmic thinking', 'data structures', 'computational methods'],
    methodology: ['Computational', 'Theoretical'],
    status: 'proposed',
    source: 'manual',
    tags: ['computer science', 'AI', 'historical consciousness', 'algorithms'],
    difficulty: 'advanced',
  },
  {
    id: generateThesisTopicId('Radioactive Inquiry: The Discovery Process and Transformative Knowledge', 'Curie', 2024),
    title: 'Radioactive Inquiry: The Discovery Process and Transformative Knowledge',
    discipline: 'Chemistry',
    subdiscipline: 'Physical Chemistry',
    abstract: 'An experimental chemist\'s perspective on the process of discovery, the transformation of knowledge through inquiry, and how persistence and method illuminate new understandings.',
    keywords: ['radioactivity', 'discovery process', 'scientific method', 'transformation', 'inquiry'],
    methodology: ['Experimental', 'Historical'],
    status: 'proposed',
    source: 'manual',
    tags: ['chemistry', 'scientific discovery', 'methodology', 'history of science'],
    difficulty: 'intermediate',
  },
  {
    id: generateThesisTopicId('Civil Disobedience and Academic Freedom: The Practical Philosophy of the Institute', 'Thoreau', 2024),
    title: 'Civil Disobedience and Academic Freedom: The Practical Philosophy of the Institute',
    discipline: 'Literature',
    subdiscipline: 'American Literature',
    abstract: 'A pragmatic literary perspective on how principles of independence, self-reliance, and intellectual freedom guide the Institute\'s mission and DAO governance model.',
    keywords: ['civil disobedience', 'academic freedom', 'independence', 'self-reliance', 'governance'],
    methodology: ['Qualitative', 'Historical', 'Philosophical'],
    status: 'proposed',
    source: 'manual',
    tags: ['literature', 'philosophy', 'governance', 'freedom'],
    difficulty: 'intermediate',
  },
  {
    id: generateThesisTopicId('The Spiritual Dimension of Inquiry: Anthroposophy and the Digital Academy', 'Steiner', 2024),
    title: 'The Spiritual Dimension of Inquiry: Anthroposophy and the Digital Academy',
    discipline: 'Philosophy',
    subdiscipline: 'Contemplative Philosophy',
    abstract: 'A contemplative exploration of how Rudolf Steiner\'s anthroposophical principles inform the Institute\'s approach to inquiry, knowledge, and the digital embodiment of historical consciousness.',
    keywords: ['anthroposophy', 'spirituality', 'digital academy', 'inquiry', 'Steiner'],
    methodology: ['Philosophical', 'Qualitative'],
    status: 'proposed',
    source: 'manual',
    tags: ['philosophy', 'spirituality', 'education', 'contemplative'],
    difficulty: 'advanced',
  },
];

// Calculate statistics
function calculateStatistics(topics: PhDThesisTopic[]) {
  const by_discipline: Record<string, number> = {};
  const by_status: Record<string, number> = {};
  const by_methodology: Record<string, number> = {};

  topics.forEach((topic) => {
    // Count by discipline
    by_discipline[topic.discipline] = (by_discipline[topic.discipline] || 0) + 1;

    // Count by status
    by_status[topic.status] = (by_status[topic.status] || 0) + 1;

    // Count by methodology
    if (topic.methodology) {
      topic.methodology.forEach((method) => {
        by_methodology[method] = (by_methodology[method] || 0) + 1;
      });
    }
  });

  return {
    by_discipline: by_discipline as any,
    by_status: by_status as any,
    by_methodology: by_methodology as any,
  };
}

// Export the collection
export const phdThesisTopicCollection: ThesisTopicCollection = {
  metadata: {
    title: 'PhD Thesis Topics Collection',
    description: 'A curated collection of PhD thesis topics across various disciplines, with a focus on inquiry, knowledge systems, and interdisciplinary research.',
    version: '1.0.0',
    last_updated: new Date().toISOString(),
    total_topics: topics.length,
    curator: 'Inquiry Institute',
  },
  topics,
  statistics: calculateStatistics(topics),
};

// Export individual topics for convenience
export const allThesisTopics = topics;

// Helper functions for filtering
export function getTopicsByDiscipline(discipline: string): PhDThesisTopic[] {
  return topics.filter((topic) => topic.discipline === discipline);
}

export function getTopicsByStatus(status: string): PhDThesisTopic[] {
  return topics.filter((topic) => topic.status === status);
}

export function getTopicsByKeyword(keyword: string): PhDThesisTopic[] {
  const lowerKeyword = keyword.toLowerCase();
  return topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(lowerKeyword) ||
      topic.keywords.some((k) => k.toLowerCase().includes(lowerKeyword)) ||
      topic.tags.some((t) => t.toLowerCase().includes(lowerKeyword))
  );
}
