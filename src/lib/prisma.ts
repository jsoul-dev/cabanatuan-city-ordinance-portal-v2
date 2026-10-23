import Database from "better-sqlite3";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import fs from "node:fs";

/**
 * Prisma 7 singleton for local SQLite.
 * Uses @prisma/adapter-better-sqlite3 for high performance on local low-spec machines and Linux containers.
 * Actively configures WAL mode, NORMAL synchronous mode, foreign keys, and 5000ms busy timeout.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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

// Enforce WAL mode, NORMAL synchronous mode, busy timeout, and foreign keys on SQLite handle
try {
  const initDb = new Database(dbUrl, { timeout: 5000 });
  initDb.pragma("journal_mode = WAL");
  initDb.pragma("synchronous = NORMAL");
  initDb.pragma("busy_timeout = 5000");
  initDb.pragma("foreign_keys = ON");
  initDb.close();
} catch (pragmaErr) {
  console.error("Failed to initialize SQLite WAL pragmas:", pragmaErr);
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl, timeout: 5000 });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: isProduction ? ["error"] : ["error", "warn"],
  });

if (!isProduction) globalForPrisma.prisma = prisma;
