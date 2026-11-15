import { describe, expect, it } from "vitest";
import { maskPhone, normalizePhone } from "./phone";

describe("normalizePhone", () => {
  it("accepts local, +880 and 880 forms", () => {
    expect(normalizePhone("01712345678")).toBe("01712345678");
    expect(normalizePhone("+880 1712-345678")).toBe("01712345678");
    expect(normalizePhone("8801712345678")).toBe("01712345678");
  });
  it("accepts Bangla digits", () => {
    expect(normalizePhone("০১৭১২৩৪৫৬৭৮")).toBe("01712345678");
  });
  it("rejects invalid numbers", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("01212345678")).toBeNull();
  });
  it("masks", () => expect(maskPhone("01712345678")).toBe("017•••••678"));
});
