import { createFileRoute, Outlet, redirect, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, deleteCookie } from '@tanstack/react-start/server'
import { verifyRefreshToken } from '~/lib/jwt.server'

const getSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const token = getCookie('refresh_token')
  if (!token) return null
  const payload = await verifyRefreshToken(token)
  if (!payload) return null
  return { userId: payload.userId, username: payload.username }
})

const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie('refresh_token', { path: '/' })
  return { success: true }
})

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const router = useRouter()
  const { session } = Route.useRouteContext()

  async function handleLogout() {
    await logoutFn()
    router.navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-manga-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-manga-black flex flex-col shrink-0">
        <div className="p-6 border-b border-manga-gray-800">
          <p className="text-popsicle-300 text-xs uppercase tracking-widest mb-1">Admin</p>
          <img src="/images/popsicle.png" alt="Anaphygon" className="h-10 w-auto invert" />
        </div>

        <nav className="flex-1 py-4">
          {[
            { to: '/admin/dashboard', label: 'Dashboard' },
            { to: '/admin/projects', label: 'Projects' },
            { to: '/admin/skills', label: 'Skills' },
            { to: '/admin/tools', label: 'Tools' },
            { to: '/admin/social', label: 'Social Links' },
            { to: '/admin/messages', label: 'Messages' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center px-6 py-3 text-xs font-bold uppercase tracking-widest text-manga-gray-400 hover:text-manga-white hover:bg-manga-gray-800 transition-colors"
              activeProps={{ className: 'text-manga-white bg-manga-gray-800' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-manga-gray-800 space-y-2">
          <p className="text-xs text-manga-gray-600 px-2">@{session.username}</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-manga-gray-400 hover:text-manga-white hover:bg-manga-gray-800 transition-colors text-left"
          >
            Logout →
          </button>
          <Link
            to="/"
            className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-manga-gray-400 hover:text-manga-white transition-colors"
          >
            ← Portfolio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
