import { existsSync, mkdirSync } from "node:fs";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) process.loadEnvFile(f);
}
// Make sure the folder for a local SQLite file exists.
const url = process.env.DATABASE_URL ?? "file:./data/rescue.db";
if (url.startsWith("file:")) mkdirSync("data", { recursive: true });
process.env.DATABASE_URL = url;
