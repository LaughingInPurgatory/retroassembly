<p align="center">
  <img src="public/assets/logo/logo-512x512.png" alt="logo" width="100" height="100">
  <h1 align="center">RetroAssembly</h1>
</p>

<p align="center">
  <a href="https://github.com/arianrhodsandlot/retroassembly"><img src="https://img.shields.io/github/stars/arianrhodsandlot/retroassembly" alt="GitHub"></a>
  <a href="https://discord.gg/gwaKRAYG6t"><img src="https://img.shields.io/discord/1129062038543548496?logo=discord" alt="Discord"></a>
  <a href="https://github.com/LaughingInPurgatory/retroassembly/pkgs/container/retroassembly"><img src="https://img.shields.io/badge/ghcr.io-retroassembly-blue?logo=docker&logoColor=white" alt="GitHub Container Registry"></a>
</p>

<p align="center">
  <a href="https://discord.gg/gwaKRAYG6t">
    <picture width="320">
      <source media="(prefers-color-scheme: light)" srcset="https://invidget.switchblade.xyz/gwaKRAYG6t?theme=light">
      <source media="(prefers-color-scheme: dark)" srcset="https://invidget.switchblade.xyz/gwaKRAYG6t">
      <img width="320" alt="Join our Discord server" src="https://invidget.switchblade.xyz/gwaKRAYG6t?theme=light">
    </picture>
  </a>
</p>

<p align="center">
  <a href="https://ko-fi.com/arianrhodsandlot">
    <img width="320" src="https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/670f5a0171bfb928b21a7e00_support_me_on_kofi_beige.png" alt="Support me on Ko-fi">
  </a>
</p>

RetroAssembly is the personal retro game collection cabinet in your browser.

