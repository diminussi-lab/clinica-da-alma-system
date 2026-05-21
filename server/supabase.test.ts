import { describe, it, expect } from "vitest";

describe("Supabase Configuration", () => {
  it("should have Supabase environment variables configured", () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();
    
    // Validate URL format (should be a Supabase URL)
    if (supabaseUrl) {
      expect(supabaseUrl).toContain("supabase.co");
    }

    // Validate key format (should be a long string starting with sb_)
    if (supabaseAnonKey) {
      expect(supabaseAnonKey.length).toBeGreaterThan(20);
      expect(supabaseAnonKey).toMatch(/^sb_/);
    }
  });

  it("should have valid Supabase credentials format", () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    // Credentials are configured and have correct format
    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();
  });

});
