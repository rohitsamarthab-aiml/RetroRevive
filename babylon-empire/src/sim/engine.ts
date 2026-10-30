import { SeededRng } from "./rng";
import { BUILDINGS, upgradeCost } from "./buildings";
import { rollWeather, rollEvents } from "./events";
import type { GameState, Decree, BuildingType, ChronicleEntry, SeasonKind } from "./types";

export const SEASONS: SeasonKind[] = ["spring", "summer", "autumn", "winter"];
export const GRAIN_PER_CITIZEN_SEASON = 5;
export const SOLDIER_UPKEEP_GOLD = 2;

export function newGame(seed = Date.now() % 2 ** 31): GameState {
  const state: GameState = {
    seed,
    turn: 0, year: 1, season: "spring",
    resources: { grain: 1200, gold: 250, stone: 40, timber: 40, land: 20, landUsed: 4 },
    population: { total: 60, farmers: 40, builders: 5, merchants: 5, soldiers: 10, citizens: 40, idle: 0 },
    happiness: 60, health: 60, stability: 70, militaryStrength: 15,
    weather: { kind: "clear", intensity: 0, remainingTurns: 1 },
    buildings: [],
    taxRate: 0.1,
    rationPerCitizen: GRAIN_PER_CITIZEN_SEASON,
    landForSalePrice: 22,
    research: {},
    chronicle: [],
    gameOver: null,
    achievements: [],
  };
  placeBuilding(state, "palace", 0, 0, true);
  placeBuilding(state, "house", 2, 0, true);
  placeBuilding(state, "farm", -2, 2, true);
  placeBuilding(state, "granary", 2, 2, true);
  state.chronicle.push({ turn: 0, kind: "good", text: "You ascend the throne of Babylon. The empire awaits your command." });
  return state;
}

export function placeBuilding(
  state: GameState, type: BuildingType, x: number, z: number, instant = false,
): string | null {
  const spec = BUILDINGS[type];
  const r = state.resources;
  if (r.gold < spec.cost.gold || r.stone < spec.cost.stone || r.timber < spec.cost.timber) return null;
  if (state.buildings.some(b => b.x === x && b.z === z)) return null;
  r.gold -= spec.cost.gold;
  r.stone -= spec.cost.stone;
  r.timber -= spec.cost.timber;
  const id = `${type}-${state.turn}-${x}-${z}`;
  state.buildings.push({
    id, type, level: 1, x, z, hp: 100,
    underConstruction: !instant,
    progress: instant ? 100 : 0,
  });
  return id;
}

export function countComplete(state: GameState, type: BuildingType, minLevel = 1) {
  return state.buildings.filter(b => b.type === type && !b.underConstruction && b.level >= minLevel).length;
}

export function capacity(state: GameState): { housing: number; grain: number; defense: number } {
  let housing = 0, grain = 0, defense = 0;
  for (const b of state.buildings) {
    if (b.underConstruction) continue;
    const spec = BUILDINGS[b.type];
    const lv = b.level;
    if (spec.housingCapacity) housing += spec.housingCapacity * lv;
    if (spec.grainCapacity) grain += spec.grainCapacity * lv;
    if (spec.defense) defense += spec.defense * lv;
  }
  return { housing, grain, defense };
}

export function canAffordDecree(state: GameState, d: Decree): { ok: boolean; reason?: string } {
  const r = state.resources;
  const landCost = d.buyLand * state.landForSalePrice;
  const soldiers = d.recruitSoldiers + d.trainSoldiers;

  if (d.feed < 0 || d.plant < 0 || d.buyLand < 0 || d.sellLand < 0) {
    return { ok: false, reason: "Invalid decree values." };
  }
  if (d.plant > r.landUsed) return { ok: false, reason: `Cannot plant ${d.plant} plots; only ${r.landUsed} arable.` };
  if (r.grain < d.feed + d.plant) return { ok: false, reason: "Not enough grain for feeding and seed." };
  if (d.buyLand > 0 && r.gold < landCost) return { ok: false, reason: "Not enough gold to buy land." };
  if (d.sellLand > r.landUsed) return { ok: false, reason: "Selling more land than owned." };
  if (soldiers > state.population.citizens) return { ok: false, reason: "Not enough citizens to recruit." };
  for (const b of d.build) {
    const spec = BUILDINGS[b.type];
    if (r.gold < spec.cost.gold) return { ok: false, reason: `Cannot afford ${spec.name}.` };
    if (state.buildings.some(x => x.x === b.x && x.z === b.z)) return { ok: false, reason: `Tile (${b.x},${b.z}) occupied.` };
  }
  return { ok: true };
}

