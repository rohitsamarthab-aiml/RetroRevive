import { describe, it, expect } from "vitest";
import { missionsFor, achievementsFor } from "../src/state/missions";
import { newGame } from "../src/sim/engine";
import { emptyDecree } from "../src/sim/types";
import { executeTurn } from "../src/sim/engine";

describe("missions & achievements", () => {
  it("missions are read-only and derived from state", () => {
    const s = newGame(31);
    const before = JSON.stringify(s);
    missionsFor(s);
    expect(JSON.stringify(s)).toBe(before);
  });

  it("keeper of stores unlocks with granary", () => {
    const s = newGame(33);
    // initial game already has a granary
    const m = missionsFor(s).find((x) => x.id === "build-granary");
    expect(m?.done).toBe(true);
  });

  it("bread for the people reflects grain level", () => {
    const s = newGame(35);
    s.resources.grain = 10;
    const m = missionsFor(s).find((x) => x.id === "feed-people");
    expect(m?.done).toBe(false);
  });

  it("crowned achievement unlocks after first turn", () => {
    const s = newGame(37);
    executeTurn(s, { ...emptyDecree(), feed: 300, plant: 4 });
    const a = achievementsFor(s).find((x) => x.id === "crowned");
    expect(a?.unlocked).toBe(true);
  });
});
