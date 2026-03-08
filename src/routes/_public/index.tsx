import { useState, useEffect, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { asc } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '~/lib/db.server'
import { hardSkills as hardSkillsTable, softSkills as softSkillsTable, projects as projectsTable, tools as toolsTable, socialLinks as socialLinksTable, contactMessages as contactMessagesTable } from '~/db/schema'
import { PopsicleSplit } from '~/components/animations/PopsicleSplit'
import { Hero } from '~/components/sections/Hero'
import { About } from '~/components/sections/About'
import { HardSkills } from '~/components/sections/HardSkills'
import { SoftSkills } from '~/components/sections/SoftSkills'
import { Projects } from '~/components/sections/Projects'
import { Tools } from '~/components/sections/Tools'
import { MangaBreak } from '~/components/sections/MangaBreak'
import { Footer } from '~/components/layout/Footer'

const getHardSkills = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(hardSkillsTable).orderBy(asc(hardSkillsTable.orderIndex))
})

const getSoftSkills = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(softSkillsTable).orderBy(asc(softSkillsTable.orderIndex))
})

const getProjects = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(projectsTable).orderBy(asc(projectsTable.orderIndex))
})

const getTools = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(toolsTable).orderBy(asc(toolsTable.orderIndex))
})

const getSocialLinks = createServerFn({ method: 'GET' }).handler(async () => {
  return getDb().select().from(socialLinksTable).orderBy(asc(socialLinksTable.orderIndex))
})

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().max(255),
  message: z.string().min(1).max(2000),
})

const sendContactFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { name: string; email: string; message: string }) => d)
  .handler(async ({ data }) => {
    const parsed = contactSchema.parse(data)
    await getDb().insert(contactMessagesTable).values(parsed)

    // Send email notification
    try {
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
      await transporter.sendMail({
        from: `"Anaphygon Portfolio" <${process.env.SMTP_USER}>`,
        to: 'lisvindanu015@gmail.com',
        subject: `📬 New message from ${data.name}`,
        text: `From: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
        html: `<p><strong>From:</strong> ${data.name}</p><p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p><hr/><p style="white-space:pre-wrap">${data.message}</p>`,
      })
    } catch {
      // Email failure doesn't break the form submission
    }

    return { success: true }
  })

const SCHEMA_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lisvindanu',
  alternateName: 'Anaphygon',
  url: 'https://anaphygon.my.id',
  sameAs: [
    'https://github.com/Lisvindanu',
    'https://linkedin.com/in/lisvindanu',
  ],
  jobTitle: 'Fullstack & Mobile Developer',
  email: 'lisvindanu@gmail.com',
  knowsAbout: ['React', 'TypeScript', 'Node.js', 'React Native', 'MySQL', 'TanStack'],
})

export const Route = createFileRoute('/_public/')({
  head: () => ({
    scripts: [
      { type: 'application/ld+json', children: SCHEMA_LD },
    ],
  }),
  loader: async () => {
    const [hardSkills, softSkills, projects, tools, socialLinks] = await Promise.all([
      getHardSkills(),
      getSoftSkills(),
      getProjects(),
      getTools(),
      getSocialLinks(),
    ])
    return { hardSkills, softSkills, projects, tools, socialLinks }
  },
  component: HomePage,
})

const NAV_ITEMS = ['About', 'Skills', 'Projects', 'Contact']

function HomePage() {
  const { hardSkills, softSkills, projects, tools, socialLinks } = Route.useLoaderData()

  // Start hidden, useEffect checks sessionStorage after hydration
  const [loaded, setLoaded] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('intro_done') === '1') {
      setLoaded(true)
    } else {
      setShowIntro(true)
    }
  }, [])

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('intro_done', '1')
    setShowIntro(false)
    setLoaded(true)
  }, [])

  return (
    <>
      {showIntro && <PopsicleSplit onComplete={handleIntroComplete} />}

      {loaded && (
          <div
            style={{
              animation: 'fade-in 0.5s ease-out both',
            }}
          >
            {/* Nav bar */}
            <nav className="fixed top-0 left-0 right-0 z-40 border-b-2 border-manga-black bg-manga-white">
              <div className="flex items-center justify-between px-6 h-12">
                <img src="/images/popsicle.png" alt="Anaphygon" className="h-8 w-auto" />

                {/* Desktop nav links */}
                <div className="hidden md:flex items-center gap-0">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="px-4 py-3 text-xs font-bold uppercase tracking-widest border-l-2 border-manga-black hover:bg-manga-black hover:text-manga-white transition-colors duration-150"
                    >
                      {item}
                    </a>
                  ))}
                </div>

                {/* Hamburger button — mobile only */}
                <button
                  className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                >
                  {menuOpen ? (
                    <>
                      <span
                        className="block w-6 h-0.5 bg-manga-black transition-transform duration-200"
                        style={{ transform: 'translateY(5.5px) rotate(45deg)' }}
                      />
                      <span
                        className="block w-6 h-0.5 bg-manga-black transition-transform duration-200"
                        style={{ transform: 'translateY(-5.5px) rotate(-45deg)' }}
                      />
                    </>
                  ) : (
                    <>
                      <span className="block w-6 h-0.5 bg-manga-black" />
                      <span className="block w-6 h-0.5 bg-manga-black" />
                      <span className="block w-6 h-0.5 bg-manga-black" />
                    </>
                  )}
                </button>
              </div>
            </nav>

            {/* Mobile sidebar overlay */}
            {menuOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/50"
                onClick={() => setMenuOpen(false)}
              />
            )}

            {/* Mobile sidebar panel */}
            <div
              className="fixed top-0 left-0 h-full w-64 z-50 bg-manga-white border-r-4 border-manga-black flex flex-col"
              style={{
                transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 300ms ease-out',
              }}
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-6 h-12 border-b-2 border-manga-black">
                <img src="/images/popsicle.png" alt="Anaphygon" className="h-8 w-auto" />
                <button
                  className="text-xl font-black leading-none hover:opacity-60"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>

              {/* Sidebar nav links */}
              <nav className="flex flex-col">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="px-6 py-4 border-b-2 border-manga-black text-xs font-bold uppercase tracking-widest hover:bg-manga-black hover:text-manga-white transition-colors duration-150 w-full"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>

            {/* Content */}
            <main className="pt-12">
              <Hero />
              <About />
              <HardSkills skills={hardSkills} />
              <SoftSkills skills={softSkills} />
              <Tools tools={tools} />
              <MangaBreak />
              <Projects projects={projects} />
              <Footer socialLinks={socialLinks} onContact={(data) => sendContactFn({ data })} />
            </main>
          </div>
      )}
    </>
  )
}
