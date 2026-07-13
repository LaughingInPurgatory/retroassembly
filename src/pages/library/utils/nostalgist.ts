import { BlobReader, BlobWriter, ZipReader } from '@zip.js/zip.js'
import { isBrowser } from 'es-toolkit'
import { Nostalgist } from 'nostalgist'
import { metadata } from '#@/constants/metadata.ts'
import { cdnHost } from '#@/utils/isomorphic/cdn.ts'
import { installWebgl2CompatPatches } from './webgl2-compat.ts'

const extractCache = new Map<string, ReturnType<typeof extractCore>>()
const localCores = new Set(['virtualjaguar', 'fuse', 'cap32', 'flycast', 'dolphin'])
// Production serves public/cores with Cache-Control: immutable. Bust when the build changes
// so rebuilt cores (especially experimental Flycast) are not stuck on a broken zip forever.
const localCoreCacheBust = metadata.version || metadata.buildDate || 'dev'

function getCoreCDNUrl(core: string) {
  // Cores missing from the shared retroarch-emscripten-build set are shipped under public/cores/.
  if (localCores.has(core)) {
    return `/cores/${core}_libretro.zip?v=${encodeURIComponent(String(localCoreCacheBust))}`
  }
  const externalCores = ['a5200', 'prosystem', 'stella2014', 'mupen64plus_next']
  const segments = externalCores.includes(core)
    ? [
        'npm',
        ['retroassembly-custom-cores', '1.22.2-20260614000946'].join('@'),
        'dist',
        'cores',
        `${core}_libretro.zip`,
      ]
    : ['gh', ['arianrhodsandlot/retroarch-emscripten-build', 'v1.22.2'].join('@'), 'retroarch', `${core}_libretro.zip`]
  const path = segments.join('/')
  return new URL(path, cdnHost)
}

