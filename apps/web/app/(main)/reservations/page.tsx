import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReservationCard } from '@/components/reservations/reservation-card'
import { cn } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ tab?: string }>
}

type Tab = 'upcoming' | 'past' | 'cancelled'

const tabs: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Próximas' },
  { key: 'past', label: 'Pasadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

export default async function ReservationsPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const activeTab: Tab = tab === 'past' || tab === 'cancelled' ? tab : 'upcoming'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/reservations')

  const today = new Date().toISOString().slice(0, 10)

  const { data: reservations } = await supabase
    .from('reservations')
    .select(
      `id, date, start_time, end_time, status, total_amount,
       courts(name, clubs(name, slug))`
    )
    .eq('profile_id', user.id)
    .order('date', { ascending: activeTab !== 'past' })
    .order('start_time', { ascending: activeTab !== 'past' })

  const all = reservations ?? []

  const filtered = all.filter((r) => {
    if (activeTab === 'upcoming') return r.status !== 'cancelled' && r.date >= today
    if (activeTab === 'past') return r.status !== 'cancelled' && r.date < today
    return r.status === 'cancelled'
  })

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-4 pt-5 pb-0">
        <h1 className="mb-3 text-lg font-bold">Mis reservas</h1>
        <div className="flex gap-1">
          {tabs.map(({ key, label }) => (
            <Link
              key={key}
              href={`/reservations?tab=${key}`}
              className={cn(
                'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                activeTab === key
                  ? 'border-foreground text-foreground'
                  : 'text-muted-foreground border-transparent'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-3 p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-muted-foreground text-sm">
              {activeTab === 'upcoming'
                ? 'No tenés reservas próximas'
                : activeTab === 'past'
                  ? 'Aún no tenés reservas pasadas'
                  : 'No tenés reservas canceladas'}
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/explore" className="text-sm font-medium underline underline-offset-2">
                Explorar canchas
              </Link>
            )}
          </div>
        ) : (
          filtered.map((r) => {
            const court = r.courts as { name: string; clubs: { name: string; slug: string } } | null
            return (
              <ReservationCard
                key={r.id}
                id={r.id}
                courtName={court?.name ?? '—'}
                clubName={court?.clubs?.name ?? '—'}
                clubSlug={court?.clubs?.slug ?? ''}
                date={r.date}
                startTime={r.start_time}
                endTime={r.end_time}
                totalAmount={Number(r.total_amount)}
                status={r.status as 'pending' | 'confirmed' | 'cancelled'}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
