import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("appRouter - Routers Defined", () => {
  it("should have appRouter defined", () => {
    expect(appRouter).toBeDefined();
    expect(appRouter._def).toBeDefined();
  });

  it("should have procedures defined", () => {
    const procedures = appRouter._def.procedures;
    expect(procedures).toBeDefined();
    expect(Object.keys(procedures).length).toBeGreaterThan(0);
  });
});
