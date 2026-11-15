import { describe, expect, it } from "vitest";
import { canTransition, compareByUrgency, generateTrackingCode, isOverdue, TRACKING_CODE_RE, validCoords, validPhotoDataUrl } from "./workflow";

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

  it("flags overdue pending requests by severity", () => {
    const now = Date.now();
    const ago = (m: number) => new Date(now - m * 60_000);
    expect(isOverdue({ status: "pending", condition: "serious", createdAt: ago(45) }, now)).toBe(true);
    expect(isOverdue({ status: "pending", condition: "serious", createdAt: ago(10) }, now)).toBe(false);
    expect(isOverdue({ status: "pending", condition: "normal", createdAt: ago(300) }, now)).toBe(false);
    expect(isOverdue({ status: "assigned", condition: "serious", createdAt: ago(999) }, now)).toBe(false);
  });

  it("validates coordinates", () => {
    expect(validCoords(23.8103, 90.4125)).toBe(true);
    expect(validCoords(51.5, -0.12)).toBe(false);
    expect(validCoords(NaN, 90)).toBe(false);
  });

  it("validates JPEG data URLs", () => {
    const jpeg = "data:image/jpeg;base64," + Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]).toString("base64");
    expect(validPhotoDataUrl(jpeg)).toBe(true);
    expect(validPhotoDataUrl("data:image/png;base64,AAAA")).toBe(false);
    expect(validPhotoDataUrl("data:image/jpeg;base64," + Buffer.from("not a jpeg at all").toString("base64"))).toBe(false);
    expect(validPhotoDataUrl(jpeg + "A".repeat(500_000))).toBe(false);
  });
});
