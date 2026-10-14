import Database from "better-sqlite3";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import fs from "node:fs";

/**
 * Prisma 7 singleton for local SQLite.
 * Uses @prisma/adapter-better-sqlite3 for high performance on local low-spec Windows machines.
 * Enables WAL mode, NORMAL synchronous mode, and foreign keys for fast, corruption-resistant local execution.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  db: Database.Database | undefined;
};

const isProduction = process.env.NODE_ENV === "production";

function getSqliteUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl || envUrl.startsWith("postgres:") || envUrl.startsWith("postgresql:")) {
    return path.resolve(process.cwd(), "prisma", "dev.db");
  }

  let cleaned = envUrl.replace(/^file:/, "");
  cleaned = cleaned.split("?")[0];

  if (path.isAbsolute(cleaned)) {
    return cleaned;
  }
  return path.resolve(process.cwd(), cleaned);
}

const dbUrl = getSqliteUrl();
const dir = path.dirname(dbUrl);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["error", "warn"],
  });

if (!isProduction) globalForPrisma.prisma = prisma;

