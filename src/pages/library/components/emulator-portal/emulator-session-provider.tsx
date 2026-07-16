import { createContext, type ReactNode, useContext, useRef } from 'react'
import { useGamepadMapping, type GamepadMapping } from '#@/pages/library/hooks/use-gamepad-mapping.ts'

const EmulatorGamepadMappingContext = createContext<GamepadMapping | null>(null)

export function EmulatorSessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const gamepadMapping = useGamepadMapping()
  const emulatorGamepadMapping = useRef(gamepadMapping).current

  return (
    <EmulatorGamepadMappingContext.Provider value={emulatorGamepadMapping}>
      {children}
    </EmulatorGamepadMappingContext.Provider>
  )
}

export function useEmulatorGamepadMapping() {
  const gamepadMapping = useContext(EmulatorGamepadMappingContext)
  if (!gamepadMapping) {
    throw new Error('useEmulatorGamepadMapping must be used within EmulatorSessionProvider')
  }

  return gamepadMapping
}
