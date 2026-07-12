import fs from 'node:fs/promises'
import path from 'node:path'
import { getDirectories } from '#@/constants/env.ts'
import { platformMap, type PlatformName } from '#@/constants/platform.ts'
import { createRom } from './create-roms.ts'

// Landing zone for files dropped directly onto the volume: <data>/roms/<platform>/<file>,
// one subfolder per platformMap key. Scanning imports each file through the normal upload
// path (extension check, digest, msleuth lookup, per-user storage) then removes the source,
// so a rescan doesn't reprocess it.
export async function scanRoms() {
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

    for (const fileName of fileNames) {
      const ext = path.extname(fileName).toLowerCase()
      if (!platformMap[platform as PlatformName].fileExtensions.includes(ext)) {
        continue
      }

      const filePath = path.join(platformDirectory, fileName)
      try {
        const buffer = await fs.readFile(filePath)
        const file = new File([buffer], fileName)
        await createRom({ file, platform: platform as PlatformName })
        await fs.unlink(filePath)
        added += 1
      } catch (error) {
        console.warn(`scanRoms: failed to import ${filePath}`, error)
      }
    }
  }

  return { added }
}
