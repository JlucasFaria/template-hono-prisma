import { Hono } from "hono";
import prisma from "../db/client";

const userRoutes = new Hono();

userRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const newUser = await prisma.user.create({
    data: { email: body.email, name: body.name },
  });
  return c.json(newUser, 201);
});

userRoutes.get("/", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

export default userRoutes;
