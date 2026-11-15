import "./env";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const DAY = 86_400_000;

async function main() {
  const { db, schema } = await import("../src/db");
  const { staff, reporters, rescuers, requests, requestEvents } = schema;

  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "change-this-password";
  if (process.env.NODE_ENV === "production" && password === "change-this-password") {
    throw new Error("Set ADMIN_PASSWORD before seeding a production database.");
  }

  const existing = await db.select().from(staff).where(eq(staff.email, email));
  if (existing.length === 0) {
    await db.insert(staff).values({ email, name: "Administrator", passwordHash: await bcrypt.hash(password, 12) });
    console.log(`✔ Admin created: ${email}`);
  } else {
    console.log(`• Admin already exists: ${email}`);
  }

  if (process.env.SEED_DEMO === "false") return;
  const hasData = await db.select().from(reporters).limit(1);
  if (hasData.length > 0) {
    console.log("• Demo data already present, skipping");
    return;
  }

  const [r1, r2, r3] = await db
    .insert(reporters)
    .values([
      { name: "Rahim Uddin", phone: "01712345678" },
      { name: "Nusrat Jahan", phone: "01798765432" },
      { name: "Mahmud Hasan", phone: "01656789012" },
    ])
    .returning();
  const [s1, s2] = await db
    .insert(rescuers)
    .values([
      { name: "Sarah Wilson", phone: "01634567890", area: "Dhanmondi", nid: "1234567890123" },
      { name: "Tanvir Ahmed", phone: "01723456789", area: "Uttara", nid: "9876543210987" },
    ])
    .returning();

  const ago = (d: number) => new Date(Date.now() - d * DAY);
  const created = await db
    .insert(requests)
    .values([
      { code: "AR-DEMO01", reporterId: r1.id, petType: "dog", condition: "serious", area: "Dhanmondi", address: "Road 27, near the lake",
        description: "Injured dog bleeding from a leg, unable to walk.", note: "Needs a vet urgently.", donationAmount: 500,
        status: "assigned", rescuerId: s1.id, eta: new Date(Date.now() + 3_600_000), assignedAt: ago(0.1), createdAt: ago(0.2), updatedAt: ago(0.1) },
      { code: "AR-DEMO02", reporterId: r1.id, petType: "cat", condition: "normal", area: "Gulshan", address: "Gulshan 2, behind the market",
        description: "Very thin stray cat that keeps looking for food.", createdAt: ago(1), updatedAt: ago(1) },
      { code: "AR-DEMO03", reporterId: r2.id, petType: "bird", condition: "moderate", area: "Uttara", address: "Sector 7 park",
        description: "Pigeon with a broken wing, cannot fly.", donationAmount: 200, status: "completed", rescuerId: s2.id,
        assignedAt: ago(2), completedAt: ago(1.5), outcome: "Wing splinted by a vet. Released after a week of recovery.", createdAt: ago(2.2), updatedAt: ago(1.5) },
      { code: "AR-DEMO04", reporterId: r3.id, petType: "dog", condition: "serious", area: "Mirpur", address: "Mirpur 10 circle",
        description: "Small puppy alone and scared, shivering in the rain.", donationAmount: 100, createdAt: ago(0.05), updatedAt: ago(0.05) },
    ])
    .returning();

  await db.insert(requestEvents).values([
    ...created.map((r) => ({ requestId: r.id, type: "created" as const, message: null, createdAt: r.createdAt })),
    { requestId: created[0].id, type: "assigned" as const, message: "Assigned to Sarah Wilson", createdAt: ago(0.1) },
    { requestId: created[2].id, type: "assigned" as const, message: "Assigned to Tanvir Ahmed", createdAt: ago(2) },
    { requestId: created[2].id, type: "completed" as const, message: "Wing splinted by a vet. Released after a week of recovery.", createdAt: ago(1.5) },
  ]);
  console.log("✔ Demo data inserted");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
