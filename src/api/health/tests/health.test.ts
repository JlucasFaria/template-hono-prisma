// Integration tests for the health check endpoint
import { describe, it, expect } from "bun:test";
import app from "../../../../src/index";

describe("GET /health", () => {
  it("should return 200 with status ok when database is connected", async () => {
    const res = await app.request("/health");

    const body = (await res.json()) as {
      status: string;
      timestamp: string;
      database: string;
    };

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.database).toBe("connected");
  });

  it("should return a valid ISO 8601 timestamp", async () => {
    const res = await app.request("/health");

    const body = (await res.json()) as { timestamp: string };

    // new Date() on an invalid string produces "Invalid Date"
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
  });
});
