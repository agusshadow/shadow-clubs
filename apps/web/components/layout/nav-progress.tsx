'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const prevPathname = useRef(pathname)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      setVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setVisible(false), 400)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-[9999] h-0.5 w-full overflow-hidden">
      <div className="bg-primary animate-nav-progress h-full w-full" />
    </div>
  )
}
