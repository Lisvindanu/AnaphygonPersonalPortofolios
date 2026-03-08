import { useState } from 'react'
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

const uploadCvFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { data: string }) => d)
  .handler(async ({ data }) => {
    const { writeFile } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const base64 = data.data.replace(/^data:[^;]+;base64,/, '')
    const buf = Buffer.from(base64, 'base64')
    await writeFile(join(process.cwd(), 'public', 'cv.pdf'), buf)
    return { success: true }
  })

export const Route = createFileRoute('/admin/dashboard')({
  loader: () => getStats(),
  component: Dashboard,
})

function CvUpload() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('uploading')
    const data = await new Promise<string>((res) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result as string)
      reader.readAsDataURL(file)
    })
    try {
      await uploadCvFn({ data: { data } })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <MangaPanel className="p-6 border-2 border-manga-black">
      <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-3">CV / Resume</p>
      <div className="flex items-center gap-4 flex-wrap">
        <label className="cursor-pointer px-4 py-2 border-2 border-manga-black text-xs font-black uppercase tracking-widest hover:bg-manga-black hover:text-manga-white transition-colors">
          {status === 'uploading' ? 'Uploading...' : 'Upload PDF ↑'}
          <input type="file" accept=".pdf" className="hidden" onChange={handleFile} disabled={status === 'uploading'} />
        </label>
        <a href="/cv.pdf" target="_blank" rel="noopener noreferrer"
          className="text-xs font-bold uppercase tracking-widest border-b-2 border-manga-black hover:opacity-60">
          Preview current →
        </a>
        {status === 'done' && <span className="text-xs font-bold uppercase tracking-widest text-green-600">Uploaded!</span>}
        {status === 'error' && <span className="text-xs font-bold uppercase tracking-widest text-red-600">Failed.</span>}
      </div>
    </MangaPanel>
  )
}

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

      <div className="mb-4">
        <CvUpload />
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
