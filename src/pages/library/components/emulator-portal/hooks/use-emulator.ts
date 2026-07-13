import { attemptAsync, delay, noop } from 'es-toolkit'
import NoSleep from 'nosleep.js'
import { Nostalgist } from 'nostalgist'
import { useEffect, useMemo } from 'react'
import { useLoaderData } from 'react-router'
import useSWRImmutable from 'swr/immutable'
import { client } from '#@/api/client.ts'
import type { Rom } from '#@/controllers/roms/get-roms.ts'
import {
  useEmulatorLaunched,
  useIsFullscreen,
  useLaunchButton,
  useSpatialNavigationPaused,
} from '#@/pages/library/atoms.ts'
import { useIsDemo } from '#@/pages/library/hooks/use-demo.ts'
import { useGamepadMapping } from '#@/pages/library/hooks/use-gamepad-mapping.ts'
import { useRom } from '#@/pages/library/hooks/use-rom.ts'
import { useRouter } from '#@/pages/library/hooks/use-router.ts'
import { getFileUrl } from '#@/pages/library/utils/file.ts'
import { focus, offCancel, onCancel } from '#@/pages/library/utils/spatial-navigation.ts'
import type { loader } from '#@/pages/routes/library-platform-rom.tsx'
import { getCDNUrl } from '#@/utils/isomorphic/cdn.ts'
import { getGlobalCSSVars } from '#@/utils/isomorphic/misc.ts'
import { usePreference } from '../../../hooks/use-preference.ts'
import { useJaguarNumpad } from './use-jaguar-numpad.ts'

type NostalgistOption = Parameters<typeof Nostalgist.prepare>[0]
type RetroarchConfig = Partial<NostalgistOption['retroarchConfig']>

// Must match Nostalgist's EmulatorFileSystem.systemDirectory. If system_directory is
// empty, RetroArch falls back to the content directory and never sees uploaded BIOS files.
const retroarchSystemDirectory = '/home/web_user/retroarch/userdata/system'

// Computer systems that need the host keyboard passed through to the core (typing,
// function keys, etc.). Without Game Focus, RetroArch steals keys for joypad/hotkeys.
const keyboardCores = new Set([
  'cap32',
  'fuse',
  'vice_x64',
  'vice_x64sc',
  'vice_xscpu64',
  'vice_x128',
  'vice_xvic',
  'vice_xplus4',
  'vice_xpet',
])

// Unbind keyboard→joypad/hotkey maps so letters and F-keys reach the core. Gamepads still work.
const keyboardCoreInputConfig: RetroarchConfig = {
  // @ts-expect-error not listed in nostalgist's RetroArch config types yet
  input_auto_game_focus: 'on',
  input_hold_fast_forward: 'nul',
  input_player1_a: 'nul',
  input_player1_b: 'nul',
  input_player1_down: 'nul',
  input_player1_l1: 'nul',
  input_player1_l2: 'nul',
  input_player1_l3: 'nul',
  input_player1_left: 'nul',
  input_player1_r1: 'nul',
  input_player1_r2: 'nul',
  input_player1_r3: 'nul',
  input_player1_right: 'nul',
  input_player1_select: 'nul',
  input_player1_start: 'nul',
  input_player1_up: 'nul',
  input_player1_x: 'nul',
  input_player1_y: 'nul',
  input_rewind: 'nul',
}

function isKeyboardCore(core: string | undefined) {
  return Boolean(core && keyboardCores.has(core))
}

const defaultRetroarchConfig: RetroarchConfig = {
  fastforward_ratio: 10,
  input_player1_analog_dpad_mode: 1,
  input_player2_analog_dpad_mode: 1,
  input_player3_analog_dpad_mode: 1,
  input_player4_analog_dpad_mode: 1,
  rewind_granularity: 4,
  rgui_menu_color_theme: 1,
  run_ahead_frames: 1,
  system_directory: retroarchSystemDirectory,
  video_gpu_screenshot: true,
  // @ts-expect-error not listed in nostalgist's RetroArch config types yet
  video_viewport_bias_y: 0.1,
}

