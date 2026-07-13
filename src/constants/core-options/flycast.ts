import type { CoreOption } from './types.d.ts'

// Tuned defaults for the experimental WASM interpreter build (nasomers/flycast-wasm).
export const flycastOptions: CoreOption[] = [
  {
    defaultOption: 'enabled',
    name: 'reicast_hle_bios',
    options: ['disabled', 'enabled'],
    title: 'HLE BIOS',
  },
  {
    defaultOption: 'disabled',
    name: 'reicast_boot_to_bios',
    options: ['disabled', 'enabled'],
    title: 'Boot to BIOS',
  },
  {
    defaultOption: '640x480',
    name: 'reicast_internal_resolution',
    options: ['320x240', '640x480', '1280x960'],
    title: 'Internal Resolution',
  },
  {
    defaultOption: 'per-strip (fast, least accurate)',
    name: 'reicast_alpha_sorting',
    options: ['per-strip (fast, least accurate)', 'per-triangle (normal)', 'per-pixel (accurate)'],
    title: 'Alpha Sorting',
  },
  {
    defaultOption: 'enabled',
    name: 'reicast_frame_skipping',
    options: ['disabled', 'enabled'],
    title: 'Frame Skipping',
  },
  {
    defaultOption: 'disabled',
    name: 'reicast_threaded_rendering',
    options: ['disabled', 'enabled'],
    title: 'Threaded Rendering',
  },
]
