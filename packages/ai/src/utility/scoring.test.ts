import { describe, expect, it } from "vitest";

import { chooseOption } from "./selector";
import { scoreConsiderations, scoreOptions } from "./scoring";
import { curves } from "./math";
import type { UtilityOption } from "./types";

describe("utility scoring", () => {
  it("scores a single consideration directly", () => {
    expect(
      scoreConsiderations(
        [{ name: "readiness", input: () => 0.5, curve: curves.linear() }],
        undefined,
      ),
    ).toBe(0.5);
  });

  it("vetoes an option when any consideration is zero", () => {
    expect(
      scoreConsiderations(
        [
          { name: "ready", input: () => 1, curve: curves.linear() },
          { name: "blocked", input: () => 0, curve: curves.linear() },
        ],
        undefined,
      ),
    ).toBe(0);
  });

  it("keeps the highest score for duplicate option ids", () => {
    const options: UtilityOption<undefined, "attack" | "retreat">[] = [
      {
        id: "attack",
        considerations: [
          { name: "low", input: () => 0.25, curve: curves.linear() },
        ],
      },
      {
        id: "attack",
        considerations: [
          { name: "high", input: () => 0.75, curve: curves.linear() },
        ],
      },
      {
        id: "retreat",
        considerations: [
          { name: "mid", input: () => 0.5, curve: curves.linear() },
        ],
      },
    ];

    expect(scoreOptions(options, undefined)).toEqual([
      { id: "attack", raw: 0.75 },
      { id: "retreat", raw: 0.5 },
    ]);
  });

  it("keeps a viable committed option during the minimum dwell window", () => {
    const options: UtilityOption<undefined, "hold" | "attack">[] = [
      {
        id: "hold",
        considerations: [
          { name: "hold", input: () => 0.2, curve: curves.linear() },
        ],
      },
      {
        id: "attack",
        considerations: [
          { name: "attack", input: () => 0.9, curve: curves.linear() },
        ],
      },
    ];

    const choice = chooseOption(
      options,
      undefined,
      { currentId: "hold", since: 0 },
      100,
      { minCommitMs: 600, selectionNoise: 0 },
    );

    expect(choice).toBe("hold");
  });
});
