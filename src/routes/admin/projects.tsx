import React, { useState, useRef } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { getDb } from '~/lib/db.server'
import { projects, type NewProject } from '~/db/schema'
import { MangaPanel } from '~/components/ui/MangaPanel'

// ─── Server Functions ────────────────────────────────────────────────────────
const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(projects).orderBy(projects.orderIndex)
})

const upsertProject = createServerFn({ method: 'POST' })
  .inputValidator((d: NewProject) => d)
  .handler(async ({ data }) => {
    const db = getDb()
    if (data.id) {
      await db.update(projects).set(data).where(eq(projects.id, data.id))
    } else {
      await db.insert(projects).values(data)
    }
  })

const deleteProject = createServerFn({ method: 'POST' })
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await getDb().delete(projects).where(eq(projects.id, data.id))
  })

const uploadImageFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { name: string; data: string }) => d)
  .handler(async ({ data }) => {
    const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
    const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

    const [{ writeFile, mkdir }, { join, extname }, sharp] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
      import('sharp'),
    ])

    const ext = extname(data.name).toLowerCase() || '.jpg'
    if (!ALLOWED_EXT.has(ext)) throw new Error('File type not allowed')

    const base64 = data.data.replace(/^data:[^;]+;base64,/, '')
    const input = Buffer.from(base64, 'base64')
    if (input.length > MAX_BYTES) throw new Error('File too large (max 10 MB)')

    const webpBuffer = await sharp.default(input).webp({ quality: 85 }).toBuffer()

    const filename = `${Date.now()}.webp`
    const dir = join(process.cwd(), 'public', 'images', 'projects')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, filename), webpBuffer)
    return `/images/projects/${filename}`
  })

// ─── Route ───────────────────────────────────────────────────────────────────
export const Route = createFileRoute('/admin/projects')({
  loader: () => getProjects(),
  component: ProjectsAdmin,
})

const EMPTY: NewProject = {
  title: '',
  description: '',
  techStack: [],
  imageUrl: '',
  images: [],
  repoUrl: '',
  liveUrl: '',
  isFeatured: false,
  orderIndex: 0,
}

