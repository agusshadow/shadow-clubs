import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendReservationNotification } from '@/lib/notifications'

type MpNotification = {
  action: string
  data: { id: string }
}

type MpPayment = {
  id: number
  status: 'approved' | 'rejected' | 'cancelled' | 'pending' | 'in_process' | string
  external_reference: string
  transaction_amount: number
  date_approved: string | null
}

function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // skip in local dev without secret

  const header = req.headers.get('x-signature') ?? ''
  const requestId = req.headers.get('x-request-id') ?? ''

  // Header format: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${new URL(req.url).searchParams.get('data.id') ?? ''};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return timingSafeEqual(Buffer.from(v1), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  let body: MpNotification
  const rawBody = await req.text()

  try {
    body = JSON.parse(rawBody) as MpNotification
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!verifySignature(req, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Only handle payment updates
  if (body.action !== 'payment.updated' && body.action !== 'payment.created') {
    return NextResponse.json({ received: true })
  }

  const mpPaymentId = body.data?.id
  if (!mpPaymentId) return NextResponse.json({ received: true })

  // Fetch payment details from MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    cache: 'no-store',
  })

  if (!mpRes.ok) {
    console.error('MP payment fetch failed:', mpPaymentId, mpRes.status)
    return NextResponse.json({ error: 'MP fetch failed' }, { status: 502 })
  }

  const payment = (await mpRes.json()) as MpPayment
  const reservationId = payment.external_reference

  if (!reservationId) {
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  const paymentStatus =
    payment.status === 'approved'
      ? 'approved'
      : payment.status === 'rejected' || payment.status === 'cancelled'
        ? 'rejected'
        : 'pending'

  const reservationStatus =
    paymentStatus === 'approved'
      ? 'confirmed'
      : paymentStatus === 'rejected'
        ? 'cancelled'
        : undefined

  // Update payment record
  await supabase
    .from('payments')
    .update({
      mp_payment_id: String(payment.id),
      status: paymentStatus,
      paid_at: payment.date_approved ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw_mp_response: payment as any,
    })
    .eq('reservation_id', reservationId)

  // Update reservation if terminal status reached and send notification
  if (reservationStatus) {
    await supabase
      .from('reservations')
      .update({ status: reservationStatus })
      .eq('id', reservationId)

    // Fire-and-forget — don't block the webhook response
    sendReservationNotification(
      reservationId,
      paymentStatus === 'approved' ? 'reservation_confirmed' : 'payment_rejected'
    ).catch((err) => console.error('Notification error:', err))
  }

  return NextResponse.json({ received: true })
}
