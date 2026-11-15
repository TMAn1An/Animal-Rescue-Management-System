import "./env";
import { migrate } from "drizzle-orm/libsql/migrator";

async function main() {
  const { db } = await import("../src/db");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✔ Database migrated");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
