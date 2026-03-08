import { useState } from 'react'
import { MangaPanel } from '~/components/ui/MangaPanel'
import { useInView } from '~/hooks/useInView'
import type { SocialLink } from '~/db/schema'

interface FooterProps {
  socialLinks: SocialLink[]
  onContact: (data: { name: string; email: string; message: string }) => Promise<{ success: boolean }>
}

function safeHref(url: string): string {
  const trimmed = url.trim()
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('mailto:')) {
    return trimmed
  }
  return '#'
}

export function Footer({ socialLinks, onContact }: FooterProps) {
  const { ref, inView } = useInView()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setStatus('sending')
    try {
      await onContact({ name: name.trim(), email: email.trim(), message: message.trim() })
      setStatus('sent')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <footer ref={ref} id="contact">
      <div
        style={{ animation: inView ? 'manga-slam 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' : 'none', opacity: inView ? undefined : 0 }}
      >
        {/* Original final panel row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          <div className="md:col-span-8">
            <MangaPanel inverted className="p-8 md:p-12 h-full">
              <p className="text-xs uppercase tracking-widest text-manga-gray-400 mb-6">
                — Final Panel
              </p>
              <h2
                className="text-5xl md:text-7xl font-black text-manga-white mb-4 leading-none"
                style={{ fontFamily: 'Bangers, cursive' }}
              >
                LET'S<br />CONNECT.
              </h2>
              <p className="text-manga-gray-400 text-sm max-w-xs leading-relaxed">
                Whether it's a project, a collaboration, or just a conversation —
                I'm always open to what comes next.
              </p>
            </MangaPanel>
          </div>

          <div className="md:col-span-4">
            <MangaPanel thick className="p-6 md:p-8 h-full flex flex-col justify-between">
              <div className="space-y-0">
                {socialLinks.map((link) => (
                  <ContactLink
                    key={link.id}
                    href={safeHref(link.url)}
                    label={link.platform}
                    sub={link.label ?? link.url}
                  />
                ))}
              </div>
              <div className="mt-6 pt-4 border-t-2 border-manga-black">
                <p className="text-xs text-manga-gray-600">
                  © {new Date().getFullYear()} Lisvindanu (Anaphygon)<br />
                  Built with TanStack Start + React
                </p>
              </div>
            </MangaPanel>
          </div>
        </div>

        {/* Contact form row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">

          {/* Jiraiya panel — left */}
          <div className="md:col-span-5 order-2 md:order-1">
            <div className="relative h-64 md:h-full min-h-64 overflow-hidden border-2 border-manga-black border-t-0 md:border-t-2 md:border-r-0">
              <img
                src="/images/NARUTODANJIRAIYA.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-left"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-manga-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-manga-black/10" />
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                <p
                  className="font-black text-manga-white leading-none drop-shadow-lg"
                  style={{ fontFamily: 'Bangers, cursive', fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '0.03em' }}
                >
                  SAY<br />HEL<br />LO.
                </p>
                <p className="text-xs font-mono text-manga-white/60 mt-1">lisvindanu015@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="md:col-span-7 order-1 md:order-2">
            <MangaPanel className="p-8 md:p-10 h-full">
              {status === 'sent' ? (
                <div className="flex flex-col items-start gap-4 h-full justify-center">
                  <div
                    className="border-4 border-popsicle-500 px-8 py-6 inline-block"
                    style={{ transform: 'rotate(-2deg)' }}
                  >
                    <p
                      className="text-popsicle-500 text-4xl font-black leading-none"
                      style={{ fontFamily: 'Bangers, cursive', letterSpacing: '0.05em' }}
                    >
                      MESSAGE<br />RECEIVED!
                    </p>
                    <p className="text-popsicle-500 text-xs uppercase tracking-widest mt-2">
                      — I'll get back to you soon
                    </p>
                  </div>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-xs uppercase tracking-widest text-manga-gray-600 hover:text-manga-black border-b border-manga-gray-400 transition-colors"
                  >
                    Send another →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <p className="text-xs uppercase tracking-widest text-manga-gray-400">— Drop a Message</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-manga-gray-600 mb-1 block">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={100}
                        placeholder="Your name"
                        className="w-full bg-transparent border-b-2 border-manga-black focus:border-popsicle-500 outline-none text-manga-black text-sm py-2 placeholder:text-manga-gray-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-manga-gray-600 mb-1 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        maxLength={255}
                        placeholder="your@email.com"
                        className="w-full bg-transparent border-b-2 border-manga-black focus:border-popsicle-500 outline-none text-manga-black text-sm py-2 placeholder:text-manga-gray-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-manga-gray-600 mb-1 block">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      maxLength={2000}
                      rows={5}
                      placeholder="What's on your mind?"
                      className="w-full bg-transparent border-b-2 border-manga-black focus:border-popsicle-500 outline-none text-manga-black text-sm py-2 placeholder:text-manga-gray-400 transition-colors resize-none"
                    />
                  </div>
                  {status === 'error' && (
                    <p className="text-popsicle-500 text-xs uppercase tracking-widest">
                      Something went wrong. Try again.
                    </p>
                  )}
                  <div>
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="border-4 border-manga-black px-8 py-3 text-manga-black hover:bg-manga-black hover:text-manga-white transition-colors duration-150 disabled:opacity-50"
                      style={{ fontFamily: 'Bangers, cursive', fontSize: '1.5rem', letterSpacing: '0.05em' }}
                    >
                      {status === 'sending' ? 'SENDING...' : 'SEND →'}
                    </button>
                  </div>
                </form>
              )}
            </MangaPanel>
          </div>

        </div>
      </div>
    </footer>
  )
}

function ContactLink({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="flex items-center justify-between p-4 border-b-2 border-manga-black hover:bg-manga-black hover:text-manga-white transition-colors duration-150 group"
    >
      <span className="font-black text-sm uppercase tracking-widest">{label}</span>
      <span className="text-xs text-manga-gray-600 group-hover:text-manga-gray-400 font-mono">
        {sub} →
      </span>
    </a>
  )
}
