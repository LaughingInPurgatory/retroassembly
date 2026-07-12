import fs from 'node:fs/promises'
import path from 'node:path'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { getContext } from 'hono/context-storage'
import { HTTPException } from 'hono/http-exception'
import { getDirectories } from '#@/constants/env.ts'
import { platformMap, type PlatformName } from '#@/constants/platform.ts'
import { romTable, statusEnum, userTable } from '#@/databases/schema.ts'
import { createRom } from './create-roms.ts'

// Picks up files dropped directly onto the shared roms/<platform>/ folder - the same folder
// createRom() stores uploads in, so there's nothing to move: only the DB row is missing.
export async function scanRoms() {
  const { currentUser, db } = getContext().var

  // ponytail: duplicated 5x (get-all-users, delete-user, update-user, create-roms, here);
  // extract a shared helper if it needs to grow another case.
  const [superUser] = await db.library
    .select()
    .from(userTable)
    .where(eq(userTable.status, statusEnum.normal))
    .orderBy(asc(userTable.createdAt))
    .limit(1)
  if (!superUser || superUser.id !== currentUser.id) {
    throw new HTTPException(403, { message: 'Forbidden' })
  }

  const { storageDirectory } = getDirectories()
  const romsDirectory = path.join(storageDirectory, 'roms')

  let platforms: string[]
  try {
    platforms = await fs.readdir(romsDirectory)
  } catch {
    return { added: 0 }
  }

  let added = 0
  for (const platform of platforms) {
    if (!(platform in platformMap)) {
      continue
    }
    const platformDirectory = path.join(romsDirectory, platform)
    const fileNames = await fs.readdir(platformDirectory).catch(() => [])
    const candidateFileNames = fileNames.filter((fileName) =>
      platformMap[platform as PlatformName].fileExtensions.includes(path.extname(fileName).toLowerCase()),
    )
    if (candidateFileNames.length === 0) {
      continue
    }

    const fileIds = candidateFileNames.map((fileName) => path.join('roms', platform, fileName))
    const tracked = await db.library
      .select({ fileId: romTable.fileId })
      .from(romTable)
      .where(and(inArray(romTable.fileId, fileIds), eq(romTable.status, statusEnum.normal)))
    const trackedFileIds = new Set(tracked.map((row) => row.fileId))

    for (const fileName of candidateFileNames) {
      if (trackedFileIds.has(path.join('roms', platform, fileName))) {
        continue
      }
      const filePath = path.join(platformDirectory, fileName)
      try {
        const buffer = await fs.readFile(filePath)
        await createRom({ file: new File([buffer], fileName), platform: platform as PlatformName })
        added += 1
      } catch (error) {
        console.warn(`scanRoms: failed to import ${filePath}`, error)
      }
    }
  }

  return { added }
}
