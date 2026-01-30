// Comprehensive Arbor Temporis dataset - Representative works across all time periods
import type { ArborNode, Braid, NodeConnection } from '../types/arbor-temporis';
import { yearToTimeHeight, getTemporalBand } from '../types/arbor-temporis';

// Helper to create nodes (no person nodes - only works, events, ideas, movements, technologies)
function createNode(
  id: string,
  title: string,
  vine: 'History' | 'Music' | 'Art' | 'Literature' | 'Science',
  year: number,
  isBCE: boolean = false,
  nodeType: 'event' | 'work' | 'idea' | 'movement' | 'technology' | 'rupture' | 'cycle' = 'work',
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
    date_approximate: isBCE ? `${year} BCE` : `c. ${year}`,
    description,
    creators,
    tags,
    predecessors: [],
    successors: [],
    cross_links: [],
  };
}

// ============================================================================
// HISTORY VINE
// ============================================================================
const historyNodes: ArborNode[] = [
  // Ancient
  createNode('hist-code-hammurabi', 'Code of Hammurabi', 'History', 1750, true, 'work', 'First known written legal code', ['Hammurabi'], ['law', 'mesopotamia', 'ancient']),
  createNode('hist-egypt-unification', 'Unification of Egypt', 'History', 3100, true, 'event', 'Upper and Lower Egypt unified under first pharaoh', [], ['egypt', 'ancient', 'politics']),
  createNode('hist-trojan-war', 'Trojan War', 'History', 1200, true, 'event', 'Legendary conflict between Greeks and Trojans', [], ['greece', 'war', 'myth']),
  createNode('hist-roman-republic', 'Founding of Roman Republic', 'History', 509, true, 'event', 'Overthrow of Roman monarchy, establishment of republic', [], ['rome', 'politics', 'republic']),
  createNode('hist-alexander-conquest', 'Alexander\'s Conquests', 'History', 334, true, 'event', 'Alexander the Great begins conquest of Persian Empire', [], ['greece', 'war', 'empire']),
  createNode('hist-hannibal-alps', 'Hannibal Crosses Alps', 'History', 218, true, 'event', 'Carthaginian general invades Italy during Second Punic War', [], ['carthage', 'rome', 'war']),
  createNode('hist-caesar-assassination', 'Assassination of Julius Caesar', 'History', 44, true, 'rupture', 'Death of Caesar marks end of Roman Republic', [], ['rome', 'politics', 'assassination']),
  createNode('hist-fall-rome', 'Fall of Western Roman Empire', 'History', 476, false, 'rupture', 'End of ancient Roman civilization in the West', [], ['rome', 'empire', 'decline']),
  
  // Medieval
  createNode('hist-charlie-crowned', 'Charlemagne Crowned Emperor', 'History', 800, false, 'event', 'First Holy Roman Emperor, unifies Western Europe', [], ['france', 'empire', 'medieval']),
  createNode('hist-norman-conquest', 'Norman Conquest of England', 'History', 1066, false, 'event', 'William the Conqueror defeats Harold at Hastings', [], ['england', 'france', 'war']),
  createNode('hist-magna-carta', 'Magna Carta', 'History', 1215, false, 'work', 'Charter limiting royal power, foundation of constitutional law', [], ['england', 'law', 'rights']),
  createNode('hist-black-death', 'Black Death', 'History', 1347, false, 'rupture', 'Plague devastates Europe, kills one-third of population', [], ['disease', 'medieval', 'crisis']),
  createNode('hist-constantinople-fall', 'Fall of Constantinople', 'History', 1453, false, 'rupture', 'Ottoman conquest ends Byzantine Empire', [], ['ottoman', 'byzantine', 'empire']),
  
  // Early Modern
  createNode('hist-columbus-americas', 'Columbus Reaches Americas', 'History', 1492, false, 'rupture', 'European discovery of New World begins age of exploration', [], ['exploration', 'americas', 'columbus']),
  createNode('hist-luther-95-theses', '95 Theses', 'History', 1517, false, 'rupture', 'Martin Luther\'s protest sparks Protestant Reformation', [], ['reformation', 'religion', 'germany']),
  createNode('hist-english-reformation', 'English Reformation', 'History', 1534, false, 'event', 'Henry VIII breaks with Catholic Church', [], ['england', 'reformation', 'politics']),
  createNode('hist-american-revolution', 'American Revolution', 'History', 1776, false, 'rupture', 'Thirteen colonies declare independence from Britain', [], ['america', 'revolution', 'independence']),
  createNode('hist-french-revolution', 'French Revolution', 'History', 1789, false, 'rupture', 'Overthrow of monarchy, birth of modern democracy', [], ['france', 'revolution', 'democracy']),
  createNode('hist-napoleon-coronation', 'Napoleon Crowned Emperor', 'History', 1804, false, 'event', 'Napoleon Bonaparte becomes Emperor of France', [], ['france', 'empire', 'napoleon']),
  
  // Industrial
  createNode('hist-congress-vienna', 'Congress of Vienna', 'History', 1815, false, 'event', 'Post-Napoleonic peace settlement reshapes Europe', [], ['europe', 'diplomacy', 'peace']),
  createNode('hist-1848-revolutions', 'Revolutions of 1848', 'History', 1848, false, 'rupture', 'Wave of liberal revolutions across Europe', [], ['europe', 'revolution', 'liberalism']),
  createNode('hist-american-civil-war', 'American Civil War', 'History', 1861, false, 'rupture', 'Conflict over slavery divides United States', [], ['america', 'war', 'slavery']),
  createNode('hist-german-unification', 'German Unification', 'History', 1871, false, 'event', 'Prussia unifies German states into empire', [], ['germany', 'unification', 'empire']),
  createNode('hist-scramble-africa', 'Scramble for Africa', 'History', 1884, false, 'event', 'European powers partition African continent', [], ['africa', 'imperialism', 'colonialism']),
  
  // Modern
  createNode('hist-ww1', 'World War I', 'History', 1914, false, 'rupture', 'Global conflict reshapes world order', [], ['war', 'global', 'crisis']),
  createNode('hist-russian-revolution', 'Russian Revolution', 'History', 1917, false, 'rupture', 'Bolsheviks overthrow tsar, establish Soviet Union', [], ['russia', 'revolution', 'communism']),
  createNode('hist-ww2', 'World War II', 'History', 1939, false, 'rupture', 'Deadliest conflict in human history', [], ['war', 'global', 'holocaust']),
  createNode('hist-holocaust', 'The Holocaust', 'History', 1941, false, 'rupture', 'Systematic genocide of six million Jews', [], ['genocide', 'nazi', 'tragedy']),
  createNode('hist-hiroshima', 'Atomic Bombing of Hiroshima', 'History', 1945, false, 'rupture', 'First use of nuclear weapon in warfare', [], ['war', 'nuclear', 'japan']),
  createNode('hist-un-founded', 'United Nations Founded', 'History', 1945, false, 'event', 'International organization for peace and cooperation', [], ['diplomacy', 'global', 'peace']),
  createNode('hist-berlin-wall', 'Berlin Wall Built', 'History', 1961, false, 'event', 'Division of East and West Germany', [], ['germany', 'cold-war', 'division']),
  createNode('hist-cuban-missile', 'Cuban Missile Crisis', 'History', 1962, false, 'event', 'Nuclear standoff between US and USSR', [], ['cold-war', 'nuclear', 'cuba']),
  createNode('hist-apollo-11', 'Apollo 11 Moon Landing', 'History', 1969, false, 'event', 'First humans land on the Moon', [], ['space', 'technology', 'achievement']),
  createNode('hist-berlin-wall-fall', 'Fall of Berlin Wall', 'History', 1989, false, 'rupture', 'Symbolic end of Cold War division', [], ['germany', 'cold-war', 'reunification']),
  createNode('hist-soviet-collapse', 'Collapse of Soviet Union', 'History', 1991, false, 'rupture', 'End of Cold War, dissolution of USSR', [], ['russia', 'cold-war', 'politics']),
  
  // Contemporary
  createNode('hist-9-11', 'September 11 Attacks', 'History', 2001, false, 'rupture', 'Terrorist attacks on United States', [], ['terrorism', 'america', 'crisis']),
  createNode('hist-arab-spring', 'Arab Spring', 'History', 2010, false, 'rupture', 'Wave of pro-democracy protests across Middle East', [], ['middle-east', 'revolution', 'democracy']),
];

