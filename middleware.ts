import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
import { auth } from '@/lib/auth'

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

  // For protected dashboard/app routes, verify the approved flag
  const isDashboardRoute = path.startsWith('/dashboard') || path.startsWith('/app')
  if (sessionCookie && isDashboardRoute) {
    try {
      const session = await auth.api.getSession({ headers: req.headers })
      const user = session?.user as any
      if (user && user.approved === false) {
        return NextResponse.redirect(new URL('/pending-approval', req.url))
      }
    } catch {
      // If session check fails, allow through (auth errors handled in page/API)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
