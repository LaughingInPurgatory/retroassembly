import path from 'node:path'
import { platformMap, type PlatformName } from '#@/constants/platform.ts'
import type { ResolvedPreference } from '#@/constants/preference.ts'
import { listStorageKeys } from '#@/utils/server/storage.ts'

interface BiosEntry {
  fileId: string
  fileName: string
}

function matchExpectedName(fileName: string, expectedNames: string[]) {
  if (expectedNames.includes(fileName)) {
    return fileName
  }
  const lower = fileName.toLowerCase()
  return expectedNames.find((name) => name.toLowerCase() === lower)
}

/**
 * Merge BIOS files already present under bioses/<platform>/ into the preference.
 * Files are matched by expected platform BIOS names (case-insensitive on disk).
 */
export async function mergeDiscoveredBioses(preference: ResolvedPreference) {
  for (const platform of Object.keys(platformMap) as PlatformName[]) {
    const expected = platformMap[platform].bioses
    if (!expected?.length) {
      continue
    }
    const expectedNames = expected.map((bios) => bios.name)
    const prefix = path.posix.join('bioses', platform)
    const keys = await listStorageKeys(prefix)
    if (keys.length === 0) {
      continue
    }

    const platformPreference = preference.emulator.platform[platform]
    const bioses = [...(platformPreference.bioses || [])]
    const byName = new Map(bioses.map((bios) => [bios.fileName, bios]))

    for (const key of keys) {
      const baseName = path.posix.basename(key)
      if (!baseName || baseName === '.' || baseName === '..') {
        continue
      }
      const canonicalName = matchExpectedName(baseName, expectedNames)
      if (!canonicalName) {
        continue
      }
      const fileId = key.replaceAll('\\', '/')
      const existing = byName.get(canonicalName)
      if (existing) {
        // Prefer a path that actually uses the original filename when upgrading old digests.
        if (existing.fileId !== fileId && path.posix.basename(fileId) === baseName) {
          existing.fileId = fileId
        }
        continue
      }
      const entry: BiosEntry = { fileId, fileName: canonicalName }
      bioses.push(entry)
      byName.set(canonicalName, entry)
    }

    platformPreference.bioses = bioses
  }

  return preference
}