// ============================================================================
// MUSIC VINE
// ============================================================================
const musicNodes: ArborNode[] = [
  // Ancient
  createNode('mus-pythagorean-tuning', 'Pythagorean Tuning', 'Music', 500, true, 'idea', 'Mathematical system for musical intervals', ['Pythagoras'], ['theory', 'mathematics', 'ancient']),
  createNode('mus-gregorian-chant', 'Gregorian Chant', 'Music', 600, false, 'movement', 'Monophonic liturgical music of Catholic Church', [], ['liturgical', 'medieval', 'monophony']),
  
  // Medieval
  createNode('mus-organum', 'Organum', 'Music', 900, false, 'movement', 'Early polyphonic music, multiple voices', [], ['polyphony', 'medieval', 'harmony']),
  createNode('mus-ars-nova', 'Ars Nova', 'Music', 1320, false, 'movement', 'New musical style with complex rhythms', [], ['medieval', 'rhythm', 'innovation']),
  
  // Early Modern
  createNode('mus-renaissance-polyphony', 'Renaissance Polyphony', 'Music', 1400, false, 'movement', 'Complex multi-voice musical style', [], ['polyphony', 'renaissance', 'harmony']),
  createNode('mus-monteverdi-orfeo', 'L\'Orfeo', 'Music', 1607, false, 'work', 'First great opera by Monteverdi', ['Claudio Monteverdi'], ['opera', 'baroque', 'italy']),
  createNode('mus-bach-well-tempered', 'The Well-Tempered Clavier', 'Music', 1722, false, 'work', 'Bach\'s collection demonstrating equal temperament', ['Johann Sebastian Bach'], ['baroque', 'keyboard', 'theory']),
  createNode('mus-handel-messiah', 'Messiah', 'Music', 1741, false, 'work', 'Handel\'s oratorio, most performed choral work', ['George Frideric Handel'], ['oratorio', 'baroque', 'choral']),
  createNode('mus-mozart-magic-flute', 'The Magic Flute', 'Music', 1791, false, 'work', 'Mozart\'s final opera, synthesis of styles', ['Wolfgang Amadeus Mozart'], ['opera', 'classical', 'austria']),
  createNode('mus-beethoven-9th', 'Symphony No. 9', 'Music', 1824, false, 'work', 'Beethoven\'s choral symphony, revolutionary form', ['Ludwig van Beethoven'], ['symphony', 'romantic', 'choral']),
  
  // Industrial
  createNode('mus-wagner-ring', 'The Ring Cycle', 'Music', 1876, false, 'work', 'Wagner\'s four-opera epic, Gesamtkunstwerk', ['Richard Wagner'], ['opera', 'romantic', 'germany']),
  createNode('mus-stravinsky-rite', 'The Rite of Spring', 'Music', 1913, false, 'rupture', 'Stravinsky\'s ballet, modernism in music', ['Igor Stravinsky'], ['modern', 'ballet', 'primitivism']),
  createNode('mus-schoenberg-pierrot', 'Pierrot Lunaire', 'Music', 1912, false, 'rupture', 'Schoenberg introduces atonality', ['Arnold Schoenberg'], ['atonality', 'modern', 'expressionism']),
  createNode('mus-gershwin-rhapsody', 'Rhapsody in Blue', 'Music', 1924, false, 'work', 'Gershwin fuses jazz and classical', ['George Gershwin'], ['jazz', 'classical', 'america']),
  
  // Modern
  createNode('mus-armstrong-hello', 'Hello, Dolly!', 'Music', 1964, false, 'work', 'Louis Armstrong\'s jazz standard', ['Louis Armstrong'], ['jazz', 'popular', 'america']),
  createNode('mus-beatles-sgt-pepper', 'Sgt. Pepper\'s Lonely Hearts Club Band', 'Music', 1967, false, 'work', 'Beatles\' concept album, pop art masterpiece', ['The Beatles'], ['rock', 'pop', 'concept-album']),
  createNode('mus-queen-bohemian', 'Bohemian Rhapsody', 'Music', 1975, false, 'work', 'Queen\'s operatic rock fusion', ['Queen'], ['rock', 'opera', 'progressive']),
  createNode('mus-thriller', 'Thriller', 'Music', 1982, false, 'work', 'Michael Jackson\'s best-selling album', ['Michael Jackson'], ['pop', 'dance', 'america']),
  
  // Contemporary
  createNode('mus-ok-computer', 'OK Computer', 'Music', 1997, false, 'work', 'Radiohead\'s electronic rock masterpiece', ['Radiohead'], ['rock', 'electronic', 'concept']),
  createNode('mus-streaming-revolution', 'Music Streaming Revolution', 'Music', 2008, false, 'technology', 'Spotify launches, transforms music distribution', [], ['technology', 'digital', 'distribution']),
];

