import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { DateSlotPicker } from '@/components/clubs/date-slot-picker'

const sportLabels: Record<string, string> = {
  football: 'Fútbol',
  tennis: 'Tenis',
  paddle: 'Pádel',
  basketball: 'Básquet',
  volleyball: 'Vóley',
  squash: 'Squash',
  other: 'Otro',
}

const surfaceLabels: Record<string, string> = {
  grass: 'Césped natural',
  synthetic_grass: 'Césped sintético',
  clay: 'Polvo de ladrillo',
  hard: 'Hormigón',
  wood: 'Madera',
  concrete: 'Cemento',
  other: 'Otro',
}

interface Props {
  params: Promise<{ slug: string; courtId: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function CourtDetailPage({ params, searchParams }: Props) {
  const { slug, courtId } = await params
  const { date } = await searchParams

  const today = new Date().toISOString().split('T')[0]!
  const selectedDate = date ?? today
  const dayOfWeek = new Date(selectedDate + 'T12:00:00').getDay()

  const supabase = await createClient()

  const [
    { data: court },
    { data: club },
    { data: slots },
    { data: reservations },
    { data: policy },
  ] = await Promise.all([
    supabase
      .from('courts')
      .select('id, name, sport, surface, is_indoor, capacity, description, image_url')
      .eq('id', courtId)
      .eq('is_active', true)
      .single(),

    supabase
      .from('clubs')
      .select('id, name, slug, lat, lng, address, city')
      .eq('slug', slug)
      .single(),

    supabase
      .from('court_slot_templates')
      .select('id, start_time, end_time, price_ars')
      .eq('court_id', courtId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .order('start_time'),

    supabase
      .from('reservations')
      .select('start_time, status')
      .eq('court_id', courtId)
      .eq('date', selectedDate)
      .neq('status', 'cancelled'),

    supabase
      .from('club_cancellation_policies')
      .select('hours_before_start, refund_type, refund_percentage')
      .eq('is_active', true)
      .maybeSingle(),
  ])

  if (!court || !club) notFound()

  const takenTimes = new Set((reservations ?? []).map((r) => r.start_time))

  const slotsWithAvailability = (slots ?? []).map((slot) => ({
    ...slot,
    price_ars: Number(slot.price_ars),
    available: !takenTimes.has(slot.start_time),
  }))

  return (
    <div className="pb-8">
      {/* Back */}
      <div className="p-4">
        <Link
          href={`/clubs/${slug}`}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          {club.name}
        </Link>
      </div>

      {/* Image */}
      {court.image_url && (
        <div className="aspect-[16/7] w-full overflow-hidden">
          <img src={court.image_url} alt={court.name} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="space-y-5 px-4 pt-4">
        {/* Info */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold">{court.name}</h1>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{sportLabels[court.sport] ?? court.sport}</Badge>
            <Badge variant="secondary">{surfaceLabels[court.surface] ?? court.surface}</Badge>
            <Badge variant="secondary">{court.is_indoor ? 'Cubierta' : 'Descubierta'}</Badge>
            <Badge variant="secondary">{court.capacity} jugadores</Badge>
          </div>
          {court.description && (
            <p className="text-muted-foreground text-sm">{court.description}</p>
          )}
        </div>

        {/* Date + slots */}
        <Suspense>
          <DateSlotPicker
            courtId={courtId}
            slots={slotsWithAvailability}
            selectedDate={selectedDate}
          />
        </Suspense>

        {/* Cancellation policy */}
        {policy && (
          <div className="bg-muted rounded-xl p-4 text-sm">
            <p className="font-medium">Política de cancelación</p>
            <p className="text-muted-foreground mt-1">
              {policy.refund_type === 'none'
                ? 'Sin reembolso al cancelar.'
                : policy.refund_type === 'full'
                  ? `Reembolso completo si cancelás con más de ${policy.hours_before_start}hs de anticipación.`
                  : `Reembolso del ${policy.refund_percentage}% si cancelás con más de ${policy.hours_before_start}hs de anticipación.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
