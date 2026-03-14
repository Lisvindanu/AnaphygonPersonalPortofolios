/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import appCss from '~/styles/app.css?url'

type LogEntry = { timestamp: string; level: string; message: string; data?: string }

const writeLogBatchFn = createServerFn({ method: 'POST' })
  .inputValidator((d: { entries: LogEntry[] }) => d)
  .handler(async ({ data }) => {
    const [{ appendFile, mkdir }, { join }] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
    ])
    const dir = join(process.cwd(), 'logs')
    await mkdir(dir, { recursive: true })
    const lines = data.entries
      .map((e) => `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.message}${e.data ? ' ' + e.data : ''}`)
      .join('\n') + '\n'
    await appendFile(join(dir, 'app.log'), lines, 'utf8')
  })

const SITE_URL = 'https://anaphygon.my.id'
const OG_IMAGE = `${SITE_URL}/og-image.png`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Anaphygon — Lisvindanu' },
      { name: 'description', content: 'Portfolio of Lisvindanu (Anaphygon) — Fullstack & Mobile Developer.' },
      { name: 'author', content: 'Lisvindanu' },
      { name: 'theme-color', content: '#111111' },
      { name: 'keywords', content: 'Lisvindanu, Anaphygon, fullstack developer, mobile developer, React, TypeScript, React Native, portfolio, Indonesia, web developer' },
      { name: 'robots', content: 'index, follow' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:title', content: 'Anaphygon — Lisvindanu' },
      { property: 'og:description', content: 'Portfolio of Lisvindanu (Anaphygon) — Fullstack & Mobile Developer.' },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:site_name', content: 'Anaphygon' },
      { property: 'og:locale', content: 'en_US' },
      // Twitter / X
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Anaphygon — Lisvindanu' },
      { name: 'twitter:description', content: 'Portfolio of Lisvindanu (Anaphygon) — Fullstack & Mobile Developer.' },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'canonical', href: SITE_URL },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Bangers&display=swap' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  useEffect(() => {
    import('~/lib/logger').then(({ initLogger, flushBufferedLogs }) => {
      initLogger(writeLogBatchFn)
      flushBufferedLogs(writeLogBatchFn)
    })
  }, [])

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Lisvindanu',
  alternateName: 'Anaphygon',
  url: 'https://anaphygon.my.id',
  image: 'https://anaphygon.my.id/og-image.png',
  jobTitle: 'Fullstack & Mobile Developer',
  description: 'Fullstack & Mobile Developer based in Indonesia. Building web and mobile applications.',
  sameAs: [],
  knowsAbout: ['React', 'TypeScript', 'React Native', 'Node.js', 'MySQL', 'TanStack'],
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head suppressHydrationWarning>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
