'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const SPORTS = [
  { value: '', label: 'Todos' },
  { value: 'football', label: 'Fútbol' },
  { value: 'tennis', label: 'Tenis' },
  { value: 'paddle', label: 'Pádel' },
  { value: 'basketball', label: 'Básquet' },
  { value: 'volleyball', label: 'Vóley' },
  { value: 'squash', label: 'Squash' },
]

export function SportFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('sport') ?? ''

  function setFilter(sport: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (sport) params.set('sport', sport)
    else params.delete('sport')
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {SPORTS.map((s) => (
        <button
          key={s.value}
          onClick={() => setFilter(s.value)}
          className={cn(
            'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            current === s.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground hover:border-foreground/30'
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