const nativeConsoleError = console.error
let noSleep: NoSleep
const originalGetUserMedia = globalThis.navigator?.mediaDevices?.getUserMedia?.bind(globalThis.navigator.mediaDevices)
export function useEmulator() {
  const rom: Rom = useRom()
  const { state } = useLoaderData<typeof loader>()
  const { preference } = usePreference()
  const gamepadMapping = useGamepadMapping()
  const [launched, setLaunched] = useEmulatorLaunched()
  const isDemo = useIsDemo()
  const { reload } = useRouter()
  const [isFullscreen, setIsFullscreen] = useIsFullscreen()
  const [launchButton] = useLaunchButton()
  const [, setSpatialNavigationPaused] = useSpatialNavigationPaused()

  const romUrl = isDemo
    ? // @ts-expect-error we can guarantee the platform is supported here
      getCDNUrl(`retrobrews/${{ genesis: 'md' }[rom.platform] || rom.platform}-games`, rom.fileName)
    : getFileUrl(rom.fileId) || ''
  const { core } = preference.emulator.platform[rom.platform] || {}

  const platformShader = preference.emulator.platform[rom.platform].shader
  const shader =
    platformShader === 'inherit' ? preference.emulator.shader : (platformShader ?? preference.emulator.shader)

  const romObject = useMemo(() => ({ fileContent: romUrl, fileName: rom?.fileName }), [rom, romUrl])
  const bios = (preference.emulator.platform[rom.platform]?.bioses || []).map(({ fileId, fileName }) => ({
    fileContent: getFileUrl(fileId),
    fileName,
  }))
  const options: NostalgistOption = useMemo(
    () => ({
      bios,
      core,
      retroarchConfig: {
        ...defaultRetroarchConfig,
        ...preference.input.keyboardMapping,
        ...gamepadMapping,
        // this might be a bug of retroarch's emscripten build, y plus and y minus are swapped
        input_player1_l_y_minus: preference.input.keyboardMapping.input_player1_l_y_plus,
        input_player1_l_y_plus: preference.input.keyboardMapping.input_player1_l_y_minus,
        rewind_enable: !['mupen64plus_next'].includes(core) && !isKeyboardCore(core),
        run_ahead_enabled: !['mupen64plus_next', 'pcsx_rearmed'].includes(core) && !isKeyboardCore(core),
        video_smooth: preference.emulator.videoSmooth,
        // Applied last so typing works for computer cores (VICE / Fuse / Cap32).
        ...(isKeyboardCore(core) ? keyboardCoreInputConfig : {}),
      },
      retroarchCoreConfig: preference.emulator.core[core],
      rom: romObject,
      shader,
      state: state?.fileId ? getFileUrl(state.fileId) : undefined,
    }),
    [romObject, bios, core, preference, gamepadMapping, shader, state?.fileId],
  )

  const {
    data: emulator,
    error,
    isValidating,
    mutate: prepare,
  } = useSWRImmutable(options, () => Nostalgist.prepare(options))
  globalThis.emulator = emulator

  // Jaguar keypad lives on RETRO_DEVICE_KEYBOARD (0-9, -, =). Map PC numpad onto those
  // keys while this core is running: numpad digits → 0-9, * → *, - → #.
  useJaguarNumpad(launched && core === 'virtualjaguar')

  const isPreparing = !rom || isValidating

  async function launch({ withState }: { withState?: boolean } = {}) {
    if (!emulator || !rom) {
      return
    }

    console.error = noop
    if (!withState) {
      emulator.getEmulator().on('beforeLaunch', () => {
        try {
          //@ts-expect-error Using an undocumented API here. There should be a way to do this.
          emulator.getEmscriptenFS().unlink(`${emulator.getEmulator().stateFilePath}.auto`)
        } catch {}
      })
    }

    const canvas = emulator.getCanvas()
    canvas.setAttribute('tabindex', '-1')
    canvas.dataset.snFocusStyle = JSON.stringify({ display: 'none' })
    focus(canvas)

    setLaunched(true)

    if (!isDemo) {
      await client.launch_records.$post({ form: { core, rom: rom.id } })
    }
  }

  async function start() {
    if (!emulator || !rom) {
      return
    }
    try {
      // @ts-expect-error an ad-hoc patch for disabling request for camera access
      globalThis.navigator.mediaDevices.getUserMedia = null
    } catch {}
    await emulator.start()
    try {
      globalThis.navigator.mediaDevices.getUserMedia = originalGetUserMedia
    } catch {}
    const canvas = emulator.getCanvas()
    if (canvas) {
      canvas.style.opacity = '1'
      // Keyboard cores need a focusable canvas that can receive key events.
      if (isKeyboardCore(core)) {
        canvas.setAttribute('tabindex', '0')
      }
      const cssVars = getGlobalCSSVars(preference)
      if (cssVars['--game-saturate'] !== '100%') {
        canvas.style.filter = `saturate(var(--game-saturate))`
      }
      focus(canvas)
      if (isKeyboardCore(core)) {
        canvas.focus({ preventScroll: true })
      }
    }

    if (preference.emulator.fullscreen) {
      await toggleFullscreen()
    }
    onCancel(noop)
    noSleep ||= new NoSleep()
    await noSleep.enable()

    // ad-hoc patch for mupen64plus_next
    if (core === 'mupen64plus_next') {
      await delay(0)
      emulator.sendCommand('PAUSE_TOGGLE')
      await delay(0)
      emulator.sendCommand('PAUSE_TOGGLE')
    }
  }

  async function exit({ reloadAfterExit = false } = {}) {
    console.error = nativeConsoleError
    const status = emulator?.getStatus() || ''
    if (['paused', 'running'].includes(status)) {
      emulator?.exit()
      setLaunched(false)
      noSleep.disable()
      const promises: Promise<void>[] = []
      if (document.fullscreenElement) {
        promises.push(document.exitFullscreen())
      }
      await attemptAsync(() => Promise.all(promises))
      setSpatialNavigationPaused(false)
      setIsFullscreen(false)
      focus(launchButton)
      offCancel()
      await attemptAsync(prepare)
      if (reloadAfterExit) {
        await reload()
      }
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        setIsFullscreen(false)
      } else {
        await document.body.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch {}

    if (emulator) {
      focus(emulator.getCanvas())
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    document.body.addEventListener(
      'fullscreenchange',
      () => {
        setIsFullscreen(document.fullscreenElement === document.body)
      },
      { signal: abortController.signal },
    )
    return () => {
      abortController.abort()
    }
  })

  return {
    core,
    emulator,
    error,
    exit,
    isFullscreen,
    isPreparing,
    launch,
    launched,
    prepare,
    setLaunched,
    start,
    toggleFullscreen,
  }
}