// ============================================================================
// ART VINE
// ============================================================================
const artNodes: ArborNode[] = [
  // Ancient
  createNode('art-venus-willendorf', 'Venus of Willendorf', 'Art', 25000, true, 'work', 'Paleolithic fertility figurine', [], ['sculpture', 'paleolithic', 'fertility']),
  createNode('art-lascaux-caves', 'Lascaux Cave Paintings', 'Art', 15000, true, 'work', 'Prehistoric cave art in France', [], ['cave-art', 'paleolithic', 'france']),
  createNode('art-great-pyramid', 'Great Pyramid of Giza', 'Art', 2560, true, 'work', 'Largest pyramid, architectural wonder', [], ['architecture', 'egypt', 'ancient']),
  createNode('art-parthenon', 'Parthenon', 'Art', 438, true, 'work', 'Temple of Athena, peak of Greek architecture', [], ['architecture', 'greece', 'classical']),
  createNode('art-venus-de-milo', 'Venus de Milo', 'Art', 130, true, 'work', 'Hellenistic marble sculpture', [], ['sculpture', 'greece', 'hellenistic']),
  
  // Medieval
  createNode('art-hagia-sophia', 'Hagia Sophia', 'Art', 537, false, 'work', 'Byzantine cathedral, architectural marvel', [], ['architecture', 'byzantine', 'istanbul']),
  createNode('art-bayeux-tapestry', 'Bayeux Tapestry', 'Art', 1070, false, 'work', 'Norman conquest depicted in embroidery', [], ['textile', 'medieval', 'narrative']),
  createNode('art-notre-dame', 'Notre-Dame de Paris', 'Art', 1345, false, 'work', 'Gothic cathedral, architectural masterpiece', [], ['architecture', 'gothic', 'france']),
  
  // Early Modern
  createNode('art-birth-of-venus', 'The Birth of Venus', 'Art', 1485, false, 'work', 'Botticelli\'s Renaissance masterpiece', ['Sandro Botticelli'], ['painting', 'renaissance', 'mythology']),
  createNode('art-mona-lisa', 'Mona Lisa', 'Art', 1503, false, 'work', 'Leonardo\'s portrait, most famous painting', ['Leonardo da Vinci'], ['painting', 'renaissance', 'portrait']),
  createNode('art-david', 'David', 'Art', 1501, false, 'work', 'Michelangelo\'s marble sculpture', ['Michelangelo'], ['sculpture', 'renaissance', 'marble']),
  createNode('art-sistine-ceiling', 'Sistine Chapel Ceiling', 'Art', 1508, false, 'work', 'Michelangelo\'s fresco cycle', ['Michelangelo'], ['fresco', 'renaissance', 'religious']),
  createNode('art-las-meninas', 'Las Meninas', 'Art', 1656, false, 'work', 'Velázquez\'s complex perspective painting', ['Diego Velázquez'], ['painting', 'baroque', 'spain']),
  createNode('art-girl-pearl-earring', 'Girl with a Pearl Earring', 'Art', 1665, false, 'work', 'Vermeer\'s luminous portrait', ['Johannes Vermeer'], ['painting', 'baroque', 'dutch']),
  
  // Industrial
  createNode('art-liberty-leading', 'Liberty Leading the People', 'Art', 1830, false, 'work', 'Delacroix\'s Romantic revolutionary painting', ['Eugène Delacroix'], ['painting', 'romantic', 'revolution']),
  createNode('art-impression-sunrise', 'Impression, Sunrise', 'Art', 1872, false, 'rupture', 'Monet\'s painting gives name to Impressionism', ['Claude Monet'], ['painting', 'impressionism', 'france']),
  createNode('art-starry-night', 'The Starry Night', 'Art', 1889, false, 'work', 'Van Gogh\'s post-impressionist masterpiece', ['Vincent van Gogh'], ['painting', 'post-impressionism', 'expression']),
  createNode('art-scream', 'The Scream', 'Art', 1893, false, 'work', 'Munch\'s expressionist icon', ['Edvard Munch'], ['painting', 'expressionism', 'emotion']),
  createNode('art-les-demoiselles', 'Les Demoiselles d\'Avignon', 'Art', 1907, false, 'rupture', 'Picasso\'s proto-Cubist painting', ['Pablo Picasso'], ['painting', 'cubism', 'modern']),
  
  // Modern
  createNode('art-guernica', 'Guernica', 'Art', 1937, false, 'work', 'Picasso\'s anti-war masterpiece', ['Pablo Picasso'], ['painting', 'cubism', 'protest']),
  createNode('art-campbell-soup', 'Campbell\'s Soup Cans', 'Art', 1962, false, 'rupture', 'Warhol\'s Pop Art statement', ['Andy Warhol'], ['painting', 'pop-art', 'america']),
  createNode('art-fountain', 'Fountain', 'Art', 1917, false, 'rupture', 'Duchamp\'s readymade, conceptual art', ['Marcel Duchamp'], ['sculpture', 'dada', 'conceptual']),
  
  // Contemporary
  createNode('art-balloon-dog', 'Balloon Dog', 'Art', 1994, false, 'work', 'Koons\' stainless steel sculpture', ['Jeff Koons'], ['sculpture', 'contemporary', 'pop']),
  createNode('art-digital-art', 'Digital Art Movement', 'Art', 2000, false, 'movement', 'Art created with digital technology', [], ['digital', 'technology', 'contemporary']),
];

