import type { CoreOption } from './types.d.ts'

export const virtualjaguarOptions: CoreOption[] = [
  {
    defaultOption: 'disabled',
    name: 'virtualjaguar_usefastblitter',
    options: ['disabled', 'enabled'],
    title: 'Fast Blitter',
  },
  {
    defaultOption: 'disabled',
    name: 'virtualjaguar_bios',
    options: ['disabled', 'enabled'],
    title: 'BIOS',
  },
  {
    defaultOption: 'disabled',
    name: 'virtualjaguar_pal',
    options: ['disabled', 'enabled'],
    title: 'PAL (Restart)',
  },
  {
    defaultOption: 'enabled',
    name: 'virtualjaguar_crash_detect',
    options: ['enabled', 'disabled', 'verbose'],
    title: 'Crash Detect',
  },
]
