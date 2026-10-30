import { describe, it, expect } from "vitest";
import { newMatch, playerTake, aiMove } from "../src/games/matches23/engine";

describe("23 matches engine", () => {
  it("starts with 23 matches", () => {
    const s = newMatch("classic");
    expect(s.remaining).toBe(23);
    expect(s.gameOver).toBe(false);
  });

  it("player taking last match loses", () => {
    let s = newMatch("classic");
    s.remaining = 1;
    s = playerTake(s, 1);
    expect(s.gameOver).toBe(true);
    expect(s.winner).toBe("ai");
  });

  it("ai taking last match loses (player wins)", () => {
    let s = newMatch("classic");
    s.remaining = 2;
    s = playerTake(s, 1); // leaves 1, AI must take it
    expect(s.gameOver).toBe(true);
    expect(s.winner).toBe("player");
  });

  it("clamps illegal takes (cannot take more than remaining)", () => {
    let s = newMatch("classic");
    s.remaining = 2;
    s = playerTake(s, 3);
    expect(s.remaining).toBe(0);
    expect(s.winner).toBe("ai");
  });

  it("master AI leaves multiples of 4 when possible", () => {
    for (const r of [23, 22, 21]) {
      const s = newMatch("master");
      s.remaining = r;
      const take = aiMove(s);
      expect((r - take) % 4).toBe(0);
      expect(take).toBeGreaterThanOrEqual(1);
      expect(take).toBeLessThanOrEqual(3);
    }
  });

  it("full game vs master AI: master wins from fresh start", () => {
    let s = newMatch("master");
    while (!s.gameOver) {
      // player always takes 1 (worst play) — master should punish
      s = playerTake(s, 1);
    }
    expect(s.winner).toBe("ai");
  });
});
