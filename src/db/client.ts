// Prisma client configured with PostgreSQL adapter
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma";
import { env } from "../config/env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,                  // maximum number of connections in the pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail fast if a connection cannot be acquired in 5s
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