function ProjectsAdmin() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [form, setForm] = useState<NewProject>(EMPTY)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tagInput, setTagInput] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setForm(EMPTY)
    setTagInput('')
    setEditing(true)
  }

  function openEdit(p: NewProject) {
    setForm({ ...p, techStack: p.techStack ?? [] })
    setTagInput('')
    setEditing(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await upsertProject({ data: form })
    setEditing(false)
    setLoading(false)
    router.invalidate()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this project?')) return
    await deleteProject({ data: { id } })
    router.invalidate()
  }

  function addTag(raw: string) {
    const tag = raw.trim()
    if (!tag) return
    const current = form.techStack ?? []
    if (current.includes(tag)) return
    setForm({ ...form, techStack: [...current, tag] })
  }

  function removeTag(tag: string) {
    setForm({ ...form, techStack: (form.techStack ?? []).filter((t) => t !== tag) })
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
      setTagInput('')
    }
  }

  function handleTagInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Prevent comma character from being typed
    const val = e.target.value.replace(/,/g, '')
    setTagInput(val)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = ev.target?.result as string
        const url = await uploadImageFn({ data: { name: file.name, data } })
        setForm((prev) => ({ ...prev, imageUrl: url }))
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = ev.target?.result as string
        const url = await uploadImageFn({ data: { name: file.name, data } })
        setForm((prev) => ({ ...prev, images: [...(prev.images ?? []), url] }))
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-1">— Manage</p>
          <h2 className="text-4xl font-black" style={{ fontFamily: 'Bangers, cursive' }}>
            PROJECTS
          </h2>
        </div>
        <button
          onClick={openNew}
          className="px-6 py-2 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          + New
        </button>
      </div>

      {/* Table */}
      <MangaPanel thick className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-4 border-manga-black bg-manga-gray-100">
              {['Title', 'Featured', 'Repo', 'Live', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-xs text-manga-gray-400 uppercase tracking-widest">
                  No projects yet.
                </td>
              </tr>
            )}
            {data.map((p) => (
              <tr key={p.id} className="border-b-2 border-manga-black hover:bg-manga-gray-100">
                <td className="px-4 py-3 font-bold">{p.title}</td>
                <td className="px-4 py-3 text-xs">{p.isFeatured ? '★ Yes' : '—'}</td>
                <td className="px-4 py-3 text-xs text-manga-gray-600 truncate max-w-[120px]">{p.repoUrl || '—'}</td>
                <td className="px-4 py-3 text-xs text-manga-gray-600 truncate max-w-[120px]">{p.liveUrl || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(p as NewProject)} className="text-xs font-bold uppercase tracking-widest hover:opacity-60">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(Number(p.id))} className="text-xs font-bold uppercase tracking-widest text-red-600 hover:opacity-60">
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </MangaPanel>

      {/* Modal / Form */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-manga-black/70 p-4">
          <MangaPanel thick className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-8">
            <h3 className="text-2xl font-black mb-6" style={{ fontFamily: 'Bangers, cursive' }}>
              {form.id ? 'EDIT PROJECT' : 'NEW PROJECT'}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <Field label="Title *" required>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>

              {/* Tech Stack chip input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-manga-gray-600">
                  Tech Stack
                </label>
                <div className="w-full px-3 py-2 border-2 border-manga-black bg-manga-white min-h-[42px] flex flex-wrap gap-1">
                  {(form.techStack ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 border border-manga-black font-mono bg-manga-gray-100"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:opacity-60 font-bold leading-none"
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput('') } }}
                    placeholder="Type and press comma or Enter..."
                    className="flex-1 min-w-[160px] text-sm outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-manga-gray-600">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 border-2 border-manga-black text-xs font-black uppercase tracking-widest hover:bg-manga-gray-100 disabled:opacity-50 transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <input
                  value={form.imageUrl ?? ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="or paste URL..."
                  className="w-full mt-2 px-3 py-2 border-2 border-manga-black text-sm outline-none focus:bg-manga-gray-100 bg-manga-white"
                />
                {form.imageUrl && (
                  <p className="text-xs text-manga-gray-600 mt-1 break-all">{form.imageUrl}</p>
                )}
                {uploadError && (
                  <p className="text-xs font-bold uppercase tracking-widest text-red-600 mt-2">{uploadError}</p>
                )}
              </div>

              {/* Gallery images */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-manga-gray-600">
                  Gallery Images
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.images ?? []).map((url, idx) => (
                    <div key={idx} className="relative w-20 h-14 border-2 border-manga-black overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, images: (form.images ?? []).filter((_, i) => i !== idx) })}
                        className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center font-bold leading-none"
                        aria-label="Remove"
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-20 h-14 border-2 border-dashed border-manga-black flex items-center justify-center text-xl text-manga-gray-400 hover:bg-manga-gray-100 disabled:opacity-50"
                  >+</button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={galleryInputRef}
                  onChange={handleGalleryUpload}
                />
              </div>

              <Field label="Repo URL">
                <input value={form.repoUrl ?? ''} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} />
              </Field>
              <Field label="Live URL">
                <input value={form.liveUrl ?? ''} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} />
              </Field>
              <Field label="Order">
                <input type="number" value={form.orderIndex ?? 0} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })} />
              </Field>
              <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured ?? false}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4"
                />
                Featured
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-manga-black text-manga-white text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save →'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 border-2 border-manga-black text-xs font-black uppercase tracking-widest hover:bg-manga-gray-100"
                >
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { required?: boolean }> }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-1 text-manga-gray-600">
        {label}
      </label>
      {React.cloneElement(children, {
        className: 'w-full px-3 py-2 border-2 border-manga-black text-sm outline-none focus:bg-manga-gray-100 bg-manga-white resize-none',
        required,
      })}
    </div>
  )
}
