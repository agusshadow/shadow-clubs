import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ reservationId: string }>
  searchParams: Promise<{
    collection_status?: string
    mp_status?: string
    payment_id?: string
  }>
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { reservationId } = await params
  const { collection_status, mp_status, payment_id } = await searchParams

  const supabase = await createClient()

  const { data: reservation } = await supabase
    .from('reservations')
    .select(
      `id, date, start_time, end_time, status, total_amount, court_amount, platform_fee,
       courts(name, clubs(name, slug, address, city)),
       payments(status, mp_payment_id)`
    )
    .eq('id', reservationId)
    .single()

  if (!reservation) notFound()

  const court = reservation.courts as { name: string; clubs: { name: string; slug: string } } | null
  const payment = Array.isArray(reservation.payments)
    ? reservation.payments[0]
    : reservation.payments

  // Determine status: MP redirect params are faster than webhook, but webhook is authoritative
  const mpOutcome = collection_status ?? mp_status
  const isSuccess =
    reservation.status === 'confirmed' || payment?.status === 'approved' || mpOutcome === 'approved'
  const isFailure =
    reservation.status === 'cancelled' || payment?.status === 'rejected' || mpOutcome === 'failure'
  const isPending = !isSuccess && !isFailure

  const dateLabel = new Date(reservation.date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6 text-center">
      {isSuccess && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500" />
          <div className="space-y-1">
            <h1 className="text-xl font-bold">¡Reserva confirmada!</h1>
            <p className="text-muted-foreground text-sm">Tu turno quedó reservado exitosamente</p>
          </div>
        </>
      )}

      {isFailure && (
        <>
          <XCircle className="text-destructive h-16 w-16" />
          <div className="space-y-1">
            <h1 className="text-xl font-bold">El pago no pudo procesarse</h1>
            <p className="text-muted-foreground text-sm">
              Podés intentarlo de nuevo o elegir otro turno
            </p>
          </div>
        </>
      )}

      {isPending && (
        <>
          <Clock className="h-16 w-16 text-yellow-500" />
          <div className="space-y-1">
            <h1 className="text-xl font-bold">Pago en proceso</h1>
            <p className="text-muted-foreground text-sm">
              Estamos verificando tu pago. Te notificaremos cuando se confirme.
            </p>
          </div>
        </>
      )}

      {/* Reservation details */}
      {(isSuccess || isPending) && court && (
        <div className="w-full max-w-xs space-y-2 rounded-xl border p-4 text-left text-sm">
          <p className="font-semibold">{court.name}</p>
          <p className="text-muted-foreground">{court.clubs?.name}</p>
          <p className="capitalize">{dateLabel}</p>
          <p>
            {reservation.start_time.slice(0, 5)} – {reservation.end_time.slice(0, 5)}
          </p>
          <div className="flex justify-between border-t pt-2 font-medium">
            <span>Total pagado</span>
            <span>${Number(reservation.total_amount).toLocaleString('es-AR')}</span>
          </div>
          {(payment?.mp_payment_id ?? payment_id) && (
            <p className="text-muted-foreground text-xs">
              ID de pago: {payment?.mp_payment_id ?? payment_id}
            </p>
          )}
        </div>
      )}

      <div className="flex w-full max-w-xs flex-col gap-3">
        {isSuccess && (
          <Button asChild className="w-full">
            <Link href="/reservations">Ver mis reservas</Link>
          </Button>
        )}
        {isFailure && (
          <Button asChild className="w-full">
            <Link href={`/clubs/${court?.clubs?.slug}`}>Volver al club</Link>
          </Button>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
