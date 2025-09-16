import { describe, it, expect, beforeEach, afterEach } from "vitest";
import databaseConfig from "./database.config";

describe("DatabaseConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should load database configuration from environment", () => {
    process.env.SUPABASE_DATABASE_URL =
      "postgresql://user:pass@localhost:5432/mydb?pgbouncer=true";
    process.env.SUPABASE_DIRECT_URL =
      "postgresql://user:pass@localhost:5432/mydb";

    const config = databaseConfig();

    expect(config).toEqual({
      url: "postgresql://user:pass@localhost:5432/mydb?pgbouncer=true",
      directUrl: "postgresql://user:pass@localhost:5432/mydb",
    });
  });

  it("should handle database URLs with different parameters", () => {
    process.env.SUPABASE_DATABASE_URL =
      "postgresql://user:pass@db.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1";
    process.env.SUPABASE_DIRECT_URL =
      "postgresql://user:pass@db.supabase.co:5432/postgres";

    const config = databaseConfig();

    expect(config.url).toContain("pgbouncer=true");
    expect(config.url).toContain("connection_limit=1");
    expect(config.directUrl).not.toContain("pgbouncer");
  });
});
