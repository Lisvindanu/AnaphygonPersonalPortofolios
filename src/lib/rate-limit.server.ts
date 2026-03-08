/**
 * In-memory rate limiter for login attempts.
 * 5 attempts per 15 minutes per key (username).
 * Single-server safe — sufficient for a personal portfolio VPS.
 */

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Prune expired entries every 15 minutes to avoid memory leak
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key)
    }
  },
  15 * 60 * 1000,
)

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    store.set(key, entry)
  }

  entry.count++

  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export function resetRateLimit(key: string) {
  store.delete(key)
}
