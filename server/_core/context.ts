import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const LOCAL_OPEN_ID =
  process.env.LOCAL_AUTH_OPEN_ID ||
  process.env.OWNER_OPEN_ID ||
  "clinica-da-alma-local-owner";

const LOCAL_NAME =
  process.env.LOCAL_AUTH_NAME ||
  process.env.OWNER_NAME ||
  "Clínica da Alma";

const LOCAL_EMAIL = process.env.LOCAL_AUTH_EMAIL || null;

const AUTH_DB_TIMEOUT_MS = Number(process.env.AUTH_DB_TIMEOUT_MS || 1500);

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

function buildFallbackLocalUser(): User {
  const now = new Date();

  return {
    id: 1,
    openId: LOCAL_OPEN_ID,
    name: LOCAL_NAME,
    email: LOCAL_EMAIL,
    loginMethod: "local",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
}

async function loadLocalUserFromDatabase(): Promise<User | undefined> {
  await db.upsertUser({
    openId: LOCAL_OPEN_ID,
    name: LOCAL_NAME,
    email: LOCAL_EMAIL,
    loginMethod: "local",
    role: "admin",
    lastSignedIn: new Date(),
  });

  return db.getUserByOpenId(LOCAL_OPEN_ID);
}

async function getLocalUser(): Promise<User> {
  try {
    if (process.env.VERCEL && process.env.USE_DB_AUTH_BOOTSTRAP !== "true") {
      return buildFallbackLocalUser();
    }

    const user = await withTimeout(
      loadLocalUserFromDatabase(),
      AUTH_DB_TIMEOUT_MS,
      "Local auth database bootstrap"
    );

    if (user) return user;
  } catch (error) {
    console.warn("[LocalAuth] Using fallback local user because database lookup failed or timed out", error);
  }

  return buildFallbackLocalUser();
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = await getLocalUser();

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
