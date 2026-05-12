import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Clock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createBooking } from '@/lib/actions/book'
import { BookButton } from '@/components/book/book-button'

interface Props {
  params: Promise<{ courtId: string }>
  searchParams: Promise<{ date?: string; slotId?: string }>
}

export default async function BookSummaryPage({ params, searchParams }: Props) {
  const { courtId } = await params
  const { date, slotId } = await searchParams

  if (!date || !slotId) redirect('/')

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: slot }, { data: court }] = await Promise.all([
    supabase
      .from('court_slot_templates')
      .select('id, start_time, end_time, price_ars')
      .eq('id', slotId)
      .eq('court_id', courtId)
      .single(),

    supabase
      .from('courts')
      .select('id, name, sport, clubs(name, slug, address, city)')
      .eq('id', courtId)
      .single(),
  ])

  if (!slot || !court) notFound()

  const club = court.clubs as { name: string; slug: string; address: string; city: string } | null
  const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? '0.08')
  const courtAmount = Number(slot.price_ars)
  const platformFee = Math.round(courtAmount * commissionRate * 100) / 100
  const totalAmount = courtAmount + platformFee

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const action = createBooking.bind(null)

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-4">
        <Link
          href={`/clubs/${club?.slug}/courts/${courtId}?date=${date}`}
          className="text-muted-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold">Confirmá tu reserva</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4">
        {/* Slot summary */}
        <div className="space-y-3 rounded-xl border p-4">
          <div className="space-y-1">
            <p className="font-semibold">{court.name}</p>
            <p className="text-muted-foreground text-sm">{club?.name}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="capitalize">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground h-4 w-4 shrink-0" />
              <span>
                {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
              </span>
            </div>
            {club && (
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-muted-foreground">
                  {club.address}, {club.city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium">Detalle del pago</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio del turno</span>
              <span>${courtAmount.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Comisión de servicio ({Math.round(commissionRate * 100)}%)
              </span>
              <span>${platformFee.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total a pagar</span>
              <span>${totalAmount.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          El pago es procesado de forma segura por Mercado Pago
        </p>
      </div>

      {/* Bottom action */}
      <div className="border-t p-4">
        {user ? (
          <form action={action}>
            <input type="hidden" name="courtId" value={courtId} />
            <input type="hidden" name="slotId" value={slotId} />
            <input type="hidden" name="date" value={date} />
            <BookButton total={totalAmount} />
          </form>
        ) : (
          <Link
            href={`/login?redirectTo=/book/${courtId}?date=${date}&slotId=${slotId}`}
            className="bg-primary text-primary-foreground block w-full rounded-xl py-3.5 text-center text-sm font-semibold"
          >
            Iniciá sesión para reservar
          </Link>
        )}
      </div>
    </div>
  )
}
