import type { Redis } from 'ioredis';

const LUA_SLIDING_WINDOW = `
-- KEYS[1] = key
-- ARGV[1] = now (ms)
-- ARGV[2] = window (ms)
-- ARGV[3] = limit
local key     = KEYS[1]
local now     = tonumber(ARGV[1])
local window  = tonumber(ARGV[2])
local limit   = tonumber(ARGV[3])

-- purge old timestamps outside the window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

local count = tonumber(redis.call('ZCARD', key))

if count < limit then
  -- allow: add event and set expiry
  redis.call('ZADD', key, now, now)
  redis.call('PEXPIRE', key, window)
  -- remaining = limit - (count + 1)
  local remaining = limit - (count + 1)

  -- compute reset as time until the oldest event exits the window
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local resetIn = 0
  if oldest and oldest[2] then
    resetIn = math.max(0, window - (now - tonumber(oldest[2])))
  end

  return {1, remaining, resetIn}
else
  -- deny: compute retry-after based on oldest timestamp
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local retry = window
  if oldest and oldest[2] then
    retry = math.max(1, window - (now - tonumber(oldest[2])))
  end
  return {0, 0, retry}
end
`;

export type HitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  resetAfterMs: number;
};

export class SlidingWindowLimiter {
  constructor(
    private redis: Redis,
    private windowMs: number,
    private limit: number
  ) {}

  private keyFor(userId: string) {
    return `rl:corn:${userId}`;
  }

  async isAllowed(userId: string): Promise<HitResult> {
    const key = this.keyFor(userId);
    const now = Date.now();
    const [allowed, remaining, delay] = (await this.redis.eval(
      LUA_SLIDING_WINDOW,
      1,
      key,
      now,
      this.windowMs,
      this.limit
    )) as [number, number, number];

    return {
      allowed: allowed === 1,
      remaining,
      retryAfterMs: allowed === 1 ? 0 : delay,
      resetAfterMs: allowed === 1 ? delay : delay,
    };
  }
}