> [!NOTE]
> This is a fork of [arianrhodsandlot/retroassembly](https://github.com/arianrhodsandlot/retroassembly). See [Differences From Upstream](#differences-from-upstream) for what changed here. Container images are published only for **this** fork at `ghcr.io/laughinginpurgatory/retroassembly`.

## Features

- [x] Relive memories from numerous retro gaming systems in the browser. NES, SNES, Genesis, Game Boy, Arcade, Commodore, ZX Spectrum, Amstrad CPC… See [Supported Platforms](#supported-platforms) below.
- [x] See your game collection displayed with auto-detected beautiful box arts and covers.
- [x] Bulk-import an existing collection by dropping ROM files onto the storage volume and clicking Scan, instead of uploading one by one.
- [x] Save and synchronize your game at any point and resume later.
- [x] Made a mistake? Some emulators allow you to rewind gameplay.
- [x] Browse through platforms and your game library with an intuitive interface with [spatial navigation](https://en.wikipedia.org/wiki/Spatial_navigation), which means you can just use a keyboard or a gamepad to navigate between games.
- [x] Full host keyboard passthrough for home-computer systems (Commodore / Spectrum / Amstrad) so you can type at the BASIC prompt.
- [x] Enhance your gaming experience with beautiful visual effects with retro-style shaders.
- [x] Play on the go, even without a physical gamepad, using our on-screen virtual controller.

## Screenshots

|          | Desktop                                                                                                                                                                                                 | Mobile                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library  | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/desktop/library.jpg" alt="library-desktop" width="240" height="135">   | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/mobile/library.jpg" alt="library-mobile" width="62" height="135">   |
| Games    | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/desktop/games.jpg" alt="games-desktop" width="240" height="135">       | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/mobile/games.jpg" alt="games-mobile" width="62" height="135">       |
| Platform | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/desktop/platform.jpg" alt="platform-desktop" width="240" height="135"> | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/mobile/platform.jpg" alt="platform-mobile" width="62" height="135"> |
| ROM      | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/desktop/rom.jpg" alt="rom-desktop" width="240" height="135">           | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/mobile/rom.jpg" alt="rom-mobile" width="62" height="135">           |
| Menu     | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/desktop/menu.jpg" alt="menu-desktop" width="240" height="135">         | <img src="https://cdn.jsdelivr.net/gh/arianrhodsandlot/retroassembly-assets@657978eba57dd4920d57436feaa5dbb7a775e5eb/screenshots/mobile/menu.jpg" alt="menu-mobile" width="62" height="135">         |

## Getting Started

### Choose Your Setup

You have two options to get started with RetroAssembly:

#### Option 1: Use the Official Hosted Version

> <small>Recommended for most users. Perfect if you want to get started quickly without any setup.</small>

1. Visit [retroassembly.com](https://retroassembly.com/) in your web browser.
2. _(Optional)_ If you're new here, explore the library and try out the available [demo games](https://retroassembly.com/demo) to see how it works.
3. [Login](https://retroassembly.com/login) and create your personal game library by uploading your own ROM files.
4. Once your ROMs are uploaded, select any game from your library to launch it directly in your browser and start playing.
5. Don't forget to use the in-game menu to save your progress, which will be synchronized for you.

#### Option 2: Self-Host with Docker

> <small>For advanced users who want full control. Perfect if you prefer to host your own instance, have privacy concerns, or want to customize the deployment.</small>

This fork publishes its image to the [GitHub Container Registry](https://github.com/LaughingInPurgatory/retroassembly/pkgs/container/retroassembly) rather than to Docker Hub.

```sh
docker run -d \
  --name retroassembly \
  -p 8000:8000 \
  -v ./data:/app/data \
  --restart unless-stopped \
  ghcr.io/laughinginpurgatory/retroassembly:latest
```

Then open <http://localhost:8000>.

Or with Docker Compose:

```yaml
services:
  retroassembly:
    image: ghcr.io/laughinginpurgatory/retroassembly:latest
    ports: [8000:8000]
    volumes: [./data:/app/data]
    restart: unless-stopped
```

The `/app/data` volume holds the SQLite database and your ROM library, so keep it if you want your library to survive a container rebuild. ROM files live under `/app/data/roms/<platform>/`, one folder per platform (`nes`, `snes`, `c64`, …) — the platform's key is the same slug shown in its URL when browsing the library, e.g. `/library/platform/nes`. If you already have a ROM collection organized this way, drop it straight into that folder on the host and click **Scan** in the app to import it, instead of uploading everything through the browser.

BIOS / firmware files use the same idea: `/app/data/bioses/<platform>/<filename>` with the **original filename** (e.g. `bioses/fds/disksys.rom`). Files already present there are detected automatically when preferences load — no need to re-upload if the name matches what the platform expects.

Only the first account you register (the "super user") can upload or scan ROMs. Add further accounts from **Settings → General → Accounts** with **Shared Library** checked to give family or friends read-only access to the same collection — they can play and save progress, but not add, delete, or edit ROMs.

Images are published on tag pushes. `latest` always points at the most recent release tag; an `edge` tag is published by manually dispatching the workflow. Upstream's images remain available on [Docker Hub](https://hub.docker.com/r/arianrhodsandlot/retroassembly#quick-start).

## Supported Platforms

RetroAssembly aims to support a wide range of vintage gaming systems. Emulation is powered by [Nostalgist.js](https://nostalgist.js.org/).

<details>
  <summary>Click here to view the full list.</summary>

| System                                  | Available Emulators                                |
| --------------------------------------- | -------------------------------------------------- |
| Amstrad CPC                             | `cap32`                                            |
| Arcade                                  | `fbneo`, `mame2003_plus`                           |
| Atari 2600                              | `stella2014`                                       |
| Atari 5200                              | `a5200`                                            |
| Atari 7800                              | `prosystem`                                        |
| Atari Jaguar                            | `virtualjaguar`                                    |
| Atari Lynx                              | `mednafen_lynx`                                    |
| Channel F                               | `freechaf`                                         |
| ColecoVision                            | `gearcoleco`                                       |
| Commodore 64                            | `vice_x64sc`, `vice_x64`, `vice_xscpu64`           |
| Commodore 128                           | `vice_x128`                                        |
| Commodore PET                           | `vice_xpet`                                        |
| Commodore Plus/4 (and Commodore 16)     | `vice_xplus4`                                      |
| Commodore VIC-20                        | `vice_xvic`                                        |
| Famicom Disk System                     | `fceumm`, `nestopia`                               |
| Game & Watch                            | `gw`                                               |
| Game Boy                                | `mgba`, `gearboy`, `gambatte`, `tgbdual`           |
| Game Boy Advance                        | `mgba`, `vba_next`                                 |
| Game Boy Color                          | `mgba`, `gearboy`, `gambatte`, `tgbdual`           |
| Game Gear                               | `genesis_plus_gx`, `gearsystem`                    |
| Genesis / Megadrive                     | `genesis_plus_gx`                                  |
| Magnavox - Odyssey2 / Philips Videopac+ | `o2em`                                             |
| Master System                           | `genesis_plus_gx`, `picodrive`, `gearsystem`       |
| Neo Geo Pocket                          | `mednafen_ngp`                                     |
| Neo Geo Pocket Color                    | `mednafen_ngp`                                     |
| NES / Family Computer                   | `fceumm`, `nestopia`, `quicknes`                   |
| Nintendo 64                             | `mupen64plus_next`                                 |
| PC Engine (TurboGrafx 16)               | `mednafen_pce_fast`                                |
| PlayStation                             | `pcsx_rearmed`                                     |
| Sega 32X                                | `picodrive`                                        |
| Sega SG-1000                            | `gearsystem`                                       |
| Super NES / Super Famicom               | `snes9x`, `snes9x2002`, `snes9x2005`, `snes9x2010` |
| Virtual Boy                             | `mednafen_vb`                                      |
| WonderSwan                              | `mednafen_wswan`                                   |
| WonderSwan Color                        | `mednafen_wswan`                                   |
| ZX Spectrum                             | `fuse`                                             |

</details>

### Keyboard on home computers

Commodore (VICE), ZX Spectrum (Fuse), and Amstrad CPC (Cap32) use the host keyboard for typing. While a game is running:

- Keys are passed through to the emulator (RetroArch **Game Focus** is enabled automatically for these cores).
- **Escape** still opens the in-game overlay / pause menu.
- A gamepad continues to work for joystick-style controls where the core supports it.

Loading a Commodore game from a disk image may require typing a command such as `LOAD"*",8,1` at the BASIC prompt, then Return.

## Differences From Upstream

- **Uploaded ROMs keep their original filenames, in one shared folder.** Upstream stores each upload under a content hash, at `roms/<platform>/<digest><ext>`, keeping the original name only in the database. Here they are stored at `roms/<platform>/<filename>` — readable on disk, and shared by every account rather than split into a folder per user.
- **Only the super user (the first registered account) may upload or scan.** Since the ROM folder above is now shared rather than per-user, only one account is allowed to write to it — the same "super user" concept the account-management settings already used to decide who could create or delete other accounts. Other accounts can be given read-only access to the same library; see [Self-Host with Docker](#option-2-self-host-with-docker) for how.
- **A Scan button imports ROMs dropped directly onto the storage volume**, for bulk-loading an existing collection without uploading file by file through the browser. It appears next to Add on the library homepage and scans every platform folder under `roms/`.
- **Commodore support.** C64, 128, VIC-20, Plus/4 (and 16), and PET via VICE cores. System ROMs are embedded; no external BIOS. Host keyboard passthrough is enabled for typing.
- **Atari Jaguar via Virtual Jaguar.** Not in the shared emscripten core pack; this fork ships the build under `public/cores/` and loads it locally. Most titles use the core's HLE BIOS.
- **ZX Spectrum via Fuse.** Self-built and shipped under `public/cores/`. Tape/snapshot formats (`.tap`, `.tzx`, `.z80`, …). Keyboard passthrough enabled.
- **Amstrad CPC via Caprice32.** Self-built under `public/cores/`. Defaults to the **CPC 6128** model. Disk/tape/snapshot (`.dsk`, `.sna`, `.cdt`, …). Keyboard passthrough enabled.
- **Images publish to the GitHub Container Registry** (`ghcr.io/laughinginpurgatory/retroassembly`) instead of Docker Hub.

## Development (this fork)

```sh
pnpm install
pnpm dev          # http://localhost:8000
pnpm vp check --fix
pnpm test         # Playwright e2e
```

Release / image (fork only — never push to upstream):

```sh
# commit + push origin main, then tag (example scheme v7.yymmdd.HHMM)
git tag v7.yymmdd.HHMM
git push origin v7.yymmdd.HHMM   # triggers Build and Push Docker Image → GHCR
```

## Contributing

See [Contributing](docs/contributing.md). For this fork, open PRs against [LaughingInPurgatory/retroassembly](https://github.com/LaughingInPurgatory/retroassembly).

## Sponsorship

Sponsor the upstream project on [Ko-fi](https://ko-fi.com/arianrhodsandlot) (or [GitHub Sponsors](https://github.com/sponsors/arianrhodsandlot) / [Buy Me a Coffee](https://buymeacoffee.com/arianrhodsandlot)).

## Open-source Alternatives

We hope you have a fantastic time revisiting your favorite retro games… even with applications other than RetroAssembly.

- [EmulatorJS](https://emulatorjs.org) [:octocat:](https://github.com/EmulatorJS/EmulatorJS)
- [GamePlayColor](https://gameplaycolor.com) [:octocat:](https://github.com/gameplaycolor/gameplaycolor)
- [Gaseous](https://github.com/gaseous-project/gaseous-server)
- [RetroArch Web Player](https://web.libretro.com) [:octocat:](https://github.com/libretro/RetroArch/tree/master/pkg/emscripten)
- [RomM](https://romm.app/) [:octocat:](https://github.com/rommapp/romm)
- [vme](https://gitgalu.github.io/vme/) [:octocat:](https://github.com/gitGalu/vme)
- [webrcade](https://www.webrcade.com) [:octocat:](https://github.com/webrcade/webrcade)
- [webretro](https://binbashbanana.github.io/webretro/) [:octocat:](https://github.com/BinBashBanana/webretro)

## License

[MIT](license)
