// Central game catalog for the RetroRevive web platform.
// Mirrors the authoritative Python registry (game_registry.py).
// IMPORTANT: statuses are honest — games marked "coming-soon" have no
// playable implementation yet and show no fake Play buttons.

export type GameStatus = "playable" | "coming-soon";
export type GameCategory = "strategy" | "puzzle" | "space";

export interface GameCatalogEntry {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  author: string;
  originalPublisher: string;
  category: GameCategory;
  categoryDisplay: string;
  status: GameStatus;
  modes: string[];
  description: string;
  rulesSummary: string;
  historicalProvenance: string;
  bookSource: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  accent: string; // theme accent color for cover art
  route: string | null; // playable route, null for coming-soon
}

export const GAMES: GameCatalogEntry[] = [
  {
    id: "hammurabi",
    title: "Rise of the Babylonian Empire",
    subtitle: "The Ancient Sumerian Kingdom Simulation — Reborn in 3D",
    year: 1978,
    author: "Doug Dyment (1968), David H. Ahl (1973/1978)",
    originalPublisher: "Creative Computing (Morristown, NJ)",
    category: "strategy",
    categoryDisplay: "Strategy & Simulation",
    status: "playable",
    modes: ["Classic 1978 Rules (3D)", "Enhanced Mode (Advisor, Weather, Buildings)"],
    description:
      "Rule ancient Babylon in full 3D. Allocate grain between feeding your citizens, planting seed, and trading land while managing droughts, floods, rat plagues, and population growth. Watch your city grow with real construction, animated citizens and a read-only Royal Advisor.",
    rulesSummary:
      "Each citizen needs 5 grain per season. Plots need seed grain. Land trades between 17 and 26 gold per acre. Starving over 45% of the population in one season triggers deposition. Weather (rain, drought, flood) alters every harvest.",
    historicalProvenance:
      "Derived from Doug Dyment's The Sumer Game (FOCAL, 1968), ported to BASIC by David H. Ahl in 101 BASIC Computer Games (1973). RetroRevive preserves the spirit of the original rules in an original 3D redesign.",
    bookSource: "BASIC Computer Games: Microcomputer Edition (1978), pp. 78-79.",
    tags: ["Simulation", "Resource Management", "Classic 1978", "Historical", "3D"],
    difficulty: "Intermediate",
    accent: "#d4a017",
    route: "/play/hammurabi",
  },
  {
    id: "23_matches",
    title: "23 Matches",
    subtitle: "The Classic Mathematical Nim Subtraction Game",
    year: 1978,
    author: "Bob Albrecht (1973), David H. Ahl (1978)",
    originalPublisher: "People's Computer Company / Creative Computing",
    category: "puzzle",
    categoryDisplay: "Puzzle & Logic",
    status: "playable",
    modes: ["Classic 1978 Mode (Albrecht AI)", "Master Mode (Optimal Modular AI)"],
    description:
      "The timeless strategy game of 23 matchsticks. You and the computer take turns removing 1, 2 or 3 matches. The player forced to take the last match loses. Can you discover the mathematical winning strategy?",
    rulesSummary:
      "23 matches start on the table. Each turn take 1, 2 or 3 matches (never more than remain). The player who takes the last match loses — misère Nim rules.",
    historicalProvenance:
      "Authored by Bob Albrecht at the People's Computer Company to teach modular arithmetic. Published in 101 BASIC Computer Games (1973) and republished in BASIC Computer Games (1978) as game #93.",
    bookSource: "BASIC Computer Games: Microcomputer Edition (1978), pp. 177-178.",
    tags: ["Puzzle", "Nim", "Mathematical", "Turn-Based", "Misère"],
    difficulty: "Beginner",
    accent: "#e0662a",
    route: "/play/23-matches",
  },
  {
    id: "lunar_lander",
    title: "Lunar Lander",
    subtitle: "Apollo 11 Lunar Module Descent Simulator",
    year: 1973,
    author: "Jim Storer (1969), David H. Ahl (1973)",
    originalPublisher: "DEC / Creative Computing",
    category: "space",
    categoryDisplay: "Strategy & Simulation",
    status: "coming-soon",
    modes: [],
    description:
      "Pilot the Apollo lunar excursion module safely to the moon's surface. Manage your fuel burn rate against lunar gravity to touch down at under 5 ft/sec.",
    rulesSummary:
      "Burn fuel every second to counteract gravity. Soft landing below 5 mph; high descent rates end in a crater.",
    historicalProvenance:
      "Created in 1969 by Lexington High School student Jim Storer; published in 101 BASIC Computer Games (1973).",
    bookSource: "BASIC Computer Games (1978), pp. 106-108.",
    tags: ["Space", "Physics", "Apollo"],
    difficulty: "Intermediate",
    accent: "#8fa8c8",
    route: null,
  },
  {
    id: "super_star_trek",
    title: "Super Star Trek",
    subtitle: "Tactical Deep Space Command Simulation",
    year: 1974,
    author: "Mike Mayfield (1971), David H. Ahl & Bob Leedom (1974)",
    originalPublisher: "Creative Computing",
    category: "space",
    categoryDisplay: "Adventure & Space",
    status: "coming-soon",
    modes: [],
    description:
      "Command the USS Enterprise across an 8x8 quadrant galaxy. Hunt Klingon warships, manage photon torpedoes, shields, and dock at starbases before stardates expire.",
    rulesSummary:
      "Navigate 64 quadrants. Balance energy between shields, phasers and warp engines. Neutralize all Klingon battlecruisers before time runs out.",
    historicalProvenance:
      "Originated on SDS Sigma 7 by Mike Mayfield in 1971; expanded into Super Star Trek by David H. Ahl and Bob Leedom in 1974.",
    bookSource: "BASIC Computer Games (1978), pp. 157-163.",
    tags: ["Sci-Fi", "Tactical", "Grid Command"],
    difficulty: "Advanced",
    accent: "#3f7fd4",
    route: null,
  },
  {
    id: "oregon_trail",
    title: "The Oregon Trail",
    subtitle: "The Great 1848 Pioneer Frontier Journey",
    year: 1971,
    author: "Don Rawitsch, Bill Heinemann, Paul Dillenberger (1971)",
    originalPublisher: "MECC (Minnesota Educational Computing Consortium)",
    category: "strategy",
    categoryDisplay: "Strategy & Simulation",
    status: "coming-soon",
    modes: [],
    description:
      "Lead a covered wagon party of pioneers from Independence, Missouri to Oregon's Willamette Valley. Hunt for food, ford treacherous rivers, and brave harsh weather.",
    rulesSummary:
      "Manage oxen, food, clothing, ammunition and medical supplies over 2,000 miles. Survive river crossings, bandits and cholera.",
    historicalProvenance:
      "Created in 1971 by student teachers in Minneapolis to teach 8th-grade history; published in Creative Computing in 1978.",
    bookSource: "Creative Computing Magazine (May/June 1978).",
    tags: ["History", "Survival", "Pioneers"],
    difficulty: "Intermediate",
    accent: "#a8794a",
    route: null,
  },
];

export function getGame(id: string): GameCatalogEntry | undefined {
  return GAMES.find((g) => g.id === id);
}