// ============================================================================
// LITERATURE VINE
// ============================================================================
const literatureNodes: ArborNode[] = [
  // Ancient
  createNode('lit-epic-gilgamesh', 'Epic of Gilgamesh', 'Literature', 2100, true, 'work', 'Oldest known epic poem', [], ['epic', 'mesopotamia', 'ancient']),
  createNode('lit-iliad', 'The Iliad', 'Literature', 800, true, 'work', 'Homer\'s epic of the Trojan War', ['Homer'], ['epic', 'greece', 'poetry']),
  createNode('lit-odyssey', 'The Odyssey', 'Literature', 800, true, 'work', 'Homer\'s epic of Odysseus\' journey', ['Homer'], ['epic', 'greece', 'poetry']),
  createNode('lit-oresteia', 'The Oresteia', 'Literature', 458, true, 'work', 'Aeschylus\' tragic trilogy', ['Aeschylus'], ['tragedy', 'greece', 'drama']),
  createNode('lit-aeneid', 'The Aeneid', 'Literature', 19, true, 'work', 'Virgil\'s epic of Aeneas', ['Virgil'], ['epic', 'rome', 'poetry']),
  createNode('lit-metamorphoses', 'Metamorphoses', 'Literature', 8, true, 'work', 'Ovid\'s epic poem of transformations', ['Ovid'], ['epic', 'rome', 'mythology']),
  
  // Medieval
  createNode('lit-beowulf', 'Beowulf', 'Literature', 1000, false, 'work', 'Old English epic poem', [], ['epic', 'anglo-saxon', 'medieval']),
  createNode('lit-divine-comedy', 'The Divine Comedy', 'Literature', 1320, false, 'work', 'Dante\'s epic journey through afterlife', ['Dante Alighieri'], ['epic', 'italy', 'medieval']),
  createNode('lit-canterbury-tales', 'The Canterbury Tales', 'Literature', 1400, false, 'work', 'Chaucer\'s collection of stories', ['Geoffrey Chaucer'], ['narrative', 'england', 'medieval']),
  
  // Early Modern
  createNode('lit-prince', 'The Prince', 'Literature', 1513, false, 'work', 'Machiavelli\'s treatise on power', ['Niccolò Machiavelli'], ['philosophy', 'politics', 'italy']),
  createNode('lit-don-quixote', 'Don Quixote', 'Literature', 1605, false, 'work', 'Cervantes\' novel, birth of modern fiction', ['Miguel de Cervantes'], ['novel', 'spain', 'satire']),
  createNode('lit-hamlet', 'Hamlet', 'Literature', 1600, false, 'work', 'Shakespeare\'s tragedy of indecision', ['William Shakespeare'], ['drama', 'england', 'tragedy']),
  createNode('lit-paradise-lost', 'Paradise Lost', 'Literature', 1667, false, 'work', 'Milton\'s epic poem of fall of man', ['John Milton'], ['epic', 'england', 'religious']),
  createNode('lit-robinson-crusoe', 'Robinson Crusoe', 'Literature', 1719, false, 'work', 'Defoe\'s novel, first English novel', ['Daniel Defoe'], ['novel', 'england', 'adventure']),
  createNode('lit-candide', 'Candide', 'Literature', 1759, false, 'work', 'Voltaire\'s satirical novella', ['Voltaire'], ['satire', 'france', 'philosophy']),
  
  // Industrial
  createNode('lit-frankenstein', 'Frankenstein', 'Literature', 1818, false, 'work', 'Shelley\'s gothic science fiction', ['Mary Shelley'], ['novel', 'gothic', 'science-fiction']),
  createNode('lit-moby-dick', 'Moby-Dick', 'Literature', 1851, false, 'work', 'Melville\'s epic of obsession', ['Herman Melville'], ['novel', 'america', 'epic']),
  createNode('lit-les-miserables', 'Les Misérables', 'Literature', 1862, false, 'work', 'Hugo\'s epic of social justice', ['Victor Hugo'], ['novel', 'france', 'social']),
  createNode('lit-war-and-peace', 'War and Peace', 'Literature', 1869, false, 'work', 'Tolstoy\'s epic of Russian society', ['Leo Tolstoy'], ['novel', 'russia', 'epic']),
  createNode('lit-ulysses', 'Ulysses', 'Literature', 1922, false, 'rupture', 'Joyce\'s stream-of-consciousness novel', ['James Joyce'], ['novel', 'ireland', 'modernism']),
  
  // Modern
  createNode('lit-1984', '1984', 'Literature', 1949, false, 'work', 'Orwell\'s dystopian novel', ['George Orwell'], ['novel', 'dystopia', 'political']),
  createNode('lit-lolita', 'Lolita', 'Literature', 1955, false, 'work', 'Nabokov\'s controversial masterpiece', ['Vladimir Nabokov'], ['novel', 'america', 'controversial']),
  createNode('lit-one-hundred-years', 'One Hundred Years of Solitude', 'Literature', 1967, false, 'work', 'García Márquez\'s magical realism', ['Gabriel García Márquez'], ['novel', 'colombia', 'magical-realism']),
  
  // Contemporary
  createNode('lit-harry-potter', 'Harry Potter Series', 'Literature', 1997, false, 'work', 'Rowling\'s fantasy phenomenon', ['J.K. Rowling'], ['novel', 'fantasy', 'young-adult']),
  createNode('lit-ebook-revolution', 'E-Book Revolution', 'Literature', 2007, false, 'technology', 'Kindle launches, transforms reading', [], ['technology', 'digital', 'publishing']),
];

