'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { suffix: '', label: 'Resumen' },
  { suffix: '/courts', label: 'Canchas' },
  { suffix: '/reservations', label: 'Reservas' },
  { suffix: '/integrations', label: 'Integraciones' },
  { suffix: '/settings', label: 'Configuración' },
]

export function ClubNav({ clubId }: { clubId: string }) {
  const pathname = usePathname()
  const base = `/clubs/${clubId}`

  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const href = `${base}${tab.suffix}`
        const isActive = tab.suffix === '' ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={tab.suffix}
            href={href}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
