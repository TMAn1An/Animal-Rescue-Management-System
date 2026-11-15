import { describe, expect, it } from "vitest";
import { reportSchema, toFieldErrors } from "./validation";

const base = {
  name: "Rahim", phone: "+8801712345678", petType: "dog", condition: "serious",
  area: "Dhanmondi", address: "Road 27", description: "Injured dog near the lake.", note: "", donation: "",
};

describe("reportSchema", () => {
  it("normalises valid input", () => {
    const r = reportSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.phone).toBe("01712345678");
      expect(r.data.donation).toBeNull();
      expect(r.data.note).toBeNull();
    }
  });
  it("reports field errors as i18n keys", () => {
    const r = reportSchema.safeParse({ ...base, phone: "123", area: "London", donation: "-5" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error)).toMatchObject({ phone: "phone", area: "area", donation: "donation" });
  });
});
