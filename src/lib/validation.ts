import { z } from "zod";
import { CONDITIONS, PET_TYPES } from "@/db/schema";
import { DHAKA_AREAS } from "./areas";
import { normalizePhone } from "./phone";

/** Every message is an i18n key under `errors.*`, translated at render time. */
const phone = z.string().transform((v, ctx) => {
  const n = normalizePhone(v);
  if (!n) ctx.addIssue({ code: "custom", message: "phone" });
  return n ?? "";
});

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((v) => (v === "" ? null : v)).nullable().optional();

export const reportSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  phone,
  petType: z.enum(PET_TYPES, "petType"),
  condition: z.enum(CONDITIONS, "condition"),
  area: z.enum(DHAKA_AREAS, "area"),
  address: z.string().trim().min(3, "address").max(255, "address"),
  description: z.string().trim().min(10, "description").max(2000, "description"),
  note: optionalText(1000),
  donation: z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (v === "") return null;
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0 || n > 1_000_000) ctx.addIssue({ code: "custom", message: "donation" });
      return n;
    })
    .nullable()
    .optional(),
});

export const rescuerSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  phone,
  nid: z.string().trim().max(30, "nid").transform((v) => (v === "" ? null : v)).nullable().optional(),
  area: z.string().trim().max(60).transform((v) => (v === "" ? null : v)).nullable().optional(),
  active: z.boolean(),
});

export const reporterSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "name"),
  phone,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("email")),
  password: z.string().min(1).max(200),
});

export type FieldErrors = Partial<Record<string, string>>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
