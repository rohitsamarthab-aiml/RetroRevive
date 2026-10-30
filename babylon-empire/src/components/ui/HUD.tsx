"use client";

import { useState } from "react";
import { useGame } from "@/state/gameStore";
import { BUILDINGS } from "@/sim/buildings";
import type { BuildingType } from "@/sim/types";
import { GRAIN_PER_CITIZEN_SEASON } from "@/sim/engine";
import { MissionsPanel } from "./MissionsPanel";
import { ThroneRoomOverlay } from "./ThroneRoomOverlay";

const BUILD_MENU: BuildingType[] = ["farm", "house", "granary", "market", "well", "barracks", "watchtower", "wall", "ziggurat"];

export function HUD() {
  const state = useGame((s) => s.state);
  const pending = useGame((s) => s.pendingDecree);
  const setField = useGame((s) => s.setDecreeField);
  const commit = useGame((s) => s.commitDecree);
  const buildMode = useGame((s) => s.buildMode);
  const setBuildMode = useGame((s) => s.setBuildMode);
  const selectedId = useGame((s) => s.selectedBuildingId);
  const upgrade = useGame((s) => s.upgrade);
  const saveLocal = useGame((s) => s.saveLocal);
  const loadLocal = useGame((s) => s.loadLocal);
  const newRun = useGame((s) => s.newRun);
  const askAdvisor = useGame((s) => s.askAdvisor);
  const quality = useGame((s) => s.quality);
  const setQuality = useGame((s) => s.setQuality);
  const [advice, setAdvice] = useState("");
  const [tab, setTab] = useState<"decree" | "build" | "advisor" | "chronicle" | "kingdom">("decree");
  const [throneOpen, setThroneOpen] = useState(false);

  const r = state.resources;
  const need = state.population.total * GRAIN_PER_CITIZEN_SEASON;
  const selected = state.buildings.find((b) => b.id === selectedId) ?? null;
  const famine = r.grain < need;

  if (state.gameOver) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
        <div className="panel p-8 max-w-md text-center">
          <h2 className="text-2xl text-red-400 mb-3">The Throne is Lost</h2>
          <p className="mb-6">{state.gameOver.reason}</p>
          <button className="btn-royal" onClick={() => newRun()}>Begin a New Reign</button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40 select-none text-base">
      {throneOpen && <ThroneRoomOverlay onClose={() => setThroneOpen(false)} />}
      {famine && (
        <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-auto">
          <div className="bg-red-900/85 border border-red-500 px-6 py-2 rounded text-[#ffd6d0] text-sm font-bold shadow-lg">
            ⚠ FAMINE WARNING — grain below one season&apos;s need ({need}). Open the granaries, my king.
          </div>
        </div>
      )}
      <div className="pointer-events-auto flex flex-wrap gap-x-5 gap-y-1 items-center panel px-5 py-3 m-3 text-base">
        <span className="font-bold text-[#d4a017]">Year {state.year} · {state.season}</span>
        <span title="Grain">🌾 {Math.round(r.grain)}</span>
        <span title="Gold">🪙 {Math.round(r.gold)}</span>
        <span title="Stone">🧱 {Math.round(r.stone)}</span>
        <span title="Timber">🪵 {Math.round(r.timber)}</span>
        <span title="Population">👥 {state.population.total}</span>
        <span title="Military">⚔️ {state.militaryStrength}</span>
        <span title="Weather">{state.weather.kind}</span>
        <span title="Happiness">😊 {Math.round(state.happiness)}</span>
        <span title="Land">🌍 {r.land} acres</span>
        <button className="btn-stone ml-2" onClick={() => setThroneOpen(true)}>👑 Throne Room</button>
      </div>
      <div className="absolute bottom-0 inset-x-0 pointer-events-auto panel m-3 p-4 max-h-[44vh] overflow-y-auto">
        <div className="flex gap-2 mb-3 flex-wrap">
          {(["decree", "build", "advisor", "kingdom", "chronicle"] as const).map((t) => (
            <button key={t} className={`btn-stone ${tab === t ? "ring-1 ring-[#d4a017]" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
          <div className="ml-auto flex gap-2 items-center">
            <select className="btn-stone text-sm" value={quality} onChange={(e) => setQuality(e.target.value as never)} title="Graphics quality">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button className="btn-stone" onClick={saveLocal}>💾 Save</button>
            <button className="btn-stone" onClick={() => loadLocal()}>📂 Load</button>
          </div>
        </div>
        {tab === "decree" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <NumberField label={`Feed people (need ${need})`} value={pending.feed} onChange={(v) => setField("feed", v)} max={Math.floor(r.grain)} />
            <NumberField label="Plant plots" value={pending.plant} onChange={(v) => setField("plant", v)} max={r.landUsed} />
            <NumberField label="Buy land" value={pending.buyLand} onChange={(v) => setField("buyLand", v)} max={50} />
            <NumberField label="Sell land" value={pending.sellLand} onChange={(v) => setField("sellLand", v)} max={r.landUsed} />
            <NumberField label="Recruit soldiers" value={pending.recruitSoldiers} onChange={(v) => setField("recruitSoldiers", v)} max={state.population.citizens} />
            <div className="flex items-end col-span-2 md:col-span-1">
              <button className="btn-royal w-full" onClick={() => commit()}>Enact Decree ▸ next season</button>
            </div>
          </div>
        )}
        {tab === "build" && (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {BUILD_MENU.map((t) => (
                <button key={t} className="btn-stone" disabled={state.resources.gold < BUILDINGS[t].cost.gold}
                  title={BUILDINGS[t].description} onClick={() => setBuildMode({ active: true, type: t })}>
                  {BUILDINGS[t].name} · 🪙{BUILDINGS[t].cost.gold}
                </button>
              ))}
            </div>
            {buildMode.active && (
              <p className="text-[#d4a017] text-sm">Click a tile on the ground to place {buildMode.type && BUILDINGS[buildMode.type].name}.</p>
            )}
            {selected && (
              <div className="panel p-3 mt-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <b>{BUILDINGS[selected.type].name}</b> · Level {selected.level}
                  {selected.underConstruction && ` · building ${Math.round(selected.progress)}%`}
                  {selected.hp < 100 && ` · damaged ${Math.round(100 - selected.hp)}%`}
                  <p className="text-xs text-[#8a7a5a] mt-1">{BUILDINGS[selected.type].description}</p>
                </div>
                <button className="btn-stone" disabled={selected.underConstruction || selected.level >= BUILDINGS[selected.type].maxLevel} onClick={() => upgrade(selected.id)}>
                  Upgrade
                </button>
              </div>
            )}
          </div>
        )}
        {tab === "advisor" && (
          <div>
            <div className="flex gap-2 mb-3 flex-wrap">
              <button className="btn-stone" onClick={() => setAdvice(JSON.stringify(useGame.getState().getAdvice(), null, 1))}>Counsel me</button>
              <button className="btn-stone" onClick={() => setAdvice(askAdvisor("food"))}>Food</button>
              <button className="btn-stone" onClick={() => setAdvice(askAdvisor("gold"))}>Economy</button>
              <button className="btn-stone" onClick={() => setAdvice(askAdvisor("defense"))}>Defense</button>
              <button className="btn-stone" onClick={() => setAdvice(askAdvisor("weather"))}>Weather</button>
              <button className="btn-stone" onClick={() => setAdvice(askAdvisor("build"))}>Construction</button>
            </div>
            <pre className="whitespace-pre-wrap text-sm">{advice || "Ask the Grand Vizier for counsel, my king."}</pre>
          </div>
        )}
        {tab === "kingdom" && <MissionsPanel />}
        {tab === "chronicle" && (
          <div className="text-sm space-y-1 max-h-52 overflow-y-auto">
            {[...state.chronicle].reverse().slice(0, 40).map((c, i) => (
              <div key={i} className={c.kind === "good" ? "text-emerald-400" : c.kind === "bad" ? "text-amber-400" : c.kind === "crisis" ? "text-red-400" : "text-[#b8a888]"}>
                [Y{Math.floor(c.turn / 4) + 1}] {c.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <label className="block">
      <span className="text-sm text-[#b8a888]">{label}</span>
      <input type="number" min={0} max={max} value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
        className="w-full mt-1 bg-[#241c10] border border-[#5a4526] rounded px-2 py-1.5 text-[#e8dcc3] text-base" />
    </label>
  );
}