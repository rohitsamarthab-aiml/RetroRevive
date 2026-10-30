// Missions & achievements computed from real game state.
// Read-only: evaluates snapshots, never mutates them.
import type { GameState } from "@/sim/types";

export interface Mission {
  id: string;
  title: string;
  description: string;
  progress: number; // 0..1
  done: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export function missionsFor(s: GameState): Mission[] {
  const farms = s.buildings.filter((b) => b.type === "farm" && !b.underConstruction).length;
  const houses = s.buildings.filter((b) => b.type === "house" && !b.underConstruction).length;
  const granaries = s.buildings.filter((b) => b.type === "granary" && !b.underConstruction).length;
  const need = s.population.total * 5;
  return [
    {
      id: "survive-1y",
      title: "First Harvest",
      description: "Survive your first full year in power.",
      progress: Math.min(1, (s.turn) / 4),
      done: s.year >= 2,
    },
    {
      id: "feed-people",
      title: "Bread for the People",
      description: "Keep grain reserves above one season's need.",
      progress: Math.min(1, s.resources.grain / Math.max(1, need)),
      done: s.resources.grain >= need,
    },
    {
      id: "build-granary",
      title: "Keeper of Stores",
      description: "Construct a granary.",
      progress: granaries > 0 ? 1 : 0.5,
      done: granaries > 0,
    },
    {
      id: "farms-3",
      title: "Green Fields",
      description: "Have 3 completed farms.",
      progress: Math.min(1, farms / 3),
      done: farms >= 3,
    },
    {
      id: "pop-100",
      title: "City of Settlers",
      description: "Grow the population to 100.",
      progress: Math.min(1, s.population.total / 100),
      done: s.population.total >= 100,
    },
    {
      id: "houses-3",
      title: "Growing Streets",
      description: "Build 3 residences.",
      progress: Math.min(1, houses / 3),
      done: houses >= 3,
    },
  ];
}

export function achievementsFor(s: GameState): Achievement[] {
  const ziggurat = s.buildings.some((b) => b.type === "ziggurat" && !b.underConstruction);
  const market = s.buildings.some((b) => b.type === "market" && !b.underConstruction);
  return [
    { id: "crowned", title: "Crowned in Babylon", description: "Begin your reign.", unlocked: s.turn >= 1 },
    { id: "harvest-500", title: "Golden Fields", description: "Hold 500 grain at once.", unlocked: s.resources.grain >= 500 },
    { id: "prosperity", title: "Beloved Ruler", description: "Reach 80 happiness.", unlocked: s.happiness >= 80 },
    { id: "trader", title: "Merchant Prince", description: "Build a market.", unlocked: market },
    { id: "pious", title: "Favorite of the Gods", description: "Complete the ziggurat.", unlocked: ziggurat },
    { id: "survivor", title: "Tested by Drought", description: "Survive a drought year.", unlocked: s.chronicle.some((c) => c.text.includes("Drought")) },
    { id: "year-3", title: "Three Years of Plenty", description: "Reach year 3.", unlocked: s.year >= 3 },
  ];
}