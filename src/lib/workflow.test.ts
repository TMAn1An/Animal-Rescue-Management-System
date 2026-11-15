import { describe, expect, it } from "vitest";
import { canTransition, compareByUrgency, generateTrackingCode, TRACKING_CODE_RE } from "./workflow";

describe("workflow", () => {
  it("allows only valid transitions", () => {
    expect(canTransition("pending", "assigned")).toBe(true);
    expect(canTransition("pending", "completed")).toBe(false);
    expect(canTransition("completed", "pending")).toBe(false);
    expect(canTransition("cancelled", "pending")).toBe(true);
  });

  it("sorts serious and older requests first", () => {
    const list = [
      { id: 1, condition: "normal" as const, createdAt: new Date(1000) },
      { id: 2, condition: "serious" as const, createdAt: new Date(3000) },
      { id: 3, condition: "serious" as const, createdAt: new Date(2000) },
    ];
    expect(list.sort(compareByUrgency).map((r) => r.id)).toEqual([3, 2, 1]);
  });

  it("generates well-formed unique-looking tracking codes", () => {
    const codes = new Set(Array.from({ length: 200 }, () => generateTrackingCode()));
    expect(codes.size).toBeGreaterThan(195);
    for (const c of codes) expect(c).toMatch(TRACKING_CODE_RE);
  });
});
