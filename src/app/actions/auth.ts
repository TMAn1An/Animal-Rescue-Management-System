"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

export type LoginState = { error?: "invalid" | "tooMany"; email?: string };

// A real hash so unknown emails cost the same time as wrong passwords.
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("not-a-real-password", 12));

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "");
  const ip = await clientIp();
  if (!rateLimit(`login:ip:${ip}`, 10, 10 * 60_000)) return { error: "tooMany", email };

  const parsed = loginSchema.safeParse({ email, password: String(fd.get("password") ?? "") });
  if (!parsed.success) return { error: "invalid", email };
  if (!rateLimit(`login:acct:${parsed.data.email}`, 8, 10 * 60_000)) return { error: "tooMany", email };

  const [user] = await db.select().from(schema.staff).where(eq(schema.staff.email, parsed.data.email));
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? getDummyHash());
  if (!user || !ok) return { error: "invalid", email };

  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
