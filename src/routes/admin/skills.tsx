import React, { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '~/lib/db.server'
import { hardSkills, softSkills, SKILL_LEVELS, type NewHardSkill, type NewSoftSkill } from '~/db/schema'
import { MangaPanel } from '~/components/ui/MangaPanel'

// ─── Server Functions ────────────────────────────────────────────────────────
const getSkills = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  const [hard, soft] = await Promise.all([
    db.select().from(hardSkills).orderBy(hardSkills.orderIndex),
    db.select().from(softSkills).orderBy(softSkills.orderIndex),
  ])
  return { hard, soft }
})

const upsertHard = createServerFn({ method: 'POST' })
  .inputValidator((d: NewHardSkill) => d)
  .handler(async ({ data }) => {
    const db = getDb()
    if (data.id) {
      await db.update(hardSkills).set(data).where(eq(hardSkills.id, data.id))
    } else {
      await db.insert(hardSkills).values(data)
    }
  })

const deleteHard = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await getDb().delete(hardSkills).where(eq(hardSkills.id, data.id))
  })

const upsertSoft = createServerFn({ method: 'POST' })
  .inputValidator((d: NewSoftSkill) => d)
  .handler(async ({ data }) => {
    const db = getDb()
    if (data.id) {
      await db.update(softSkills).set(data).where(eq(softSkills.id, data.id))
    } else {
      await db.insert(softSkills).values(data)
    }
  })

const deleteSoft = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await getDb().delete(softSkills).where(eq(softSkills.id, data.id))
  })

// ─── Route ───────────────────────────────────────────────────────────────────
export const Route = createFileRoute('/admin/skills')({
  loader: () => getSkills(),
  component: SkillsAdmin,
})

const CATEGORIES = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Database', 'Other'] as const

const EMPTY_HARD: NewHardSkill = { name: '', category: 'Frontend', level: 'Intermediate', orderIndex: 0 }
const EMPTY_SOFT: NewSoftSkill = { name: '', description: '', orderIndex: 0 }

