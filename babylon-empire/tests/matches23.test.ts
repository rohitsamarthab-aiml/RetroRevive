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

  // MISÈRE NIM: the player who takes the LAST match LOSES.
  // Losing positions for the side about to move are counts ≡ 1 (mod 4):
  // 21, 17, 13, 9, 5, 1. The master AI therefore leaves 4k+1 for the
  // opponent — NOT multiples of 4 (that is normal Nim, a different game).
  // The old assertion ((r - take) % 4 === 0) encoded the wrong rule and
  // has been corrected to reflect the actual misère game. The AI logic
  // was verified correct and unchanged.
  it("master AI leaves 4k+1 positions when possible (misère rule)", () => {
    for (const r of [23, 22, 21, 20]) {
      const s = newMatch("master");
      s.remaining = r;
      const take = aiMove(s);
      expect(take).toBeGreaterThanOrEqual(1);
      expect(take).toBeLessThanOrEqual(3);
      expect((r - take) % 4).toBe(1);
    }
  });

  it("master AI never takes the last match when avoidable", () => {
    for (const r of [2, 3, 4, 5, 6, 7]) {
      const s = newMatch("master");
      s.remaining = r;
      const take = aiMove(s);
      expect(take).toBeLessThan(r); // must not empty the table if avoidable
    }
  });

  it("classic AI takes a legal 1-3 amount", () => {
    for (const r of [23, 15, 8, 4, 3]) {
      const s = newMatch("classic");
      s.remaining = r;
      const take = aiMove(s);
      expect(take).toBeGreaterThanOrEqual(1);
      expect(take).toBeLessThanOrEqual(Math.min(3, r));
    }
  });

  it("full game vs master AI: master wins from fresh start", () => {
    let s = newMatch("master");
    let guard = 0;
    while (!s.gameOver && guard++ < 50) {
      s = playerTake(s, 1); // worst play: always take 1 — master should punish
    }
    expect(s.gameOver).toBe(true);
    expect(s.winner).toBe("ai");
  });

  it("master AI loses when forced to take the last match", () => {
    // 3 remain; player takes 2, leaving 1 — the AI must take it and loses.
    let s = newMatch("master");
    s.remaining = 3;
    s = playerTake(s, 2);
    expect(s.gameOver).toBe(true);
    expect(s.winner).toBe("player");
  });
});
