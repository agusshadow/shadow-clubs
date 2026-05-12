'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { List, Map } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'list'

  function setView(v: 'list' | 'map') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border p-1">
      <button
        onClick={() => setView('list')}
        aria-label="Vista lista"
        className={cn(
          'rounded-md p-1.5 transition-colors',
          view !== 'map' ? 'bg-foreground text-background' : 'text-muted-foreground'
        )}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => setView('map')}
        aria-label="Vista mapa"
        className={cn(
          'rounded-md p-1.5 transition-colors',
          view === 'map' ? 'bg-foreground text-background' : 'text-muted-foreground'
        )}
      >
        <Map className="h-4 w-4" />
      </button>
    </div>
  )
}
