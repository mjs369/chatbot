import { NextRequest, NextResponse } from 'next/server'

const APP_PASSWORD = process.env.APP_PASSWORD || 'chatbot2024'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === APP_PASSWORD) {
      const response = NextResponse.json({ success: true })
      // 認証済みクッキーを設定（7日間有効）
      response.cookies.set('auth_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      })
      return response
    }

    return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: '認証エラー' }, { status: 500 })
  }
}
