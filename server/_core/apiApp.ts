import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerLocalAuthRoutes } from "./localAuth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function registerApiRoutes(app: express.Express) {
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerLocalAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
}

export function createApiApp() {
  const app = express();

  registerApiRoutes(app);

  return app;
}
