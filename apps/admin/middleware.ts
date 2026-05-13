import { updateSession } from '@shadow-clubs/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/clubs', request.url))
  }

  // Forward pathname to server components via request headers
  // (response headers are not readable via headers() in RSCs)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  const nextResponse = NextResponse.next({ request: { headers: requestHeaders } })

  // Copy session cookies from updateSession so auth stays refreshed
  response.cookies.getAll().forEach((cookie) => {
    nextResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return nextResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
}
