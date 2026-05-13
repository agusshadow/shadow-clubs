import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function signState(clubId: string): string {
  const payload = `${clubId}:${Date.now()}`
  const sig = createHmac('sha256', process.env.MP_CLIENT_SECRET ?? 'dev-secret')
    .update(payload)
    .digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const clubId = request.nextUrl.searchParams.get('club_id')
  if (!clubId) {
    return NextResponse.redirect(new URL('/clubs', request.url))
  }

  const { count } = await supabase
    .from('club_members')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('profile_id', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('platform_role')
    .eq('id', user.id)
    .single()

  const hasAccess = (count ?? 0) > 0 || profile?.platform_role === 'platform_admin'
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/clubs', request.url))
  }

  const appId = process.env.MP_APP_ID
  if (!appId) {
    return NextResponse.redirect(new URL(`/clubs/${clubId}/integrations?error=config`, request.url))
  }

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3000'
  const redirectUri = `${adminUrl}/api/mp/callback`
  const state = signState(clubId)

  const authUrl = new URL('https://auth.mercadopago.com.ar/authorization')
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('platform_id', 'mp')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('redirect_uri', redirectUri)

  return NextResponse.redirect(authUrl)
}
