import path from 'node:path'
import { getContext } from 'hono/context-storage'
import type { PlatformName } from '#@/constants/platform.ts'
import { updatePreference } from './update-preference.ts'

export async function deleteBIOS(platform: PlatformName, fileName: string) {
  const { preference, storage } = getContext().var

  const { bioses } = preference.emulator.platform[platform]
  const bios = bioses.find((entry) => entry.fileName === fileName)
  if (bios?.fileId) {
    try {
      await storage.delete(bios.fileId)
    } catch {
      // Preference entry is still removed even if the object is already gone.
    }
  }

  // Also try the canonical on-disk path (original-name layout).
  const canonicalId = path.join('bioses', platform, fileName)
  if (!bios?.fileId || bios.fileId !== canonicalId) {
    try {
      await storage.delete(canonicalId)
    } catch {}
  }

  return await updatePreference({
    emulator: {
      platform: {
        [platform]: {
          bioses: bioses.filter((entry) => entry.fileName !== fileName),
        },
      },
    },
  })
}
