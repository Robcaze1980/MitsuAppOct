import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session) {
    const { data: { user } } = await supabase.auth.getUser()
    const role = user?.user_metadata.role

    if (role === 'admin' && !req.nextUrl.pathname.startsWith('/dashboard/admin')) {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url))
    }

    if (role === 'manager' && !req.nextUrl.pathname.startsWith('/dashboard/manager')) {
      return NextResponse.redirect(new URL('/dashboard/manager', req.url))
    }

    if (role === 'salesperson' && !req.nextUrl.pathname.startsWith('/dashboard/salesperson')) {
      return NextResponse.redirect(new URL('/dashboard/salesperson', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
