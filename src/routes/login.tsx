import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { getDb } from '~/lib/db.server'
import { users } from '~/db/schema'
import { generateTokens } from '~/lib/jwt.server'
import { MangaPanel } from '~/components/ui/MangaPanel'

const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    // Dynamic import for node:* built-ins — prevents Vite from bundling to client
    const [{ checkRateLimit, resetRateLimit }, { verifyPassword }] = await Promise.all([
      import('~/lib/rate-limit.server'),
      import('~/lib/crypto.server'),
    ])

    const key = `login:${data.username.toLowerCase()}`
    const { allowed, retryAfterMs } = checkRateLimit(key)
    if (!allowed) {
      const mins = Math.ceil(retryAfterMs / 60000)
      throw new Error(`Too many attempts. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`)
    }

    const db = getDb()
    const user = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    })

    if (!user) throw new Error('Invalid credentials')

    const valid = await verifyPassword(data.password, user.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    resetRateLimit(key)

    const { refreshToken } = await generateTokens({
      userId: Number(user.id),
      username: user.username,
    })

    setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return { username: user.username }
  })

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginFn({ data: { username, password } })
      router.navigate({ to: '/admin/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-manga-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <MangaPanel thick className="p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-manga-gray-400 mb-1">
            — Admin Access
          </p>
          <h1
            className="text-4xl font-black mb-8 text-manga-black"
            style={{ fontFamily: 'Bangers, cursive' }}
          >
            ANAPHYGON
          </h1>

          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="border-2 border-manga-black">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm font-medium outline-none border-b-2 border-manga-black bg-manga-white"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm font-medium outline-none bg-manga-white"
              />
            </div>

            {error && (
              <p className="text-xs font-bold uppercase tracking-widest text-red-600 pt-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest hover:bg-manga-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Enter →'}
            </button>
          </form>
        </MangaPanel>
      </div>
    </main>
  )
}
