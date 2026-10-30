export type BuildingType =
  | "palace" | "ziggurat" | "granary" | "farm" | "house"
  | "market" | "barracks" | "watchtower" | "wall" | "well";

export interface BuildingInstance {
  id: string;
  type: BuildingType;
  level: number;
  x: number;
  z: number;
  hp: number;
  underConstruction: boolean;
  progress: number;
}

export type WeatherKind = "clear" | "rain" | "storm" | "drought" | "flood";
export type SeasonKind = "spring" | "summer" | "autumn" | "winter";

export interface WeatherState {
  kind: WeatherKind;
  intensity: number;
  remainingTurns: number;
}

export interface Resources {
  grain: number;
  gold: number;
  stone: number;
  timber: number;
  land: number;
  landUsed: number;
}

export type CitizenRole = "farmer" | "builder" | "merchant" | "soldier" | "citizen";

export interface Population {
  total: number;
  farmers: number;
  builders: number;
  merchants: number;
  soldiers: number;
  citizens: number;
  idle: number;
}

export interface GameState {
  seed: number;
  turn: number;
  year: number;
  season: SeasonKind;
  resources: Resources;
  population: Population;
  happiness: number;
  health: number;
  stability: number;
  militaryStrength: number;
  weather: WeatherState;
  buildings: BuildingInstance[];
  taxRate: number;
  rationPerCitizen: number;
  landForSalePrice: number;
  research: Record<string, number>;
  chronicle: ChronicleEntry[];
  gameOver: null | { reason: string };
  achievements: string[];
}

export interface ChronicleEntry {
  turn: number;
  text: string;
  kind: "info" | "good" | "bad" | "crisis";
}

export interface Decree {
  feed: number;
  plant: number;
  buyLand: number;
  sellLand: number;
  recruitSoldiers: number;
  trainSoldiers: number;
  collectTax: boolean;
  build: Array<{ type: BuildingType; x: number; z: number }>;
  upgrade: string[];
  trade?: { sellGrain?: number; buyGrain?: number };
}

export function emptyDecree(): Decree {
  return {
    feed: 0, plant: 0, buyLand: 0, sellLand: 0,
    recruitSoldiers: 0, trainSoldiers: 0, collectTax: false,
    build: [], upgrade: [],
  };
}
