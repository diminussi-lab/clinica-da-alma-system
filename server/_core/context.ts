import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";
import { getConfiguredLocalCredentials, verifyLocalSessionToken } from "./localSession";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

async function getUserFromSession(token?: string): Promise<User | null> {
  const session = verifyLocalSessionToken(token);
  if (!session) return null;

  const credentials = getConfiguredLocalCredentials();
  const openId = session.openId || credentials.openId;

  try {
    await db.upsertUser({
      openId,
      name: credentials.name,
      email: credentials.email,
      loginMethod: "local",
      role: "admin",
      lastSignedIn: new Date(),
    });

    const user = await db.getUserByOpenId(openId);
    if (user) return user;
  } catch (error) {
    console.error("[Auth] Não foi possível carregar usuário da sessão local:", error);
  }

  return null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const token = opts.req.cookies?.[COOKIE_NAME] as string | undefined;
  const user = await getUserFromSession(token);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
