import "./env";
import { sql } from "drizzle-orm";

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to reset a production database.");
  const { db } = await import("../src/db");
  for (const t of ["request_events", "requests", "rescuers", "reporters", "staff", "__drizzle_migrations"]) {
    await db.run(sql.raw(`DROP TABLE IF EXISTS ${t}`));
  }
  console.log("✔ Dropped all tables. Run `npm run db:migrate && npm run db:seed`.");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
