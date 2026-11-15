import { describe, expect, it } from "vitest";
import { parseDhakaLocal, toDhakaLocalInput } from "./format";

describe("dhaka time helpers", () => {
  it("parses local input as UTC+6", () => {
    expect(parseDhakaLocal("2026-01-01T12:00")?.toISOString()).toBe("2026-01-01T06:00:00.000Z");
  });
  it("rejects bad input", () => expect(parseDhakaLocal("tomorrow")).toBeNull());
  it("round-trips for the min attribute", () => {
    expect(toDhakaLocalInput(new Date("2026-01-01T06:00:00Z"))).toBe("2026-01-01T12:00");
  });
});
