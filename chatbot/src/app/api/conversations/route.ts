import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ConversationListItem, ErrorResponse } from '@/types/chat'

/**
 * GET /api/conversations
 * 会話一覧を取得
 */
export async function GET(): Promise<
  NextResponse<ConversationListItem[] | ErrorResponse>
> {
  try {
    // 会話一覧を取得（新しい順）
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
    })

    // レスポンス形式に変換
    const result: ConversationListItem[] = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Conversations API Error:', error)
    return NextResponse.json(
      { error: '会話一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
