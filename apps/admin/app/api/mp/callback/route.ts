import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

function verifyState(state: string): string | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString()
    const parts = decoded.split(':')
    if (parts.length < 3) return null

    const sig = parts.pop()!
    const payload = parts.join(':')

    const expected = createHmac('sha256', process.env.MP_CLIENT_SECRET ?? 'dev-secret')
      .update(payload)
      .digest('hex')

    const sigBuffer = Buffer.from(sig, 'hex')
    const expectedBuffer = Buffer.from(expected, 'hex')
    if (sigBuffer.length !== expectedBuffer.length) return null
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null

    const clubId = parts[0]
    return clubId ?? null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3000'

  if (errorParam || !code || !state) {
    return NextResponse.redirect(new URL('/clubs?mp_error=cancelled', adminUrl))
  }

  const clubId = verifyState(state)
  if (!clubId) {
    return NextResponse.redirect(new URL('/clubs?mp_error=invalid_state', adminUrl))
  }

  const redirectUri = `${adminUrl}/api/mp/callback`
  const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.MP_APP_ID,
      client_secret: process.env.MP_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL(`/clubs/${clubId}/integrations?error=token`, adminUrl))
  }

  const token = (await tokenRes.json()) as {
    access_token: string
    refresh_token: string
    public_key: string
    user_id: number
  }

  const supabase = createServiceClient()

  await supabase.from('club_mp_credentials').upsert(
    {
      club_id: clubId,
      mp_user_id: String(token.user_id),
      mp_access_token: token.access_token,
      mp_refresh_token: token.refresh_token,
      mp_public_key: token.public_key,
      is_active: true,
      connected_at: new Date().toISOString(),
    },
    { onConflict: 'club_id' }
  )

  await supabase.from('clubs').update({ mp_connected: true }).eq('id', clubId)

  return NextResponse.redirect(new URL(`/clubs/${clubId}/integrations?connected=1`, adminUrl))
}
