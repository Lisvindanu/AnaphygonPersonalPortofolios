import { createServer } from 'node:http'
import server from './dist/server/server.js'

const port = parseInt(process.env.PORT ?? '3100', 10)

const httpServer = createServer(async (nodeReq, nodeRes) => {
  try {
    const proto = nodeReq.socket?.encrypted ? 'https' : 'http'
    const host = nodeReq.headers.host ?? `localhost:${port}`
    const url = new URL(nodeReq.url ?? '/', `${proto}://${host}`)

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

    const request = new Request(url, { method: nodeReq.method, headers, body })
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
