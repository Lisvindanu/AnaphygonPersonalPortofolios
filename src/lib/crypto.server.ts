import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const KEYLEN = 64

/**
 * Hash a password using scrypt (Node.js built-in).
 * Runs in libuv thread pool — non-blocking.
 * Output format: "salt:hash" (both hex encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, KEYLEN)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Verify a password against a stored hash.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const derivedKey = (await scryptAsync(password, salt, KEYLEN)) as Buffer
  const storedKey = Buffer.from(key, 'hex')
  if (derivedKey.length !== storedKey.length) return false
  return timingSafeEqual(derivedKey, storedKey)
}
