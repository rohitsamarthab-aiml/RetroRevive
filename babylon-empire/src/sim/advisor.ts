import type { GameState } from "./types";
import { GRAIN_PER_CITIZEN_SEASON, countComplete } from "./engine";

export interface Advice {
  severity: "info" | "warning" | "critical";
  topic: string;
  message: string;
}

/**
 * READ-ONLY Royal Advisor. Analyzes a snapshot and returns advice.
 * Never mutates state — enforced here by design: no writes to `snapshot`.
 */
export function advise(snapshot: GameState): Advice[] {
  const s = snapshot;
  const out: Advice[] = [];
  const need = s.population.total * GRAIN_PER_CITIZEN_SEASON;
  const farms = countComplete(s, "farm");

  if (s.resources.grain < need) {
    out.push({ severity: "critical", topic: "Food",
      message: `Grain stores (${s.resources.grain}) cover less than one season for ${s.population.total} people (need ${need}). Ration now and plant every arable plot.` });
  } else if (s.resources.grain < need * 2) {
    out.push({ severity: "warning", topic: "Food",
      message: `Grain (${s.resources.grain}) is below two seasons' reserve (${need * 2}). A drought or rat plague could trigger famine.` });
  }

  if (farms * 2 < s.population.farmers) {
    out.push({ severity: "warning", topic: "Agriculture",
      message: `You have ${s.population.farmers} farmers but only ${farms} farms (capacity ${farms * 2} plots). Build more farms.` });
  }

  if (s.weather.kind === "drought") {
    out.push({ severity: "critical", topic: "Weather",
      message: "Drought ravages the land: farm output is cut by more than half. Open the granaries early." });
  }
  if (s.weather.kind === "flood") {
    out.push({ topic: "Weather", severity: "warning",
      message: "Flood risk: farms may be damaged. Keep timber and stone reserves for repairs." });
  }

  const housing = s.buildings.filter(b => b.type === "house" && !b.underConstruction)
    .reduce((a, b) => a + b.level * 8, 0);
  if (housing <= s.population.total) {
    out.push({ severity: "warning", topic: "Population",
      message: `Housing (${housing}) cannot hold your people (${s.population.total}). Immigration stops until you build residences.` });
  }

  if (s.militaryStrength < s.population.total / 4) {
    out.push({ severity: "warning", topic: "Defense",
      message: `Military strength (${s.militaryStrength}) is thin. Recruit soldiers or raise walls and watchtowers.` });
  }

  if (s.happiness < 40) {
    out.push({ severity: "critical", topic: "Unrest",
      message: "Happiness is dangerously low. Feed fully, lower taxes, and complete the ziggurat." });
  }
  if (s.resources.gold < 50) {
    out.push({ severity: "warning", topic: "Economy",
      message: "The treasury is nearly empty. Raise the tax rate slightly or build a market." });
  }
  if (out.length === 0) {
    out.push({ severity: "info", topic: "General",
      message: "The kingdom prospers, my king. Now is the time to expand: new farms, a market, and walls for the future." });
  }
  return out;
}

export function advisorReply(snapshot: GameState, question: string): string {
  const advice = advise(snapshot);
  const q = question.toLowerCase();
  if (q.includes("food") || q.includes("grain") || q.includes("starv") || q.includes("eat")) {
    const a = advice.find(x => x.topic === "Food");
    return a ? a.message : `Grain stands at ${snapshot.resources.grain} — sufficient for now. Keep a two-season reserve.`;
  }
  if (q.includes("defen") || q.includes("soldier") || q.includes("war") || q.includes("army")) {
    const a = advice.find(x => x.topic === "Defense");
    return a ? a.message : `Military strength stands at ${snapshot.militaryStrength}. Walls and watchtowers add defense without soldiers.`;
  }
  if (q.includes("gold") || q.includes("tax") || q.includes("econ") || q.includes("trade") || q.includes("market")) {
    const a = advice.find(x => x.topic === "Economy");
    return a ? a.message : `Treasury: ${snapshot.resources.gold} gold. Markets yield ${40} gold each per season; taxes yield ${Math.round(snapshot.population.total * snapshot.taxRate * 2)}.`;
  }
  if (q.includes("build") || q.includes("constr")) {
    return "Prioritize: farms first (food), then houses (growth), granaries (storage), a market (gold), then walls and barracks (defense). The ziggurat raises happiness permanently.";
  }
  if (q.includes("weather") || q.includes("drought") || q.includes("rain") || q.includes("flood")) {
    return `Current weather: ${snapshot.weather.kind}. Drought halves harvests; rain boosts them; floods damage farms. Always keep a grain buffer before summer.`;
  }
  if (advice.length > 0 && advice[0].severity !== "info") {
    return advice[0].message;
  }
  return "The kingdom prospers, my king. Ask me of food, gold, defense, weather, or construction, and I shall counsel you.";
}
