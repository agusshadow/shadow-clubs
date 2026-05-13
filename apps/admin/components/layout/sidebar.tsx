'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  adminOnly?: boolean
  badge?: number
}

interface Props {
  isPlatformAdmin: boolean
  pendingApplications: number
}

export function Sidebar({ isPlatformAdmin, pendingApplications }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/clubs', label: 'Clubes', icon: Building2 },
    {
      href: '/applications',
      label: 'Solicitudes',
      icon: ClipboardList,
      adminOnly: true,
      badge: pendingApplications,
    },
    { href: '/users', label: 'Usuarios', icon: Users, adminOnly: true },
    { href: '/reports', label: 'Reportes', icon: BarChart3, adminOnly: true },
  ]

  const visibleItems = navItems.filter((item) => !item.adminOnly || isPlatformAdmin)

  return (
    <aside
      className={cn(
        'bg-card relative flex h-full flex-col border-r transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <span className="text-lg font-bold tracking-tight">Shadow Clubs</span>}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {visibleItems.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const item = (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="flex flex-1 items-center justify-between">
                  {label}
                  {badge && badge > 0 ? (
                    <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs leading-none">
                      {badge}
                    </span>
                  ) : null}
                </span>
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side="right">
                  {label}
                  {badge && badge > 0 ? ` (${badge})` : ''}
                </TooltipContent>
              </Tooltip>
            )
          }

          return item
        })}
      </nav>

      <Separator />

      {/* Collapse toggle */}
      <div className="p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-center rounded-md p-2 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