async function extractCore(core: string) {
  const url = getCoreCDNUrl(core)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch core ${core}: HTTP ${response.status}`)
  }
  const blob = await response.blob()
  const zipFileReader = new BlobReader(blob)
  const zipReader = new ZipReader(zipFileReader)
  const entries = await zipReader.getEntries()
  const result: { js?: Blob; wasm?: Blob } = {}
  await Promise.all(
    entries.map(async (entry) => {
      if (entry && !entry.directory) {
        if (entry.filename.endsWith('.js')) {
          result.js = await entry.getData?.(new BlobWriter('application/octet-stream'))
        } else if (entry.filename.endsWith('.wasm')) {
          result.wasm = await entry.getData?.(new BlobWriter('application/octet-stream'))
        }
      }
    }),
  )
  if (!result.js || !result.wasm) {
    throw new Error(`Failed to extract core files for ${core}`)
  }
  return result as { js: Blob; wasm: Blob }
}

async function extractCoreWithCache(core: string) {
  if (extractCache.has(core)) {
    return extractCache.get(core) as ReturnType<typeof extractCore>
  }
  const promise = extractCore(core)
  extractCache.set(core, promise)
  try {
    return await promise
  } finally {
    extractCache.delete(core)
  }
}

interface EmscriptenFS {
  analyzePath: (path: string) => { exists: boolean }
  mkdirTree: (path: string) => void
  rename: (oldPath: string, newPath: string) => void
  writeFile: (path: string, data: Uint8Array) => void
  readFile: (path: string, opts?: { encoding: 'binary' }) => Uint8Array
}

const systemDirectory = '/home/web_user/retroarch/userdata/system'
const dolphinSysRoot = `${systemDirectory}/dolphin-emu/Sys`
let dolphinSysMount: Promise<void> | undefined

// Nostalgist strips directories from bios fileName (basename only). Move firmwares
// into the layouts Flycast/Dolphin expect under system/.
function relocateSystemBioses(FS: EmscriptenFS) {
  for (const name of ['dc_boot.bin', 'dc_flash.bin']) {
    const src = `${systemDirectory}/${name}`
    const dest = `${systemDirectory}/dc/${name}`
    try {
      if (FS.analyzePath(src).exists && !FS.analyzePath(dest).exists) {
        FS.mkdirTree(`${systemDirectory}/dc`)
        FS.rename(src, dest)
      }
    } catch {}
  }

  // Dolphin looks for IPL under Sys/GC/<region>/IPL.bin (and DSP dumps under Sys/GC/).
  const iplCandidates = [`${systemDirectory}/IPL.bin`, `${systemDirectory}/dolphin-emu/IPL.bin`]
  let iplSource: string | undefined
  for (const candidate of iplCandidates) {
    try {
      if (FS.analyzePath(candidate).exists) {
        iplSource = candidate
        break
      }
    } catch {}
  }
  if (iplSource) {
    try {
      const data = FS.readFile(iplSource, { encoding: 'binary' })
      for (const region of ['USA', 'JAP', 'EUR']) {
        const destDir = `${dolphinSysRoot}/GC/${region}`
        const dest = `${destDir}/IPL.bin`
        if (!FS.analyzePath(dest).exists) {
          FS.mkdirTree(destDir)
          FS.writeFile(dest, data)
        }
      }
    } catch {}
  }

  for (const name of ['dsp_coef.bin', 'dsp_rom.bin']) {
    const src = `${systemDirectory}/${name}`
    const dest = `${dolphinSysRoot}/GC/${name}`
    try {
      if (FS.analyzePath(src).exists && !FS.analyzePath(dest).exists) {
        FS.mkdirTree(`${dolphinSysRoot}/GC`)
        FS.rename(src, dest)
      }
    } catch {}
  }
}

async function mountDolphinSysFiles(FS: EmscriptenFS) {
  const marker = `${dolphinSysRoot}/codehandler.bin`
  try {
    if (FS.analyzePath(marker).exists) {
      return
    }
  } catch {}

  const response = await fetch(`/cores/dolphin_sys.zip?v=${encodeURIComponent(String(localCoreCacheBust))}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch Dolphin Sys assets: HTTP ${response.status}`)
  }
  const zipReader = new ZipReader(new BlobReader(await response.blob()))
  const entries = await zipReader.getEntries()
  await Promise.all(
    entries.map(async (entry) => {
      if (!entry || entry.directory || !entry.getData) {
        return
      }
      const relative = entry.filename.replace(/^\/+/u, '')
      if (!relative || relative.includes('..')) {
        return
      }
      const target = `${dolphinSysRoot}/${relative}`
      try {
        if (FS.analyzePath(target).exists) {
          return
        }
      } catch {}
      const blob = await entry.getData(new BlobWriter('application/octet-stream'))
      const buffer = new Uint8Array(await blob.arrayBuffer())
      const slash = target.lastIndexOf('/')
      if (slash > 0) {
        FS.mkdirTree(target.slice(0, slash))
      }
      FS.writeFile(target, buffer)
    }),
  )
  await zipReader.close()
}

function getCoreName(core: unknown) {
  if (typeof core === 'string') {
    return core
  }
  if (core && typeof core === 'object' && 'name' in core && typeof core.name === 'string') {
    return core.name
  }
  return ''
}

const style: Partial<CSSStyleDeclaration> = {
  backgroundPosition: ['left center', 'right center'].join(','),
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
  border: 'none',
  cursor: 'none',
  opacity: '0',
  outline: 'none',
  transition: 'opacity .1s',
}

if (isBrowser()) {
  installWebgl2CompatPatches()
  const { path } = Nostalgist.vendors
  Nostalgist.configure({
    async beforeLaunch(nostalgist) {
      const FS = nostalgist.getEmscriptenFS() as EmscriptenFS
      const options = nostalgist.getOptions()
      const coreName = getCoreName(options.core)

      // Libretro Dolphin requires system/dolphin-emu/Sys (fonts, shaders, GameSettings).
      // Without it the core often ends on the Null video backend → blank screen.
      if (coreName === 'dolphin') {
        try {
          dolphinSysMount ||= mountDolphinSysFiles(FS)
          await dolphinSysMount
        } finally {
          dolphinSysMount = undefined
        }
      }

      relocateSystemBioses(FS)

      const shadersDirectory = '/home/web_user/retroarch/bundle/shaders/shaders_glsl/shaders'
      switch (options.shader) {
        case 'crt/crt-easymode-halation':
          FS.mkdirTree(path.join(shadersDirectory, 'crt-easymode-halation'))
          for (const name of ['linearize', 'blur_horiz', 'blur_vert', 'threshold', 'crt-easymode-halation']) {
            FS.rename(
              path.join(shadersDirectory, `${name}.glsl`),
              path.join(shadersDirectory, 'crt-easymode-halation', `${name}.glsl`),
            )
          }

          break

        case 'crt/crt-interlaced-halation':
          FS.mkdirTree(path.join(shadersDirectory, 'crt-interlaced-halation'))
          for (const n of [0, 1, 2]) {
            FS.rename(
              path.join(shadersDirectory, `crt-interlaced-halation-pass${n}.glsl`),
              path.join(shadersDirectory, 'crt-interlaced-halation', `crt-interlaced-halation-pass${n}.glsl`),
            )
          }
          FS.mkdirTree('/home/web_user/retroarch/bundle/shaders/interpolation/shaders')
          FS.rename(
            path.join(shadersDirectory, 'quilez.glsl'),
            path.join('/home/web_user/retroarch/bundle/shaders/interpolation/shaders/quilez.glsl'),
          )

          break
      }
    },
    cache: true,
    async resolveCoreJs(core) {
      if (typeof core !== 'string') {
        throw new TypeError('Invalid core js file')
      }
      const response = await extractCoreWithCache(core)
      return response.js
    },
    async resolveCoreWasm(core) {
      if (typeof core !== 'string') {
        throw new TypeError('Invalid core js file')
      }
      const response = await extractCoreWithCache(core)
      return response.wasm
    },
    resolveShader(name) {
      if (!name) {
        return []
      }
      const cdnBaseUrl = 'https://cdn.jsdelivr.net/gh'
      const shaderRepo = 'libretro/glsl-shaders'
      const shaderVersion = '468f67b6f6788e2719d1dd28dfb2c9b7c3db3cc7'
      const prefix = `${cdnBaseUrl}/${shaderRepo}@${shaderVersion}`

      const preset = `${prefix}/${name}.glslp`

      const { path } = Nostalgist.vendors
      const segments = name.split(path.sep)
      segments.splice(-1, 0, 'shaders')
      const glsls = {
        'crt/crt-easymode-halation': [
          `${prefix}/crt/shaders/crt-easymode-halation/linearize.glsl`,
          `${prefix}/crt/shaders/crt-easymode-halation/blur_horiz.glsl`,
          `${prefix}/crt/shaders/crt-easymode-halation/blur_vert.glsl`,
          `${prefix}/crt/shaders/crt-easymode-halation/threshold.glsl`,
          `${prefix}/crt/shaders/crt-easymode-halation/crt-easymode-halation.glsl`,
        ],
        'crt/crt-hyllian': [`${prefix}/crt/shaders/zfast_crt.glsl`],
        'crt/crt-interlaced-halation': [
          `${prefix}/crt/shaders/crt-interlaced-halation/crt-interlaced-halation-pass0.glsl`,
          `${prefix}/crt/shaders/crt-interlaced-halation/crt-interlaced-halation-pass1.glsl`,
          `${prefix}/crt/shaders/crt-interlaced-halation/crt-interlaced-halation-pass2.glsl`,
          `${prefix}/interpolation/shaders/quilez.glsl`,
        ],
        'crt/zfast-crt': [`${prefix}/crt/shaders/zfast_crt.glsl`],
        'deblur/sedi': [`${prefix}/deblur/shaders/sedi-v1.0.glsl`],
        'handheld/gba-color': [`${prefix}/handheld/shaders/color/gba-color.glsl`],
        'handheld/vba-color': [`${prefix}/handheld/shaders/color/vba-color.glsl`],
        'handheld/zfast-lcd': [`${prefix}/handheld/shaders/zfast_lcd.glsl`],
        'sabr/sabr': [`${prefix}/sabr/shaders/sabr-v3.0.glsl`],
      }[name] || [`${prefix}/${segments.join(path.sep)}.glsl`]

      return [preset, ...glsls]
    },
    style,
  })
}
