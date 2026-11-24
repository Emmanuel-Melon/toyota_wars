import { describe, expect, it } from "vitest";

import { makeMission } from "../test-fixtures/mission";
import { getNextMission } from "./missions.progression";

describe("getNextMission", () => {
  it("returns the next mission by order", () => {
    const first = { ...makeMission(), id: "first", order: 1 };
    const second = { ...makeMission(), id: "second", order: 2 };
    const third = { ...makeMission(), id: "third", order: 3 };

    expect(getNextMission([third, first, second], first)).toBe(second);
    expect(getNextMission([third, first, second], second)).toBe(third);
    expect(getNextMission([third, first, second], third)).toBeNull();
    expect(getNextMission([first], second)).toBeNull();
  });
});
