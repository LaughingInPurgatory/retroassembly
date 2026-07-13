import { useEffect } from 'react'

// Virtual Jaguar (default input path) reads RETRO_DEVICE_KEYBOARD for the console
// keypad: main-row 0-9, Minus → *, Equal → #. Translate the PC numpad onto that.
const numpadToJaguarKeyboard: Record<string, { code: string; key: string; keyCode: number }> = {
  Numpad0: { code: 'Digit0', key: '0', keyCode: 48 },
  Numpad1: { code: 'Digit1', key: '1', keyCode: 49 },
  Numpad2: { code: 'Digit2', key: '2', keyCode: 50 },
  Numpad3: { code: 'Digit3', key: '3', keyCode: 51 },
  Numpad4: { code: 'Digit4', key: '4', keyCode: 52 },
  Numpad5: { code: 'Digit5', key: '5', keyCode: 53 },
  Numpad6: { code: 'Digit6', key: '6', keyCode: 54 },
  Numpad7: { code: 'Digit7', key: '7', keyCode: 55 },
  Numpad8: { code: 'Digit8', key: '8', keyCode: 56 },
  Numpad9: { code: 'Digit9', key: '9', keyCode: 57 },
  // Numpad * → Jaguar *
  NumpadMultiply: { code: 'Minus', key: '-', keyCode: 189 },
  // Numpad - → Jaguar #
  NumpadSubtract: { code: 'Equal', key: '=', keyCode: 187 },
}

const remappedFlag = '__jaguarNumpadRemapped'

export function useJaguarNumpad(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const abortController = new AbortController()

    function handle(event: KeyboardEvent) {
      if ((event as KeyboardEvent & { [remappedFlag]?: boolean })[remappedFlag]) {
        return
      }

      const target = numpadToJaguarKeyboard[event.code]
      if (!target) {
        return
      }

      event.preventDefault()
      event.stopImmediatePropagation()

      const synthetic = new KeyboardEvent(event.type, {
        altKey: event.altKey,
        bubbles: true,
        cancelable: true,
        code: target.code,
        ctrlKey: event.ctrlKey,
        key: target.key,
        metaKey: event.metaKey,
        repeat: event.repeat,
        shiftKey: event.shiftKey,
      })
      // RetroArch's emscripten build still reads the legacy keyCode/which fields.
      Object.defineProperty(synthetic, 'keyCode', { value: target.keyCode })
      Object.defineProperty(synthetic, 'which', { value: target.keyCode })
      Object.defineProperty(synthetic, remappedFlag, { value: true })
      ;(event.target ?? globalThis).dispatchEvent(synthetic)
    }

    // Capture so we rewrite the event before RetroArch/Emscripten sees the raw numpad code.
    globalThis.addEventListener('keydown', handle, { capture: true, signal: abortController.signal })
    globalThis.addEventListener('keyup', handle, { capture: true, signal: abortController.signal })

    return () => {
      abortController.abort()
    }
  }, [enabled])
}