export function executeTurn(state: GameState, decree: Decree): ChronicleEntry[] {
  const rng = new SeededRng(state.seed + state.turn * 7919);
  const chron: ChronicleEntry[] = [];
  if (state.gameOver) return chron;
  state.turn += 1;

  const check = canAffordDecree(state, decree);
  if (!check.ok) {
    chron.push({ turn: state.turn, kind: "bad", text: `Decree rejected: ${check.reason}` });
    state.chronicle.push(...chron);
    return chron;
  }

  const r = state.resources;
  r.grain -= decree.feed + decree.plant;

  if (decree.buyLand > 0) {
    const cost = decree.buyLand * state.landForSalePrice;
    r.gold -= cost;
    r.land += decree.buyLand;
    r.landUsed += decree.buyLand;
    chron.push({ turn: state.turn, kind: "info", text: `Purchased ${decree.buyLand} acres for ${cost} gold.` });
  }
  if (decree.sellLand > 0) {
    const gain = decree.sellLand * Math.round(state.landForSalePrice * 0.8);
    r.gold += gain;
    r.land -= decree.sellLand;
    r.landUsed -= decree.sellLand;
    chron.push({ turn: state.turn, kind: "info", text: `Sold ${decree.sellLand} acres for ${gain} gold.` });
  }

  if (decree.recruitSoldiers > 0) {
    state.population.soldiers += decree.recruitSoldiers;
    state.population.citizens -= decree.recruitSoldiers;
    chron.push({ turn: state.turn, kind: "info", text: `${decree.recruitSoldiers} citizens conscripted into the army.` });
  }
  state.militaryStrength = state.population.soldiers * 3 + capacity(state).defense;

  // Buildings placed THIS turn start progressing from the NEXT turn,
  // so a building with buildTurns = N takes exactly N full turns.
  const startedThisTurn = new Set<string>();
  for (const b of decree.build) {
    const id = placeBuilding(state, b.type, b.x, b.z);
    if (id) {
      startedThisTurn.add(id);
      chron.push({ turn: state.turn, kind: "info", text: `Construction of ${BUILDINGS[b.type].name} begins at (${b.x}, ${b.z}).` });
    }
  }

  rollWeather(state, rng);
  const events = rollEvents(state, rng);
  chron.push(...events.chronicle);

  const w = state.weather;
  let farmEff = 1;
  if (w.kind === "rain") farmEff = 1.25;
  if (w.kind === "storm") farmEff = 1.15;
  if (w.kind === "drought") farmEff = 0.45 + 0.2 * (1 - w.intensity);
  if (w.kind === "flood") farmEff = 0.7;

  const farms = countComplete(state, "farm");
  const farmerCapacity = state.population.farmers;
  const planted = Math.min(decree.plant, farms * 2, farmerCapacity);
  const irrigationBonus = 1 + (state.research.irrigation ?? 0) * 0.15;
  const harvest = Math.round(planted * (BUILDINGS.farm.grainPerFarmer ?? 45) * farmEff * irrigationBonus);
  r.grain += harvest;
  chron.push({ turn: state.turn, kind: "info",
    text: `Harvest: ${harvest} grain from ${planted} plots (weather: ${w.kind}).` });

  let goldIncome = 0;
  goldIncome += countComplete(state, "market") * (BUILDINGS.market.goldIncome ?? 0);
  goldIncome += Math.round(state.population.total * state.taxRate * 2);
  r.gold += goldIncome;

  const upkeep = state.population.soldiers * SOLDIER_UPKEEP_GOLD;
  r.gold -= upkeep;
  if (r.gold < 0) { state.stability -= 8; r.gold = 0; chron.push({ turn: state.turn, kind: "bad", text: "The treasury ran dry — unrest stirs among unpaid soldiers." }); }

  const fed = Math.min(decree.feed, r.grain);
  const fedCitizens = Math.floor(fed / GRAIN_PER_CITIZEN_SEASON);
  const starved = Math.max(0, state.population.total - fedCitizens);
  if (starved > 0) {
    const pct = starved / state.population.total;
    state.population.total -= starved;
    state.happiness -= 25;
    state.stability -= 15;
    chron.push({ turn: state.turn, kind: "crisis", text: `${starved} citizens starved (${Math.round(pct * 100)}%). The people wail in the streets.` });
    if (pct > 0.45) {
      state.gameOver = { reason: "Deposed: you let nearly half your people starve." };
      chron.push({ turn: state.turn, kind: "crisis", text: "The council deposes you. GAME OVER." });
      state.chronicle.push(...chron);
      return chron;
    }
  } else {
    state.happiness += 3;
  }

  const cap = capacity(state);
  const surplus = fed - state.population.total * GRAIN_PER_CITIZEN_SEASON;
  if (surplus >= 0 && state.happiness > 40 && state.population.total < cap.housing) {
    const immigrants = Math.min(Math.floor((state.happiness - 40) / 5) + 1, cap.housing - state.population.total);
    state.population.total += immigrants;
    state.population.citizens += immigrants;
    chron.push({ turn: state.turn, kind: "good", text: `${immigrants} settlers arrive, drawn by prosperity.` });
  }

  for (const b of state.buildings) {
    if (b.underConstruction && !startedThisTurn.has(b.id)) {
      b.progress += Math.round(100 / BUILDINGS[b.type].buildTurns * (1 + state.population.builders * 0.02));
      if (b.progress >= 100) {
        b.underConstruction = false;
        b.progress = 100;
        chron.push({ turn: state.turn, kind: "good", text: `${BUILDINGS[b.type].name} completed.` });
        const spec = BUILDINGS[b.type];
        if (spec.happinessBonus) state.happiness += spec.happinessBonus;
      }
    }
  }

  const wells = countComplete(state, "well");
  state.health = clamp(state.health + wells * 2 - (w.kind === "drought" ? 3 : 0), 0, 100);
  state.stability = clamp(state.stability + (state.happiness > 60 ? 2 : -2), 0, 100);

  const sIdx = SEASONS.indexOf(state.season);
  if (sIdx === 3) {
    state.year += 1;
    chron.push({ turn: state.turn, kind: "info", text: `— Year ${state.year} begins —` });
    state.landForSalePrice = clamp(state.landForSalePrice + rng.int(-2, 2), 17, 26);
  }
  state.season = SEASONS[(sIdx + 1) % 4];

  state.chronicle.push(...chron);
  if (state.chronicle.length > 200) state.chronicle = state.chronicle.slice(-200);
  return chron;
}

export function upgradeBuilding(state: GameState, id: string): boolean {
  const b = state.buildings.find(x => x.id === id);
  if (!b || b.underConstruction || b.level >= BUILDINGS[b.type].maxLevel) return false;
  const cost = upgradeCost(BUILDINGS[b.type], b.level + 1);
  const r = state.resources;
  if (r.gold < cost.gold || r.stone < cost.stone || r.timber < cost.timber) return false;
  r.gold -= cost.gold;
  r.stone -= cost.stone;
  r.timber -= cost.timber;
  b.level += 1;
  state.chronicle.push({ turn: state.turn, kind: "good", text: `${BUILDINGS[b.type].name} upgraded to level ${b.level}.` });
  return true;
}

export function serialize(state: GameState): string { return JSON.stringify(state); }
export function deserialize(json: string): GameState { return JSON.parse(json); }

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }
