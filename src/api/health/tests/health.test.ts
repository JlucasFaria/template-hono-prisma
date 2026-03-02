// Integration tests for the health check endpoint
import { describe, it, expect } from "bun:test";
import app from "../../../../src/index";

describe("Smoke tests", () => {
  it("should return 200 with 'Server is running!' for GET /", async () => {
    const res = await app.request("/");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Server is running!");
  });

  it("should return 200 for GET /ui", async () => {
    const res = await app.request("/ui");

    expect(res.status).toBe(200);
  });

  it("should return 200 with a valid OpenAPI spec for GET /doc", async () => {
    const res = await app.request("/doc");
    const body = (await res.json()) as { openapi: string };

    expect(res.status).toBe(200);
    expect(body.openapi).toBe("3.0.0");
  });
});

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

  // NOTE: The 503 scenario (database unreachable) is not covered here because
  // Prisma's $queryRaw is implemented as a prototype getter, which prevents
  // spyOn from intercepting it. Proper testing would require injecting the
  // prisma client as a parameter into health-routes (dependency injection).
});
