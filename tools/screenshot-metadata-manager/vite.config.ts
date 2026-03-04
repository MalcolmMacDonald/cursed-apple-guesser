import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '../..')
const SESSIONS_DIR = path.join(ROOT_DIR, 'tools', 'deadlock-capture', 'output', 'sessions')
const TAGS_PATH = path.join(ROOT_DIR, 'tools', 'deadlock-capture', 'output', 'tag-definitions.json')
const MAP_IMAGE_PATH = path.join(ROOT_DIR, 'src', 'assets', 'IMG_6117.png')

async function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

function sendJson(res: any, data: unknown, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.end(JSON.stringify(data))
}

function serveFile(res: any, filePath: string, contentType: string) {
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404
    res.end('Not found')
    return
  }
  const data = fs.readFileSync(filePath)
  res.setHeader('Content-Type', contentType)
  res.end(data)
}

/** Read all session manifests and return a flat array of MetadataEntry objects. */
function readAllEntries(): any[] {
  if (!fs.existsSync(SESSIONS_DIR)) return []

  const result: any[] = []
  const sessionDirs = fs.readdirSync(SESSIONS_DIR).filter((d) =>
    fs.statSync(path.join(SESSIONS_DIR, d)).isDirectory()
  )

  for (const sessionId of sessionDirs.sort()) {
    const manifestPath = path.join(SESSIONS_DIR, sessionId, 'manifest.json')
    if (!fs.existsSync(manifestPath)) continue

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    for (const capture of manifest.captures ?? []) {
      result.push({
        id: `${sessionId}/${capture.fileName}`,
        sessionId,
        fileName: capture.fileName,
        location: capture.position,
        angles: capture.angles,
        capturedAt: capture.capturedAt,
        tags: capture.tags ?? [],
      })
    }
  }

  return result
}

/** Write updated tags back into the appropriate session manifests. */
function writeEntries(entries: any[]) {
  // Group by sessionId → fileName → tags
  const bySession = new Map<string, Map<string, string[]>>()
  for (const entry of entries) {
    if (!bySession.has(entry.sessionId)) bySession.set(entry.sessionId, new Map())
    bySession.get(entry.sessionId)!.set(entry.fileName, entry.tags ?? [])
  }

  for (const [sessionId, tagsMap] of bySession) {
    const manifestPath = path.join(SESSIONS_DIR, sessionId, 'manifest.json')
    if (!fs.existsSync(manifestPath)) continue

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    manifest.captures = (manifest.captures ?? []).map((capture: any) => ({
      ...capture,
      tags: tagsMap.has(capture.fileName) ? tagsMap.get(capture.fileName) : (capture.tags ?? []),
    }))
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  }
}

function localFilesPlugin(): Plugin {
  return {
    name: 'local-files',
    configureServer(server) {
      // Serve the Deadlock minimap image
      server.middlewares.use('/map.png', (_req: any, res: any) => {
        serveFile(res, MAP_IMAGE_PATH, 'image/png')
      })

      // Serve session capture screenshots
      // URL pattern: /sessions/{sessionId}/captures/{fileName}
      server.middlewares.use('/sessions', (req: any, res: any, next: any) => {
        const url: string = req.url || ''
        if (url === '/' || url === '') { next(); return }

        const parts = url.replace(/^\//, '').split('/')
        const filePath = path.join(SESSIONS_DIR, ...parts)

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          serveFile(res, filePath, 'image/jpeg')
        } else {
          next()
        }
      })

      // API routes
      server.middlewares.use('/api', async (req: any, res: any, next: any) => {
        const url: string = req.url || ''
        const method: string = req.method || 'GET'

        try {
          // GET /api/metadata — flat list of all captures across all sessions
          if (url === '/metadata' && method === 'GET') {
            sendJson(res, readAllEntries())
            return
          }

          // POST /api/metadata — write tags back to manifests
          if (url === '/metadata' && method === 'POST') {
            const body = await readBody(req)
            writeEntries(JSON.parse(body))
            sendJson(res, { success: true })
            return
          }

          // GET /api/tags
          if (url === '/tags' && method === 'GET') {
            if (!fs.existsSync(TAGS_PATH)) {
              fs.mkdirSync(path.dirname(TAGS_PATH), { recursive: true })
              fs.writeFileSync(TAGS_PATH, JSON.stringify({ tags: [] }, null, 2))
            }
            sendJson(res, JSON.parse(fs.readFileSync(TAGS_PATH, 'utf-8')))
            return
          }

          // POST /api/tags
          if (url === '/tags' && method === 'POST') {
            const body = await readBody(req)
            fs.mkdirSync(path.dirname(TAGS_PATH), { recursive: true })
            fs.writeFileSync(TAGS_PATH, JSON.stringify(JSON.parse(body), null, 2))
            sendJson(res, { success: true })
            return
          }

          // DELETE /api/entry — remove a capture from its manifest and delete the image file
          if (url === '/entry' && method === 'DELETE') {
            const body = await readBody(req)
            const { sessionId, fileName } = JSON.parse(body) as { sessionId: string; fileName: string }
            const manifestPath = path.join(SESSIONS_DIR, sessionId, 'manifest.json')
            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
              manifest.captures = (manifest.captures ?? []).filter((c: any) => c.fileName !== fileName)
              fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
            }
            const imagePath = path.join(SESSIONS_DIR, sessionId, 'captures', fileName)
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath)
            sendJson(res, { success: true })
            return
          }
        } catch (err) {
          sendJson(res, { error: String(err) }, 500)
          return
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localFilesPlugin()],
  server: {
    port: 5174,
    host: '127.0.0.1',
    fs: {
      allow: [__dirname, ROOT_DIR],
    },
  },
})
