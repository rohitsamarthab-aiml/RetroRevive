import type { BuildingType } from "./types";

export interface BuildingSpec {
  type: BuildingType;
  name: string;
  cost: { gold: number; stone: number; timber: number };
  buildTurns: number;
  maxLevel: number;
  housingCapacity?: number;
  grainCapacity?: number;
  grainPerFarmer?: number;
  goldIncome?: number;
  defense?: number;
  healthBonus?: number;
  happinessBonus?: number;
  description: string;
}

export const BUILDINGS: Record<BuildingType, BuildingSpec> = {
  palace: {
    type: "palace", name: "Royal Palace",
    cost: { gold: 0, stone: 0, timber: 0 },
    buildTurns: 0, maxLevel: 3,
    happinessBonus: 2,
    description: "Seat of the king. Core landmark of the empire.",
  },
  ziggurat: {
    type: "ziggurat", name: "Ziggurat",
    cost: { gold: 200, stone: 60, timber: 20 },
    buildTurns: 3, maxLevel: 3,
    happinessBonus: 10,
    description: "Temple tower of the gods. Raises happiness and stability.",
  },
  granary: {
    type: "granary", name: "Granary",
    cost: { gold: 60, stone: 20, timber: 30 },
    buildTurns: 1, maxLevel: 3,
    grainCapacity: 2000,
    description: "Stores grain safely from rats and weather.",
  },
  farm: {
    type: "farm", name: "Farm Plot",
    cost: { gold: 30, stone: 5, timber: 10 },
    buildTurns: 1, maxLevel: 3,
    grainPerFarmer: 45,
    description: "Produces grain each season.",
  },
  house: {
    type: "house", name: "Residence",
    cost: { gold: 40, stone: 10, timber: 15 },
    buildTurns: 1, maxLevel: 3,
    housingCapacity: 8,
    description: "Houses citizens; enables population growth.",
  },
  market: {
    type: "market", name: "Market",
    cost: { gold: 80, stone: 15, timber: 20 },
    buildTurns: 2, maxLevel: 3,
    goldIncome: 40,
    description: "Generates gold from trade each season.",
  },
  barracks: {
    type: "barracks", name: "Barracks",
    cost: { gold: 100, stone: 30, timber: 25 },
    buildTurns: 2, maxLevel: 3,
    defense: 10,
    description: "Trains and houses soldiers.",
  },
  watchtower: {
    type: "watchtower", name: "Watchtower",
    cost: { gold: 50, stone: 40, timber: 5 },
    buildTurns: 1, maxLevel: 3,
    defense: 6,
    description: "Watchpost for early defense.",
  },
  wall: {
    type: "wall", name: "City Wall",
    cost: { gold: 20, stone: 35, timber: 0 },
    buildTurns: 1, maxLevel: 3,
    defense: 4,
    description: "Fortification segment.",
  },
  well: {
    type: "well", name: "Well",
    cost: { gold: 25, stone: 15, timber: 0 },
    buildTurns: 1, maxLevel: 1,
    healthBonus: 2,
    description: "Improves public health.",
  },
};

export function upgradeCost(spec: BuildingSpec, targetLevel: number) {
  const f = 1 + 0.6 * (targetLevel - 1);
  return {
    gold: Math.round(spec.cost.gold * f),
    stone: Math.round(spec.cost.stone * f),
    timber: Math.round(spec.cost.timber * f),
  };
}
