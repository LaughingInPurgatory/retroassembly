import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export function SidebarContainer({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <aside
      className={clsx(
        'z-1 hidden w-72 shrink-0 flex-col rounded-2xl border border-(--gray-a4) bg-(--color-panel-translucent) px-4 pt-4 text-(--color-text) shadow-2xl [backdrop-filter:var(--backdrop-filter-panel)] transition-all lg:fixed lg:top-4 lg:bottom-4 lg:left-4 lg:flex',
      )}
    >
      {children}
    </aside>
  )
}
