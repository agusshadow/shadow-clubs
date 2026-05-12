import { createServiceClient } from '@/lib/supabase/service'
import { getResend, FROM } from '@/lib/email'
import {
  reservationConfirmedEmail,
  reservationCancelledEmail,
  paymentRejectedEmail,
} from '@/lib/email/templates'

type NotificationType = 'reservation_confirmed' | 'reservation_cancelled' | 'payment_rejected'

export async function sendReservationNotification(
  reservationId: string,
  type: NotificationType
): Promise<void> {
  const supabase = createServiceClient()

  // Fetch reservation with court + club
  const { data: reservation } = await supabase
    .from('reservations')
    .select(
      `id, profile_id, date, start_time, end_time, total_amount,
       courts(name, clubs(name, address, city))`
    )
    .eq('id', reservationId)
    .single()

  if (!reservation) return

  // Get user email from auth.users via admin API
  const { data: userData } = await supabase.auth.admin.getUserById(reservation.profile_id)
  const userEmail = userData?.user?.email
  if (!userEmail) return

  // Get user name from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', reservation.profile_id)
    .single()

  const court = reservation.courts as {
    name: string
    clubs: { name: string; address: string; city: string }
  } | null
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3001'
  const userName = profile?.first_name ?? 'Usuario'

  const emailData = {
    userName,
    courtName: court?.name ?? '—',
    clubName: court?.clubs?.name ?? '—',
    clubAddress: court ? `${court.clubs.address}, ${court.clubs.city}` : '—',
    date: reservation.date,
    startTime: reservation.start_time,
    endTime: reservation.end_time,
    totalAmount: Number(reservation.total_amount),
    reservationId,
    webUrl,
  }

  let subject: string
  let html: string
  let notificationTitle: string
  let notificationBody: string

  if (type === 'reservation_confirmed') {
    ;({ subject, html } = reservationConfirmedEmail(emailData))
    notificationTitle = '¡Reserva confirmada!'
    notificationBody = `${court?.name} · ${new Date(reservation.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}`
  } else if (type === 'reservation_cancelled') {
    ;({ subject, html } = reservationCancelledEmail(emailData))
    notificationTitle = 'Reserva cancelada'
    notificationBody = `Tu reserva en ${court?.name} fue cancelada.`
  } else {
    ;({ subject, html } = paymentRejectedEmail(emailData))
    notificationTitle = 'El pago no se procesó'
    notificationBody = `No pudimos cobrar tu reserva en ${court?.name}.`
  }

  // Send email (skip gracefully if API key not configured)
  if (process.env.RESEND_API_KEY) {
    const { error } = await getResend().emails.send({
      from: FROM,
      to: userEmail,
      subject,
      html,
    })
    if (error) console.error('Resend error:', error)
  }

  // Record in notifications table
  await supabase.from('notifications').insert({
    profile_id: reservation.profile_id,
    reservation_id: reservationId,
    channel: 'email',
    type,
    title: notificationTitle,
    body: notificationBody,
    sent_at: new Date().toISOString(),
  })
}