// ============================================================================
// SCIENCE VINE
// ============================================================================
const scienceNodes: ArborNode[] = [
  // Ancient
  createNode('sci-euclid-elements', 'Elements', 'Science', 300, true, 'work', 'Euclid\'s foundational geometry text', ['Euclid'], ['mathematics', 'geometry', 'greece']),
  createNode('sci-archimedes-principle', 'Archimedes\' Principle', 'Science', 250, true, 'idea', 'Discovery of buoyancy principle', ['Archimedes'], ['physics', 'greece', 'hydrostatics']),
  createNode('sci-ptolemy-almagest', 'Almagest', 'Science', 150, true, 'work', 'Ptolemy\'s geocentric model of universe', ['Ptolemy'], ['astronomy', 'greece', 'cosmology']),
  
  // Medieval
  createNode('sci-perspective-theory', 'Perspective Theory', 'Science', 1435, false, 'idea', 'Alberti\'s mathematical system for 3D representation', ['Leon Battista Alberti'], ['mathematics', 'optics', 'art']),
  createNode('sci-copernicus-revolution', 'On the Revolutions', 'Science', 1543, false, 'rupture', 'Copernicus proposes heliocentric model', ['Nicolaus Copernicus'], ['astronomy', 'poland', 'revolution']),
  
  // Early Modern
  createNode('sci-kepler-laws', 'Kepler\'s Laws of Planetary Motion', 'Science', 1609, false, 'idea', 'Mathematical description of planetary orbits', ['Johannes Kepler'], ['astronomy', 'germany', 'mathematics']),
  createNode('sci-galileo-telescope', 'Galileo\'s Telescope Observations', 'Science', 1610, false, 'work', 'First telescopic observations of heavens', ['Galileo Galilei'], ['astronomy', 'italy', 'observation']),
  createNode('sci-newton-principia', 'Principia Mathematica', 'Science', 1687, false, 'rupture', 'Newton\'s laws of motion and gravity', ['Isaac Newton'], ['physics', 'england', 'revolution']),
  createNode('sci-lavoisier-oxygen', 'Discovery of Oxygen', 'Science', 1774, false, 'idea', 'Lavoisier identifies oxygen, modern chemistry', ['Antoine Lavoisier'], ['chemistry', 'france', 'revolution']),
  
  // Industrial
  createNode('sci-darwin-origin', 'On the Origin of Species', 'Science', 1859, false, 'rupture', 'Darwin\'s theory of evolution', ['Charles Darwin'], ['biology', 'england', 'revolution']),
  createNode('sci-mendel-genetics', 'Mendel\'s Laws of Inheritance', 'Science', 1865, false, 'idea', 'Foundation of modern genetics', ['Gregor Mendel'], ['biology', 'genetics', 'austria']),
  createNode('sci-mendeleev-periodic', 'Periodic Table', 'Science', 1869, false, 'work', 'Mendeleev organizes chemical elements', ['Dmitri Mendeleev'], ['chemistry', 'russia', 'organization']),
  createNode('sci-einstein-relativity', 'Theory of Relativity', 'Science', 1905, false, 'rupture', 'Einstein revolutionizes physics', ['Albert Einstein'], ['physics', 'germany', 'revolution']),
  createNode('sci-quantum-mechanics', 'Quantum Mechanics', 'Science', 1925, false, 'rupture', 'Heisenberg and Schrödinger develop quantum theory', [], ['physics', 'germany', 'revolution']),
  
  // Modern
  createNode('sci-dna-structure', 'DNA Double Helix', 'Science', 1953, false, 'rupture', 'Watson and Crick discover DNA structure', ['James Watson', 'Francis Crick'], ['biology', 'genetics', 'molecular']),
  createNode('sci-big-bang', 'Big Bang Theory', 'Science', 1965, false, 'idea', 'Cosmic microwave background confirms Big Bang', [], ['astronomy', 'cosmology', 'physics']),
  createNode('sci-internet', 'Internet', 'Science', 1969, false, 'technology', 'ARPANET, foundation of modern internet', [], ['technology', 'networking', 'communication']),
  
  // Contemporary
  createNode('sci-human-genome', 'Human Genome Project', 'Science', 2003, false, 'work', 'Complete mapping of human DNA', [], ['biology', 'genetics', 'mapping']),
  createNode('sci-crispr', 'CRISPR Gene Editing', 'Science', 2012, false, 'technology', 'Revolutionary gene editing technology', [], ['biology', 'genetics', 'technology']),
];

