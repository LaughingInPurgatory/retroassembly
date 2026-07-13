import { Hono } from 'hono'
import { getRunTimeEnv } from '#@/constants/env.ts'
import { getFileContent } from '#@/utils/server/misc.ts'
import { createFileResponse } from '../utils.ts'

export const files = new Hono().get(':id{.+}', async (c) => {
  const id = c.req.param('id')
  // Reject absolute URLs so a crafted id cannot turn STORAGE_HOST into an open redirect.
  // `..` path segments are blocked here too; storage.resolveStoragePath is the second line.
  if (!id || id.includes('://') || id.startsWith('//') || id.split(/[/\\]/u).includes('..')) {
    return c.json({ message: 'Invalid file id' }, 400)
  }
  const runTimeEnv = getRunTimeEnv()
  if (runTimeEnv.RETROASSEMBLY_RUN_TIME_STORAGE_HOST) {
    return c.redirect(new URL(id, runTimeEnv.RETROASSEMBLY_RUN_TIME_STORAGE_HOST))
  }
  try {
    const file = await getFileContent(id)
    if (file) {
      return createFileResponse(file, id)
    }
  } catch {
    return c.json({ message: 'Not found' }, 404)
  }
})
