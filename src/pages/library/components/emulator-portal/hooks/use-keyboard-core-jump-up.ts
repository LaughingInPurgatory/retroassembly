import { useEffect } from 'react'

// Standard gamepad layout: face button X/west is index 3; d-pad up is usually 12.
// 8-bit joysticks often had one fire + 4-way stick; map X onto Up for jump while
// keeping the real d-pad/stick up mapping (OR into the up button's pressed state).
const jumpButtonIndex = 3

function cloneButton(source: GamepadButton, overrides: Partial<GamepadButton> = {}): GamepadButton {
  return {
    pressed: overrides.pressed ?? source.pressed,
    touched: overrides.touched ?? source.touched,
    value: overrides.value ?? source.value,
  }
}

function wrapGamepad(pad: Gamepad, upButtonIndex: number): Gamepad {
  if (!pad.buttons[jumpButtonIndex]?.pressed || !pad.buttons[upButtonIndex]) {
    return pad
  }

  const buttons = pad.buttons.map((button, index) => {
    if (index === upButtonIndex) {
      return cloneButton(button, { pressed: true, touched: true, value: Math.max(button.value, 1) })
    }
    return button
  })

  return new Proxy(pad, {
    get(target, property, receiver) {
      if (property === 'buttons') {
        return buttons
      }
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}

/**
 * While enabled, RetroArch (and anything else reading navigator.getGamepads)
 * sees d-pad/stick Up as pressed whenever gamepad button 3 is held, without
 * removing the original Up binding.
 */
export function useKeyboardCoreJumpUp(enabled: boolean, upButtonIndex: number) {
  useEffect(() => {
    if (!enabled || typeof navigator.getGamepads !== 'function') {
      return
    }

    const upIndex = Number.isFinite(upButtonIndex) ? upButtonIndex : 12
    const originalGetGamepads = navigator.getGamepads.bind(navigator)

    navigator.getGamepads = function getGamepads() {
      return originalGetGamepads().map((pad) => (pad ? wrapGamepad(pad, upIndex) : null))
    }

    return () => {
      navigator.getGamepads = originalGetGamepads
    }
  }, [enabled, upButtonIndex])
}
