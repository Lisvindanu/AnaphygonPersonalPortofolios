import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '~/lib/db.server'
import { projects, hardSkills, softSkills } from '~/db/schema'
import { MangaPanel } from '~/components/ui/MangaPanel'

const getStats = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  const [proj, hard, soft] = await Promise.all([
    db.select().from(projects),
    db.select().from(hardSkills),
    db.select().from(softSkills),
  ])
  return { projects: proj.length, hardSkills: hard.length, softSkills: soft.length }
})

export const Route = createFileRoute('/admin/dashboard')({
  loader: () => getStats(),
  component: Dashboard,
})

function Dashboard() {
  const stats = Route.useLoaderData()

  const cards = [
    { label: 'Projects', value: stats.projects },
    { label: 'Hard Skills', value: stats.hardSkills },
    { label: 'Soft Skills', value: stats.softSkills },
  ]

  return (
    <div className="p-8">
      <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-1">— Overview</p>
      <h2
        className="text-4xl font-black text-manga-black mb-8"
        style={{ fontFamily: 'Bangers, cursive' }}
      >
        DASHBOARD
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-8">
        {cards.map((card) => (
          <MangaPanel key={card.label} thick className="p-8">
            <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-2">
              {card.label}
            </p>
            <p
              className="text-6xl font-black text-manga-black"
              style={{ fontFamily: 'Bangers, cursive' }}
            >
              {card.value}
            </p>
          </MangaPanel>
        ))}
      </div>

      <MangaPanel className="p-6 border-2 border-manga-black">
        <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-2">Quick Links</p>
        <div className="flex gap-4 flex-wrap">
          {[
            { href: '/admin/projects', label: 'Manage Projects →' },
            { href: '/admin/skills', label: 'Manage Skills →' },
            { href: '/', label: 'View Portfolio →' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-xs font-bold uppercase tracking-widest border-b-2 border-manga-black hover:opacity-60 transition-opacity"
            >
              {label}
            </a>
          ))}
        </div>
      </MangaPanel>
    </div>
  )
}
