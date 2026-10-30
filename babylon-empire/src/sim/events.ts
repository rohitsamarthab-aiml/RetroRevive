import type { GameState, WeatherKind, ChronicleEntry } from "./types";
import type { Rng } from "./rng";

export function rollWeather(state: GameState, rng: Rng): void {
  const season = state.season;
  const table: Record<string, Array<[WeatherKind, number]>> = {
    spring: [["clear", 0.5], ["rain", 0.35], ["storm", 0.1], ["flood", 0.05]],
    summer: [["clear", 0.6], ["drought", 0.3], ["rain", 0.08], ["storm", 0.02]],
    autumn: [["clear", 0.55], ["rain", 0.3], ["storm", 0.1], ["drought", 0.05]],
    winter: [["clear", 0.5], ["rain", 0.25], ["storm", 0.2], ["flood", 0.05]],
  };
  const roll = rng.next();
  let acc = 0;
  let kind: WeatherKind = "clear";
  for (const [k, p] of table[season]) {
    acc += p;
    if (roll < acc) { kind = k; break; }
  }
  state.weather = {
    kind,
    intensity: kind === "clear" ? 0 : rng.next() * 0.7 + 0.3,
    remainingTurns: kind === "clear" ? 1 : rng.int(1, 2),
  };
}

export interface EventResult {
  chronicle: ChronicleEntry[];
  grainLoss?: number;
  buildingDamage?: string[];
}

export function rollEvents(state: GameState, rng: Rng): EventResult {
  const out: EventResult = { chronicle: [] };
  const w = state.weather.kind;

  if (w === "drought") {
    const loss = Math.round(state.resources.grain * 0.08 * state.weather.intensity);
    state.resources.grain -= loss;
    state.happiness -= 5;
    out.chronicle.push({ turn: state.turn, kind: "bad", text: `Drought scorches the fields. ${loss} grain lost to withering.` });
  }
  if (w === "flood") {
    const farms = state.buildings.filter(b => b.type === "farm" && !b.underConstruction);
    const damaged = farms.filter(() => rng.chance(0.15 * state.weather.intensity));
    for (const f of damaged) { f.hp -= 25; }
    out.buildingDamage = damaged.map(f => f.id);
    out.chronicle.push({ turn: state.turn, kind: "crisis", text: `The river floods! ${damaged.length} farm(s) damaged by the waters.` });
  }
  if (w === "storm") {
    out.chronicle.push({ turn: state.turn, kind: "info", text: "A storm rolls over the plains. Farmers shelter; rain will help the soil." });
    state.health += 2;
  }
  if (rng.chance(0.12)) {
    const eaten = Math.round(state.resources.grain * (rng.next() * 0.1));
    state.resources.grain -= eaten;
    out.chronicle.push({ turn: state.turn, kind: "bad", text: `Rats have gnawed into the granaries: ${eaten} grain devoured.` });
  }
  return out;
}
