// Health check route: verifies server and database connectivity
import { Hono } from "hono";
import prisma from "../../db/client";

const healthRoutes = new Hono();

healthRoutes.get("/", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      200,
    );
  } catch {
    return c.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      503,
    );
  }
});

export default healthRoutes;
