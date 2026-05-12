import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClubCard } from '@/components/clubs/club-card'
import { SportFilter } from '@/components/clubs/sport-filter'
import { ViewToggle } from '@/components/clubs/view-toggle'
import { MapWrapper } from '@/components/clubs/map-wrapper'

interface Props {
  searchParams: Promise<{ sport?: string; q?: string; view?: string }>
}

export default async function ExplorePage({ searchParams }: Props) {
  const { sport, q, view } = await searchParams
  const isMap = view !== 'list'
  const supabase = await createClient()

  let query = supabase
    .from('clubs')
    .select('id, name, slug, city, province, cover_url, lat, lng, courts(sport)')
    .eq('is_active', true)
    .order('name')

  if (q) query = query.ilike('name', `%${q}%`)

  const { data: clubs } = await query

  const filtered =
    sport && clubs ? clubs.filter((c) => c.courts.some((court) => court.sport === sport)) : clubs

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 space-y-3 border-b px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Explorar</h1>
            <p className="text-muted-foreground text-sm">Encontrá tu cancha</p>
          </div>
          <Suspense fallback={null}>
            <ViewToggle />
          </Suspense>
        </div>
        <Suspense>
          <SportFilter />
        </Suspense>
      </div>

      {/* Content */}
      {isMap ? (
        <div className="min-h-0 flex-1">
          <MapWrapper clubs={filtered ?? []} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {filtered?.length === 0 && (
            <div className="text-muted-foreground py-16 text-center text-sm">
              No se encontraron clubes{sport ? ` con canchas de ${sport}` : ''}.
            </div>
          )}
          <div className="grid gap-4">
            {filtered?.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