// ============================================================================
// COMBINE ALL NODES
// ============================================================================
export const allNodes: ArborNode[] = [
  ...historyNodes,
  ...musicNodes,
  ...artNodes,
  ...literatureNodes,
  ...scienceNodes,
];

// ============================================================================
// BUILD RELATIONSHIPS
// ============================================================================
// Build predecessor/successor relationships within each vine
allNodes.forEach(node => {
  // Find predecessors (earlier nodes in same vine)
  const sameVine = allNodes.filter(n => 
    n.vine === node.vine && 
    n.time_height < node.time_height
  );
  if (sameVine.length > 0) {
    // Connect to most recent predecessor
    const latestPredecessor = sameVine.reduce((prev, curr) => 
      curr.time_height > prev.time_height ? curr : prev
    );
    node.predecessors.push(latestPredecessor.id);
  }
  
  // Find successors (later nodes in same vine)
  const laterSameVine = allNodes.filter(n => 
    n.vine === node.vine && 
    n.time_height > node.time_height
  );
  if (laterSameVine.length > 0) {
    // Connect to earliest successor
    const earliestSuccessor = laterSameVine.reduce((prev, curr) => 
      curr.time_height < prev.time_height ? curr : prev
    );
    node.successors.push(earliestSuccessor.id);
  }
  
  // Find cross-links (same time period, different vine)
  // Define time windows for cross-linking (±50 years for ancient, ±25 for modern)
  const timeWindow = node.time_height < -1000 ? 100 : node.time_height < 0 ? 50 : 25;
  const contemporaries = allNodes.filter(n => 
    n.id !== node.id && 
    n.vine !== node.vine &&
    Math.abs(n.time_height - node.time_height) <= timeWindow
  );
  node.cross_links = contemporaries.map(n => n.id);
});

