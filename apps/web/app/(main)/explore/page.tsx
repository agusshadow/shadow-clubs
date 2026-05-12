import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClubCard } from '@/components/clubs/club-card'
import { SportFilter } from '@/components/clubs/sport-filter'

interface Props {
  searchParams: Promise<{ sport?: string; q?: string }>
}

export default async function ExplorePage({ searchParams }: Props) {
  const { sport, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('clubs')
    .select('id, name, slug, city, province, cover_url, courts(sport)')
    .eq('is_active', true)
    .order('name')

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: clubs } = await query

  const filtered =
    sport && clubs ? clubs.filter((c) => c.courts.some((court) => court.sport === sport)) : clubs

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Explorar</h1>
        <p className="text-muted-foreground text-sm">Encontrá tu cancha</p>
      </div>

      <Suspense>
        <SportFilter />
      </Suspense>

      {filtered?.length === 0 && (
        <div className="text-muted-foreground py-16 text-center text-sm">
          No se encontraron clubes
          {sport ? ` con canchas de ${sport}` : ''}.
        </div>
      )}

      <div className="grid gap-4">
        {filtered?.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </div>
  )
}
