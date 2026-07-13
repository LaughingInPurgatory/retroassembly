import path from 'node:path'
import { getContext } from 'hono/context-storage'
import type { PlatformName } from '#@/constants/platform.ts'
import { getFilePartialDigest, getSafeFileName } from '#@/utils/server/file.ts'
import { updatePreference } from './update-preference.ts'

export async function addBIOS(platform: PlatformName, file: File) {
  const digest = await getFilePartialDigest(file)
  const { preference, storage } = getContext().var
  const { ext } = path.parse(file.name)
  // Keep the original name (sanitized), same idea as shared roms/<platform>/<filename>.
  const fileName = getSafeFileName(file.name, `${digest}${ext}`)
  const fileId = path.join('bioses', platform, fileName)
  await storage.put(fileId, file)

  const { bioses } = preference.emulator.platform[platform]
  const bios = bioses.find((entry) => entry.fileName === fileName)
  if (bios) {
    bios.fileId = fileId
  } else {
    bioses.push({ fileId, fileName })
  }

  return await updatePreference({
    emulator: {
      platform: {
        [platform]: {
          bioses,
        },
      },
    },
  })
}