// ============================================================================
// CREATE CONNECTIONS
// ============================================================================
export const allConnections: NodeConnection[] = [];

allNodes.forEach(node => {
  // Predecessor connections
  node.predecessors.forEach(predId => {
    allConnections.push({
      id: `conn-${predId}-${node.id}`,
      from_node_id: predId,
      to_node_id: node.id,
      connection_type: 'predecessor',
      strength: 0.8,
    });
  });
  
  // Successor connections
  node.successors.forEach(succId => {
    allConnections.push({
      id: `conn-${node.id}-${succId}`,
      from_node_id: node.id,
      to_node_id: succId,
      connection_type: 'successor',
      strength: 0.8,
    });
  });
  
  // Cross-link connections (limit to avoid clutter)
  node.cross_links.slice(0, 3).forEach(crossId => {
    allConnections.push({
      id: `cross-${node.id}-${crossId}`,
      from_node_id: node.id,
      to_node_id: crossId,
      connection_type: 'cross_link',
      strength: 0.6,
    });
  });
});

// ============================================================================
// CREATE BRAIDS (Cross-vine entanglements)
// ============================================================================
export const allBraids: Braid[] = [
  {
    id: 'braid-renaissance',
    name: 'Italian Renaissance',
    time_height: 1500,
    temporal_band: 'EarlyModern',
    node_ids: allNodes
      .filter(n => {
        const year = Math.abs(n.time_height);
        return year >= 1400 && year <= 1600 && 
               (n.id.includes('art-') || n.id.includes('lit-') || n.id.includes('sci-') || n.id.includes('mus-'));
      })
      .map(n => n.id),
    vines: ['Art', 'Literature', 'Science', 'Music'],
    intensity: 0.9,
    description: 'Florentine Renaissance: art, science, literature, and music intertwine',
  },
  {
    id: 'braid-enlightenment',
    name: 'The Enlightenment',
    time_height: 1750,
    temporal_band: 'EarlyModern',
    node_ids: allNodes
      .filter(n => {
        const year = Math.abs(n.time_height);
        return year >= 1680 && year <= 1800;
      })
      .map(n => n.id),
    vines: ['History', 'Literature', 'Science'],
    intensity: 0.8,
    description: 'Age of reason: scientific revolution, political philosophy, and literature',
  },
  {
    id: 'braid-romantic',
    name: 'Romantic Era',
    time_height: 1820,
    temporal_band: 'Industrial',
    node_ids: allNodes
      .filter(n => {
        const year = Math.abs(n.time_height);
        return year >= 1780 && year <= 1850;
      })
      .map(n => n.id),
    vines: ['Music', 'Art', 'Literature'],
    intensity: 0.8,
    description: 'Romantic movement across arts: emotion, nature, and individual expression',
  },
  {
    id: 'braid-modernism',
    name: 'Modernism',
    time_height: 1920,
    temporal_band: 'Modern',
    node_ids: allNodes
      .filter(n => {
        const year = Math.abs(n.time_height);
        return year >= 1900 && year <= 1940;
      })
      .map(n => n.id),
    vines: ['Art', 'Literature', 'Music', 'Science'],
    intensity: 0.9,
    description: 'Modernist revolution: breaking with tradition across all disciplines',
  },
];

// ============================================================================
// EXPORT
// ============================================================================
export const sampleArborTemporis = {
  nodes: allNodes,
  connections: allConnections,
  braids: allBraids,
};
