import type { CoreOption } from './types.d.ts'

// Defaults tuned for the experimental WASM interpreter (ENABLE_GENERIC) build.
export const dolphinOptions: CoreOption[] = [
  {
    defaultOption: '5',
    name: 'dolphin_cpu_core',
    options: ['0', '5'],
    title: 'CPU Core (0=Interpreter, 5=Cached Interpreter)',
  },
  {
    // Dual core needs real pthreads; WASM build forces single-core.
    defaultOption: 'disabled',
    name: 'dolphin_main_cpu_thread',
    options: ['disabled', 'enabled'],
    title: 'Dual Core Mode',
  },
  {
    defaultOption: 'enabled',
    name: 'dolphin_skip_gc_bios',
    options: ['disabled', 'enabled'],
    title: 'Skip GameCube BIOS',
  },
  {
    defaultOption: 'enabled',
    name: 'dolphin_dsp_hle',
    options: ['disabled', 'enabled'],
    title: 'DSP HLE',
  },
  {
    defaultOption: 'Hardware',
    name: 'dolphin_renderer',
    options: ['Hardware'],
    title: 'Graphics Backend',
  },
  {
    defaultOption: '1',
    name: 'dolphin_efb_scale',
    options: ['1', '2', '3', '4'],
    title: 'Internal Resolution',
  },
  {
    defaultOption: 'disabled',
    name: 'dolphin_wait_for_shaders',
    options: ['disabled', 'enabled'],
    title: 'Wait for Shaders',
  },
  {
    defaultOption: 'disabled',
    name: 'dolphin_widescreen_hack',
    options: ['disabled', 'enabled'],
    title: 'Widescreen Hack',
  },
]
