import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '~/lib/db.server'
import { contactMessages } from '~/db/schema'
import type { ContactMessage } from '~/db/schema'

const getMessagesFn = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(contactMessages).orderBy(desc(contactMessages.createdAt))
})

const markReadFn = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: { id: number } }) => {
    await getDb().update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, data.id))
    return { success: true }
  })

const deleteMessageFn = createServerFn({ method: 'POST' })
  .handler(async ({ data }: { data: { id: number } }) => {
    await getDb().delete(contactMessages).where(eq(contactMessages.id, data.id))
    return { success: true }
  })

export const Route = createFileRoute('/admin/messages')({
  loader: async () => {
    const messages = await getMessagesFn()
    return { messages }
  },
  component: MessagesPage,
})

function MessagesPage() {
  const { messages: initial } = Route.useLoaderData()
  const [messages, setMessages] = useState<ContactMessage[]>(initial)

  async function handleMarkRead(id: number) {
    await markReadFn({ data: { id } })
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)))
  }

  async function handleDelete(id: number) {
    await deleteMessageFn({ data: { id } })
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const unread = messages.filter((m) => !m.isRead).length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-baseline gap-4">
        <h1 className="text-3xl font-black" style={{ fontFamily: 'Bangers, cursive' }}>
          MESSAGES
        </h1>
        {unread > 0 && (
          <span className="text-xs font-bold uppercase tracking-widest bg-popsicle-500 text-white px-2 py-0.5">
            {unread} unread
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-manga-gray-600">No messages yet.</p>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              message={msg}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MessageCard({
  message,
  onMarkRead,
  onDelete,
}: {
  message: ContactMessage
  onMarkRead: (id: number) => void
  onDelete: (id: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`border-2 border-manga-black p-6 ${!message.isRead ? 'bg-manga-white' : 'bg-manga-gray-100'}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {!message.isRead && (
              <span className="w-2 h-2 bg-popsicle-500 rounded-full flex-shrink-0" />
            )}
            <span className="font-black text-sm uppercase tracking-widest">{message.name}</span>
          </div>
          <a
            href={`mailto:${message.email}`}
            className="text-xs font-mono text-manga-gray-600 hover:text-manga-black border-b border-manga-gray-400"
          >
            {message.email}
          </a>
        </div>
        <span className="text-xs text-manga-gray-400 flex-shrink-0">
          {new Date(message.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>

      <p className={`text-sm text-manga-gray-600 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
        {message.message}
      </p>

      {message.message.length > 200 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs uppercase tracking-widest text-manga-gray-400 hover:text-manga-black mt-1"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <div className="flex gap-4 mt-4 pt-4 border-t border-manga-gray-200">
        {!message.isRead && (
          <button
            onClick={() => onMarkRead(message.id)}
            className="text-xs font-bold uppercase tracking-widest hover:opacity-60"
          >
            Mark read
          </button>
        )}
        <a
          href={`mailto:${message.email}?subject=Re: Portfolio Contact`}
          className="text-xs font-bold uppercase tracking-widest hover:opacity-60"
        >
          Reply →
        </a>
        <button
          onClick={() => onDelete(message.id)}
          className="text-xs font-bold uppercase tracking-widest text-popsicle-500 hover:opacity-60 ml-auto"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
