import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

dotenv.config({ path: path.join(__dirname, ".env") });

/**
 * Prisma 7 configuration file — connection URLs and migration settings.
 * Configured for 100% local zero-config SQLite development & demo.
 */
export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),

  datasource: {
    url:
      process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgres")
        ? process.env.DATABASE_URL
        : "file:./prisma/dev.db",
  },

  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
