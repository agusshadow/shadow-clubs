import { updateSession } from '@shadow-clubs/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_ROUTES = ['/login', '/register']
const PROTECTED_ROUTES = ['/reservations', '/profile', '/book']

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAuthRoute = AUTH_ROUTES.includes(pathname)
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (!user && isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
}
