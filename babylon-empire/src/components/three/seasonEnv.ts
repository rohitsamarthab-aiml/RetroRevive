// Season-based environment tuning: terrain color, light color/intensity, fog.
import type { SeasonKind } from "@/sim/types";

export interface SeasonEnv {
  terrainColor: string;
  lightColor: string;
  lightIntensity: number;
  fogColor: string;
  ambient: number;
}

export const SEASON_ENV: Record<SeasonKind, SeasonEnv> = {
  spring: { terrainColor: "#9aa856", lightColor: "#fff4d6", lightIntensity: 1.25, fogColor: "#c9d6a8", ambient: 0.6 },
  summer: { terrainColor: "#c2a265", lightColor: "#ffe9b8", lightIntensity: 1.55, fogColor: "#e0c68a", ambient: 0.5 },
  autumn: { terrainColor: "#a8894a", lightColor: "#ffd9a8", lightIntensity: 1.1, fogColor: "#c9a86a", ambient: 0.55 },
  winter: { terrainColor: "#8a7a5a", lightColor: "#dfe8f2", lightIntensity: 0.85, fogColor: "#aab4bd", ambient: 0.65 },
};

export function famineTone(s: { happiness: number; resources: { grain: number }; population: { total: number } }): number {
  // 0 = normal, 1 = famine urgency (drives vignette + citizen slump)
  const need = s.population.total * 5;
  const foodStress = Math.max(0, 1 - s.resources.grain / Math.max(1, need));
  const happyStress = Math.max(0, (50 - s.happiness) / 50);
  return Math.min(1, foodStress * 0.7 + happyStress * 0.5);
}