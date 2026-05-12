'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function bookingError(reason: string): never {
  redirect(`/book/error?reason=${encodeURIComponent(reason)}`)
}

export async function createBooking(formData: FormData): Promise<void> {
  const courtId = formData.get('courtId') as string
  const slotId = formData.get('slotId') as string
  const date = formData.get('date') as string

  if (!courtId || !slotId || !date) bookingError('Datos incompletos')

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/book/${courtId}?slotId=${slotId}&date=${date}`)

  // Fetch slot with court and club info
  const { data: slot } = await supabase
    .from('court_slot_templates')
    .select('id, start_time, end_time, price_ars, courts(id, name, club_id, clubs(id, name, slug))')
    .eq('id', slotId)
    .eq('court_id', courtId)
    .eq('is_active', true)
    .single()

  if (!slot) bookingError('Turno no encontrado o inactivo')

  // Check availability (idempotent guard)
  const { data: existing } = await supabase
    .from('reservations')
    .select('id')
    .eq('court_id', courtId)
    .eq('date', date)
    .eq('start_time', slot.start_time)
    .neq('status', 'cancelled')
    .maybeSingle()

  if (existing) bookingError('Este turno ya fue reservado. Elegí otro.')

  // Calculate amounts
  const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE ?? '0.08')
  const courtAmount = Number(slot.price_ars)
  const platformFee = Math.round(courtAmount * commissionRate * 100) / 100
  const totalAmount = parseFloat((courtAmount + platformFee).toFixed(2))

  // Create reservation (pending until payment confirmed by webhook)
  const { data: reservation, error: resError } = await supabase
    .from('reservations')
    .insert({
      court_id: courtId,
      profile_id: user.id,
      slot_template_id: slotId,
      date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: 'pending',
      total_amount: totalAmount,
      court_amount: courtAmount,
      platform_fee: platformFee,
    })
    .select('id')
    .single()

  if (resError || !reservation) bookingError('Error al crear la reserva. Intentá de nuevo.')

  // Build MP preference
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3001'
  const court = slot.courts as { name: string; clubs: { name: string } } | null
  const courtName = court?.name ?? 'Cancha'
  const clubName = court?.clubs?.name ?? 'Club'

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const timeLabel = `${slot.start_time.slice(0, 5)}–${slot.end_time.slice(0, 5)}`

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [
        {
          id: slotId,
          title: `${courtName} — ${clubName}`,
          description: `${dateLabel} · ${timeLabel}`,
          quantity: 1,
          unit_price: totalAmount,
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${webUrl}/book/confirmation/${reservation.id}`,
        failure: `${webUrl}/book/confirmation/${reservation.id}?mp_status=failure`,
        pending: `${webUrl}/book/confirmation/${reservation.id}?mp_status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${webUrl}/api/webhooks/mp`,
      external_reference: reservation.id,
      metadata: {
        reservation_id: reservation.id,
        court_id: courtId,
        slot_id: slotId,
        date,
      },
    }),
  })

  if (!mpRes.ok) {
    await supabase.from('reservations').delete().eq('id', reservation.id)
    const mpError = await mpRes.json().catch(() => ({}))
    console.error('MP preference error:', mpError)
    bookingError('Error al conectar con Mercado Pago. Intentá de nuevo.')
  }

  const mpData = (await mpRes.json()) as { id: string; init_point: string }

  // Store payment record
  await supabase.from('payments').insert({
    reservation_id: reservation.id,
    mp_preference_id: mpData.id,
    status: 'pending',
    amount: totalAmount,
    platform_fee: platformFee,
    currency: 'ARS',
  })

  // Redirect to Mercado Pago checkout
  redirect(mpData.init_point)
}
