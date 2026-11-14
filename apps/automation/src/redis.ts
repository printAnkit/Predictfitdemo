import "dotenv/config";
import { Redis } from "ioredis";

// BullMQ requires this exact setting on the connection it's given.
export const redisConnection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6380",
  { maxRetriesPerRequest: null },
);
