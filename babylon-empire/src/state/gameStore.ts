"use client";

import { create } from "zustand";
import { newGame, executeTurn, serialize, deserialize, upgradeBuilding, countComplete, capacity } from "@/sim/engine";
import { advise, advisorReply, type Advice } from "@/sim/advisor";
import { BUILDINGS } from "@/sim/buildings";
import { emptyDecree, type GameState, type Decree, type BuildingType, type ChronicleEntry } from "@/sim/types";

export type BuildMode = { active: boolean; type: BuildingType | null };

interface GameStore {
  state: GameState;
  buildMode: BuildMode;
  selectedBuildingId: string | null;
  lastChronicle: ChronicleEntry[];
  quality: "low" | "medium" | "high";
  pendingDecree: Decree;
  setBuildMode: (m: BuildMode) => void;
  selectBuilding: (id: string | null) => void;
  setQuality: (q: GameStore["quality"]) => void;
  placeAt: (x: number, z: number) => void;
  commitDecree: () => ChronicleEntry[];
  setDecreeField: <K extends keyof Decree>(k: K, v: Decree[K]) => void;
  upgrade: (id: string) => void;
  saveLocal: () => void;
  loadLocal: () => boolean;
  newRun: (seed?: number) => void;
  getAdvice: () => Advice[];
  askAdvisor: (q: string) => string;
}

const DECREE_STORAGE_KEY = "babylon-empire-save-v1";

export const useGame = create<GameStore>((set, get) => ({
  state: newGame(2026),
  buildMode: { active: false, type: null },
  selectedBuildingId: null,
  lastChronicle: [],
  quality: "high",
  pendingDecree: emptyDecree(),

  setBuildMode: (m) => set({ buildMode: m }),
  selectBuilding: (id) => set({ selectedBuildingId: id }),
  setQuality: (q) => set({ quality: q }),

  placeAt: (x, z) => {
    const { buildMode, state } = get();
    if (!buildMode.active || !buildMode.type) return;
    const spec = BUILDINGS[buildMode.type];
    // Pre-check affordability so the click feels immediate; actual deduction
    // happens in executeTurn via the decree.
    if (state.resources.gold < spec.cost.gold) return;
    const pd = get().pendingDecree;
    set({
      pendingDecree: { ...pd, build: [...pd.build, { type: buildMode.type, x, z }] },
      buildMode: { active: false, type: null },
    });
  },

  commitDecree: () => {
    const { state, pendingDecree } = get();
    if (state.gameOver) return [];
    const chron = executeTurn(state, pendingDecree);
    set({ state: { ...state }, pendingDecree: emptyDecree(), lastChronicle: chron });
    return chron;
  },

  setDecreeField: (k, v) => set((s) => ({ pendingDecree: { ...s.pendingDecree, [k]: v } })),

  upgrade: (id) => {
    const { state } = get();
    upgradeBuilding(state, id);
    set({ state: { ...state } });
  },

  saveLocal: () => {
    try { localStorage.setItem(DECREE_STORAGE_KEY, serialize(get().state)); } catch { /* storage full */ }
  },

  loadLocal: () => {
    try {
      const raw = localStorage.getItem(DECREE_STORAGE_KEY);
      if (!raw) return false;
      set({ state: deserialize(raw) });
      return true;
    } catch { return false; }
  },

  newRun: (seed) => set({ state: newGame(seed ?? (Date.now() % 2 ** 31)), pendingDecree: emptyDecree(), lastChronicle: [] }),

  getAdvice: () => advise(get().state),
  askAdvisor: (q) => advisorReply(get().state, q),
}));

// Derived helpers used by HUD + 3D world
export function housingCapacity(state: GameState) { return capacity(state).housing; }
export function grainCapacity(state: GameState) { return capacity(state).grain; }
export function farmCount(state: GameState) { return countComplete(state, "farm"); }