import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { resolve, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import server from './dist/server/server.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const port = parseInt(process.env.PORT ?? '3100', 10)

const MIME = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

function serveStatic(res, filePath) {
  const ext = extname(filePath).toLowerCase()
  const mime = MIME[ext] ?? 'application/octet-stream'
  const stat = statSync(filePath)
  res.writeHead(200, {
    'Content-Type': mime,
    'Content-Length': stat.size,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  })
  createReadStream(filePath).pipe(res)
}

const httpServer = createServer(async (nodeReq, nodeRes) => {
  try {
    const url = nodeReq.url ?? '/'

    // Serve /assets/* from dist/client/assets/
    if (url.startsWith('/assets/')) {
      const filePath = resolve(__dirname, 'dist/client', url.slice(1))
      if (existsSync(filePath)) {
        serveStatic(nodeRes, filePath)
        return
      }
    }

    // Serve public files (favicon, images, robots.txt, etc.) from dist/client/
    const urlPath = url.split('?')[0].slice(1)
    const publicPath = resolve(__dirname, 'dist/client', urlPath)
    if (existsSync(publicPath) && statSync(publicPath).isFile()) {
      serveStatic(nodeRes, publicPath)
      return
    }

    // Fallback: serve from public/ (for runtime-uploaded files)
    const runtimePublicPath = resolve(__dirname, 'public', urlPath)
    if (existsSync(runtimePublicPath) && statSync(runtimePublicPath).isFile()) {
      serveStatic(nodeRes, runtimePublicPath)
      return
    }

    // SSR handler
    const proto = nodeReq.socket?.encrypted ? 'https' : 'http'
    const host = nodeReq.headers.host ?? `localhost:${port}`
    const fullUrl = new URL(url, `${proto}://${host}`)

    const headers = new Headers()
    for (const [k, v] of Object.entries(nodeReq.headers)) {
      if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : v)
    }

    let body = undefined
    if (nodeReq.method !== 'GET' && nodeReq.method !== 'HEAD') {
      body = await new Promise((resolve) => {
        const chunks = []
        nodeReq.on('data', (c) => chunks.push(c))
        nodeReq.on('end', () => resolve(Buffer.concat(chunks)))
      })
    }

    const request = new Request(fullUrl, { method: nodeReq.method, headers, body })
    const response = await server.fetch(request)

    nodeRes.statusCode = response.status
    for (const [k, v] of response.headers.entries()) {
      nodeRes.setHeader(k, v)
    }

    const buffer = await response.arrayBuffer()
    nodeRes.end(Buffer.from(buffer))
  } catch (err) {
    console.error('[server] Error:', err)
    nodeRes.statusCode = 500
    nodeRes.end('Internal Server Error')
  }
})

httpServer.listen(port, () => {
  console.log(`[anaphygon] Running on http://localhost:${port}`)
})
