import path from 'node:path'
import type { ReadableStream as NodeReadableStream } from 'node:stream/web'
import { env } from 'hono/adapter'
import { getContext } from 'hono/context-storage'
import { getDirectories } from '../../constants/env.ts'

// Keep resolved paths under the storage root so `../` keys cannot escape it.
function resolveStoragePath(storageDirectory: string, id: string) {
  const root = path.resolve(storageDirectory)
  const resolved = path.resolve(root, id)
  const relative = path.relative(root, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid storage path')
  }
  return resolved
}

export function createStorage() {
  const c = getContext()
  const { BUCKET } = env<Env>(c)
  if (BUCKET) {
    return BUCKET
  }

  const { storageDirectory } = getDirectories()

  return {
    async head(id: string) {
      const filePath = resolveStoragePath(storageDirectory, id)
      const { default: fs } = await import('fs-extra')
      return fs.pathExists(filePath)
    },

    async put(id: string, file: Blob) {
      const filePath = resolveStoragePath(storageDirectory, id)
      const { default: fs } = await import('fs-extra')
      await fs.ensureDir(path.dirname(filePath))
      const { createWriteStream } = await import('node:fs')
      const { Readable } = await import('node:stream')
      const { pipeline } = await import('node:stream/promises')
      const readable = Readable.fromWeb(file.stream() as NodeReadableStream)
      const writable = createWriteStream(filePath)
      await pipeline(readable, writable)
    },

    async get(id: string) {
      const filePath = resolveStoragePath(storageDirectory, id)
      const { default: fs } = await import('fs-extra')
      const buffer = await fs.readFile(filePath)
      // Create a mock R2ObjectBody-like object for compatibility with createFileResponse
      const mockR2Object = {
        body: buffer,
        httpEtag: `"${Date.now()}"`,
        size: buffer.length,
      }
      return mockR2Object
    },

    async delete(id: string) {
      const filePath = resolveStoragePath(storageDirectory, id)
      const { default: fs } = await import('fs-extra')
      await fs.remove(filePath)
    },

    async list(options?: { prefix?: string }) {
      const prefix = (options?.prefix || '').replaceAll('\\', '/').replace(/\/+$/u, '')
      const directory = resolveStoragePath(storageDirectory, prefix || '.')
      const { default: fs } = await import('fs-extra')
      try {
        const entries = await fs.readdir(directory, { withFileTypes: true })
        const keys = entries
          .filter((entry) => entry.isFile())
          .map((entry) => (prefix ? path.posix.join(prefix, entry.name) : entry.name))
        return { objects: keys.map((key) => ({ key })) }
      } catch {
        return { objects: [] as { key: string }[] }
      }
    },
  }
}

/** List object keys under a storage prefix (node directory or R2). */
export async function listStorageKeys(prefix: string) {
  const storage = createStorage()
  if (typeof storage.list !== 'function') {
    return [] as string[]
  }
  const normalized = prefix.replaceAll('\\', '/').replace(/\/+$/u, '')
  const result = await storage.list({ prefix: `${normalized}/` })
  if (result && typeof result === 'object' && 'objects' in result && Array.isArray(result.objects)) {
    return result.objects.map((object: { key: string }) => object.key)
  }
  return [] as string[]
}
