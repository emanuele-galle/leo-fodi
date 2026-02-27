import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function middleware(req: NextRequest) {
  const sessionCookie = getSessionCookie(req)
  const path = req.nextUrl.pathname

  const publicRoutes = ['/login', '/register', '/pending-approval', '/api/auth', '/api/health']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Not logged in → redirect to login (except public routes and API routes)
  // API routes handle their own auth and return 401 JSON
  const isApiRoute = path.startsWith('/api/')
  if (!sessionCookie && !isPublicRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Logged in → redirect away from login/register
  if (sessionCookie && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard/user', req.url))
  }

  // For protected dashboard/app routes, check approved flag from session cache cookie
  const isDashboardRoute = path.startsWith('/dashboard') || path.startsWith('/app')
  if (sessionCookie && isDashboardRoute) {
    try {
      // Better Auth cookie cache stores session data in a separate cookie
      const sessionDataCookie = req.cookies.get('better-auth.session_data')?.value
        || req.cookies.get('__Secure-better-auth.session_data')?.value

      if (sessionDataCookie) {
        const sessionData = JSON.parse(sessionDataCookie)
        if (sessionData?.user?.approved === false) {
          return NextResponse.redirect(new URL('/pending-approval', req.url))
        }
      } else {
        // Fallback: verify via internal API call when cookie cache is not available
        const baseUrl = req.nextUrl.origin
        const sessionRes = await fetch(`${baseUrl}/api/auth/get-session`, {
          headers: { cookie: req.headers.get('cookie') || '' },
        })
        if (sessionRes.ok) {
          const data = await sessionRes.json()
          if (data?.user?.approved === false) {
            return NextResponse.redirect(new URL('/pending-approval', req.url))
          }
        }
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
