import type { Express, Request, Response } from "express";

function getSafeReturnTo(req: Request): string {
  const value = req.query.returnTo;

  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";

  return value;
}

export function registerLocalAuthRoutes(app: Express) {
  app.get("/api/local-login", (req: Request, res: Response) => {
    res.redirect(302, getSafeReturnTo(req));
  });
}
