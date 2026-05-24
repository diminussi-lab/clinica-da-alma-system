import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const DEFAULT_LOCAL_OPEN_ID = "clinica-da-alma-local-owner";
const DEFAULT_LOCAL_NAME = "Clínica da Alma";

function getSafeReturnTo(req: Request): string {
  const value = req.query.returnTo;

  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";

  return value;
}

export function registerLocalAuthRoutes(app: Express) {
  app.get("/api/local-login", async (req: Request, res: Response) => {
    const openId =
      process.env.LOCAL_AUTH_OPEN_ID ||
      process.env.OWNER_OPEN_ID ||
      DEFAULT_LOCAL_OPEN_ID;
    const name =
      process.env.LOCAL_AUTH_NAME ||
      process.env.OWNER_NAME ||
      DEFAULT_LOCAL_NAME;
    const email = process.env.LOCAL_AUTH_EMAIL || null;
    const returnTo = getSafeReturnTo(req);

    try {
      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "local",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, returnTo);
    } catch (error) {
      console.error("[LocalAuth] Local login failed", error);
      res.status(500).json({
        error: "Local login failed",
        message:
          "Verifique JWT_SECRET e DATABASE_URL na Vercel. Esta rota não usa Manus OAuth.",
      });
    }
  });
}
