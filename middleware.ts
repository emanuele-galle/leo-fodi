import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function middleware(req: NextRequest) {
  const sessionCookie = getSessionCookie(req)
  const path = req.nextUrl.pathname

  const publicRoutes = ['/login', '/register', '/pending-approval', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Not logged in → redirect to login (except public routes)
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Logged in → redirect away from login/register
  if (sessionCookie && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard/user', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
