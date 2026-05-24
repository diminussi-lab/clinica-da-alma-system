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

async function getLocalUser(): Promise<User> {
  try {
    await db.upsertUser({
      openId: LOCAL_OPEN_ID,
      name: LOCAL_NAME,
      email: LOCAL_EMAIL,
      loginMethod: "local",
      role: "admin",
      lastSignedIn: new Date(),
    });

    const user = await db.getUserByOpenId(LOCAL_OPEN_ID);
    if (user) return user;
  } catch (error) {
    console.warn("[LocalAuth] Using fallback local user because database lookup failed", error);
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
