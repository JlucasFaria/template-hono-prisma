// Integration tests for the health check endpoint
import { describe, it, expect, spyOn } from "bun:test";
import app from "../../../../src/index";
import prisma from "../../../db/client";

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

  it("should return 503 when database is unreachable", async () => {
    // Mock $queryRaw to simulate a database connection failure.
    // prisma is a singleton, so the same instance is used in health-routes.ts.
    const spy = spyOn(prisma, "$queryRaw").mockRejectedValue(
      new Error("Connection failed"),
    );

    const res = await app.request("/health");
    const body = (await res.json()) as { status: string; database: string };

    expect(res.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.database).toBe("disconnected");

    spy.mockRestore();
  });
});