function SkillsAdmin() {
  const { hard, soft } = Route.useLoaderData()
  const router = useRouter()

  const [hardForm, setHardForm] = useState<NewHardSkill | null>(null)
  const [softForm, setSoftForm] = useState<NewSoftSkill | null>(null)
  const [loading, setLoading] = useState(false)

  async function saveHard(e: React.FormEvent) {
    e.preventDefault()
    if (!hardForm) return
    setLoading(true)
    await upsertHard({ data: hardForm })
    setHardForm(null)
    setLoading(false)
    router.invalidate()
  }

  async function saveSoft(e: React.FormEvent) {
    e.preventDefault()
    if (!softForm) return
    setLoading(true)
    await upsertSoft({ data: softForm })
    setSoftForm(null)
    setLoading(false)
    router.invalidate()
  }

  return (
    <div className="p-8 space-y-10">
      {/* ── Hard Skills ── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-1">— Manage</p>
            <h2 className="text-4xl font-black" style={{ fontFamily: 'Bangers, cursive' }}>
              HARD SKILLS
            </h2>
          </div>
          <button
            onClick={() => setHardForm(EMPTY_HARD)}
            className="px-6 py-2 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            + New
          </button>
        </div>

        <MangaPanel thick className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-4 border-manga-black bg-manga-gray-100">
                {['Name', 'Category', 'Level', 'Order', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hard.map((s) => (
                <tr key={s.id} className="border-b-2 border-manga-black hover:bg-manga-gray-100">
                  <td className="px-4 py-3 font-bold">{s.name}</td>
                  <td className="px-4 py-3 text-xs">{s.category}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs border border-manga-black px-2 py-0.5 uppercase tracking-widest">
                      {s.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-manga-gray-600">{s.orderIndex}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setHardForm(s as NewHardSkill)} className="text-xs font-bold uppercase tracking-widest hover:opacity-60">Edit</button>
                      <button onClick={async () => { if (!confirm('Delete?')) return; await deleteHard({ data: { id: Number(s.id) } }); router.invalidate() }} className="text-xs font-bold uppercase tracking-widest text-red-600 hover:opacity-60">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MangaPanel>
      </section>

      {/* ── Soft Skills ── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-1">— Manage</p>
            <h2 className="text-4xl font-black" style={{ fontFamily: 'Bangers, cursive' }}>
              SOFT SKILLS
            </h2>
          </div>
          <button
            onClick={() => setSoftForm(EMPTY_SOFT)}
            className="px-6 py-2 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            + New
          </button>
        </div>

        <MangaPanel thick className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-4 border-manga-black bg-manga-gray-100">
                {['Name', 'Description', 'Order', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {soft.map((s) => (
                <tr key={s.id} className="border-b-2 border-manga-black hover:bg-manga-gray-100">
                  <td className="px-4 py-3 font-bold">{s.name}</td>
                  <td className="px-4 py-3 text-xs text-manga-gray-600 max-w-xs truncate">{s.description}</td>
                  <td className="px-4 py-3 text-xs text-manga-gray-600">{s.orderIndex}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setSoftForm(s as NewSoftSkill)} className="text-xs font-bold uppercase tracking-widest hover:opacity-60">Edit</button>
                      <button onClick={async () => { if (!confirm('Delete?')) return; await deleteSoft({ data: { id: Number(s.id) } }); router.invalidate() }} className="text-xs font-bold uppercase tracking-widest text-red-600 hover:opacity-60">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MangaPanel>
      </section>

      {/* ── Hard Skill Modal ── */}
      {hardForm && (
        <Modal title={hardForm.id ? 'EDIT HARD SKILL' : 'NEW HARD SKILL'} onClose={() => setHardForm(null)}>
          <form onSubmit={saveHard} className="space-y-3">
            <Field label="Name *">
              <input value={hardForm.name} onChange={(e) => setHardForm({ ...hardForm, name: e.target.value })} required />
            </Field>
            <Field label="Category">
              <select value={hardForm.category ?? 'Frontend'} onChange={(e) => setHardForm({ ...hardForm, category: e.target.value as NewHardSkill['category'] })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Level">
              <select value={hardForm.level ?? 'Intermediate'} onChange={(e) => setHardForm({ ...hardForm, level: e.target.value as NewHardSkill['level'] })}>
                {SKILL_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Order">
              <input type="number" value={hardForm.orderIndex ?? 0} onChange={(e) => setHardForm({ ...hardForm, orderIndex: Number(e.target.value) })} />
            </Field>
            <ModalActions loading={loading} onCancel={() => setHardForm(null)} />
          </form>
        </Modal>
      )}

      {/* ── Soft Skill Modal ── */}
      {softForm && (
        <Modal title={softForm.id ? 'EDIT SOFT SKILL' : 'NEW SOFT SKILL'} onClose={() => setSoftForm(null)}>
          <form onSubmit={saveSoft} className="space-y-3">
            <Field label="Name *">
              <input value={softForm.name} onChange={(e) => setSoftForm({ ...softForm, name: e.target.value })} required />
            </Field>
            <Field label="Description">
              <textarea rows={3} value={softForm.description ?? ''} onChange={(e) => setSoftForm({ ...softForm, description: e.target.value })} />
            </Field>
            <Field label="Order">
              <input type="number" value={softForm.orderIndex ?? 0} onChange={(e) => setSoftForm({ ...softForm, orderIndex: Number(e.target.value) })} />
            </Field>
            <ModalActions loading={loading} onCancel={() => setSoftForm(null)} />
          </form>
        </Modal>
      )}
    </div>
  )
}

// ─── Shared UI ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-manga-black/70 p-4">
      <MangaPanel thick className="w-full max-w-md max-h-[90vh] overflow-y-auto p-8">
        <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Bangers, cursive' }}>{title}</h3>
        {children}
      </MangaPanel>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactElement<React.HTMLAttributes<HTMLElement>> }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-manga-gray-600">{label}</label>
      {React.cloneElement(children, {
        className: 'w-full px-3 py-2 border-2 border-manga-black text-sm outline-none focus:bg-manga-gray-100 bg-manga-white resize-none',
      })}
    </div>
  )
}

function ModalActions({ loading, onCancel }: { loading: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-3 pt-4">
      <button type="submit" disabled={loading} className="flex-1 py-3 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest disabled:opacity-50">
        {loading ? 'Saving...' : 'Save →'}
      </button>
      <button type="button" onClick={onCancel} className="px-6 py-3 border-2 border-manga-black text-xs font-black uppercase tracking-widest hover:bg-manga-gray-100">
        Cancel
      </button>
    </div>
  )
}
