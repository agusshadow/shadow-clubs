import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Clock, MapPin, Receipt } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CancelButton } from '@/components/reservations/cancel-button'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
}

const statusClass: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function ReservationDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/reservations')

  const { data: reservation } = await supabase
    .from('reservations')
    .select(
      `id, date, start_time, end_time, status, total_amount, court_amount, platform_fee,
       cancelled_at, cancellation_reason,
       courts(name, clubs(name, slug, address, city, phone, id)),
       payments(mp_payment_id, status, paid_at)`
    )
    .eq('id', id)
    .eq('profile_id', user.id)
    .single()

  if (!reservation) notFound()

  const court = reservation.courts as {
    name: string
    clubs: {
      name: string
      slug: string
      address: string
      city: string
      phone: string | null
      id: string
    }
  } | null
  const payment = Array.isArray(reservation.payments)
    ? reservation.payments[0]
    : reservation.payments

  const dateLabel = new Date(reservation.date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Cancellable: confirmed/pending + future slot
  const slotStart = new Date(`${reservation.date}T${reservation.start_time}`)
  const isCancellable =
    (reservation.status === 'confirmed' || reservation.status === 'pending') &&
    slotStart > new Date()

  // Fetch cancellation policy for this club
  let policyText: string | null = null
  if (isCancellable && court?.clubs?.id) {
    const { data: policy } = await supabase
      .from('club_cancellation_policies')
      .select('hours_before_start, refund_type, refund_percentage')
      .eq('club_id', court.clubs.id)
      .eq('is_active', true)
      .maybeSingle()

    if (policy) {
      const hoursUntil = Math.round((slotStart.getTime() - Date.now()) / 36e5)
      if (hoursUntil >= policy.hours_before_start) {
        if (policy.refund_type === 'full') {
          policyText = 'Cancelando ahora recibirás un reembolso completo.'
        } else if (policy.refund_type === 'partial') {
          policyText = `Cancelando ahora recibirás un reembolso del ${policy.refund_percentage}%.`
        } else {
          policyText = 'Esta reserva no tiene reembolso al cancelar.'
        }
      } else {
        policyText = `Fuera del plazo de cancelación (${policy.hours_before_start}h antes). No corresponde reembolso.`
      }
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-4">
        <Link href="/reservations" className="text-muted-foreground">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold">Detalle de reserva</h1>
        <span
          className={cn(
            'ml-auto rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusClass[reservation.status]
          )}
        >
          {statusLabel[reservation.status]}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Court & Club */}
        <div className="space-y-3 rounded-xl border p-4">
          <div className="space-y-0.5">
            <p className="font-semibold">{court?.name}</p>
            <p className="text-muted-foreground text-sm">{court?.clubs?.name}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="capitalize">{dateLabel}</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {reservation.start_time.slice(0, 5)} – {reservation.end_time.slice(0, 5)}
              </span>
            </div>
            {court?.clubs && (
              <div className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {court.clubs.address}, {court.clubs.city}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="space-y-2 rounded-xl border p-4 text-sm">
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="text-muted-foreground h-4 w-4" />
            <p className="font-medium">Detalle del pago</p>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Precio del turno</span>
            <span>${Number(reservation.court_amount).toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Comisión de servicio</span>
            <span>${Number(reservation.platform_fee).toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total</span>
            <span>${Number(reservation.total_amount).toLocaleString('es-AR')}</span>
          </div>
          {payment?.mp_payment_id && (
            <p className="text-muted-foreground pt-1 text-xs">
              ID de pago: {payment.mp_payment_id}
            </p>
          )}
        </div>

        {/* Cancellation info */}
        {reservation.status === 'cancelled' && reservation.cancelled_at && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-medium">Reserva cancelada</p>
            <p className="mt-1 text-xs">
              {new Date(reservation.cancelled_at).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>

      {/* Cancel CTA */}
      {isCancellable && (
        <div className="space-y-3 border-t p-4">
          {policyText && <p className="text-muted-foreground text-center text-xs">{policyText}</p>}
          <CancelButton reservationId={reservation.id} />
        </div>
      )}
    </div>
  )
}
