import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || "redis://localhost:6379");

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

/**
 * Cache helper functions
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  ttl: number = 3600
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error("Redis set error:", error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis delete error:", error);
  }
}

export async function clearCacheByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Redis clear pattern error:", error);
  }
}
