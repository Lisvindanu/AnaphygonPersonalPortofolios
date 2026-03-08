import React, { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '~/lib/db.server'
import { socialLinks, type NewSocialLink } from '~/db/schema'
import { MangaPanel } from '~/components/ui/MangaPanel'

const getSocialLinks = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(socialLinks).orderBy(socialLinks.orderIndex)
})

const upsertSocialLink = createServerFn({ method: 'POST' })
  .inputValidator((d: NewSocialLink) => d)
  .handler(async ({ data }) => {
    const db = getDb()
    if (data.id) {
      await db.update(socialLinks).set(data).where(eq(socialLinks.id, data.id))
    } else {
      await db.insert(socialLinks).values(data)
    }
  })

const deleteSocialLink = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await getDb().delete(socialLinks).where(eq(socialLinks.id, data.id))
  })

export const Route = createFileRoute('/admin/social')({
  loader: () => getSocialLinks(),
  component: SocialAdmin,
})

const EMPTY: NewSocialLink = { platform: '', url: '', label: '', orderIndex: 0 }

function SocialAdmin() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [form, setForm] = useState<NewSocialLink | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setLoading(true)
    await upsertSocialLink({ data: form })
    setForm(null)
    setLoading(false)
    router.invalidate()
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-1">— Manage</p>
          <h2 className="text-4xl font-black" style={{ fontFamily: 'Bangers, cursive' }}>SOCIAL LINKS</h2>
        </div>
        <button onClick={() => setForm(EMPTY)} className="px-6 py-2 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity">
          + New
        </button>
      </div>

      <MangaPanel thick className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-4 border-manga-black bg-manga-gray-100">
              {['Platform', 'URL', 'Label', 'Order', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-manga-gray-400 uppercase tracking-widest">No links yet.</td></tr>
            )}
            {data.map((link) => (
              <tr key={link.id} className="border-b-2 border-manga-black hover:bg-manga-gray-100">
                <td className="px-4 py-3 font-bold">{link.platform}</td>
                <td className="px-4 py-3 text-xs text-manga-gray-600 truncate max-w-[160px]">{link.url}</td>
                <td className="px-4 py-3 text-xs">{link.label}</td>
                <td className="px-4 py-3 text-xs text-manga-gray-600">{link.orderIndex}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => setForm(link as NewSocialLink)} className="text-xs font-bold uppercase tracking-widest hover:opacity-60">Edit</button>
                    <button onClick={async () => { if (!confirm('Delete?')) return; await deleteSocialLink({ data: { id: Number(link.id) } }); router.invalidate() }} className="text-xs font-bold uppercase tracking-widest text-red-600 hover:opacity-60">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </MangaPanel>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-manga-black/70 p-4">
          <MangaPanel thick className="w-full max-w-sm p-8">
            <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Bangers, cursive' }}>
              {form.id ? 'EDIT LINK' : 'NEW LINK'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { label: 'Platform *', key: 'platform', required: true, placeholder: 'e.g. GitHub' },
                { label: 'URL *', key: 'url', required: true, placeholder: 'https://...' },
                { label: 'Label', key: 'label', required: false, placeholder: 'e.g. @username' },
              ].map(({ label, key, required, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-manga-gray-600">{label}</label>
                  <input
                    value={(form as unknown as Record<string, string>)[key] ?? ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={required}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border-2 border-manga-black text-sm outline-none focus:bg-manga-gray-100 bg-manga-white"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-manga-gray-600">Order</label>
                <input type="number" value={form.orderIndex ?? 0} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-manga-black text-sm outline-none focus:bg-manga-gray-100 bg-manga-white" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save →'}
                </button>
                <button type="button" onClick={() => setForm(null)} className="px-6 py-3 border-2 border-manga-black text-xs font-black uppercase tracking-widest hover:bg-manga-gray-100">
                  Cancel
                </button>
              </div>
            </form>
          </MangaPanel>
        </div>
      )}
    </div>
  )
}
