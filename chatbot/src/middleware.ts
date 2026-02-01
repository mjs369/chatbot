import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 認証不要のパス
  const publicPaths = ['/login', '/api/auth/verify']
  const pathname = request.nextUrl.pathname

  // 公開パスはスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 静的ファイルはスキップ
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // 認証チェック
  const authToken = request.cookies.get('auth_token')

  if (!authToken || authToken.value !== 'authenticated') {
    // ログインページにリダイレクト
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
