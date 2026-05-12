'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Compass, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/explore', label: 'Explorar', icon: Compass, exact: false },
  { href: '/reservations', label: 'Reservas', icon: Calendar, exact: false },
  { href: '/profile', label: 'Perfil', icon: User, exact: false },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-card border-t">
      <ul className="flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <Icon
                  className={cn('h-5 w-5', active ? 'text-foreground' : 'text-muted-foreground')}
                />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
