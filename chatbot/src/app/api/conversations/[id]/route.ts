import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Conversation, ErrorResponse } from '@/types/chat'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/conversations/[id]
 * 特定の会話の詳細を取得
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<Conversation | ErrorResponse>> {
  try {
    const { id } = await params

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: '会話が見つかりません' },
        { status: 404 }
      )
    }

    // レスポンス形式に変換
    const result: Conversation = {
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        createdAt: msg.createdAt,
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Conversation Detail API Error:', error)
    return NextResponse.json(
      { error: '会話の取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/conversations/[id]
 * 特定の会話を削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | ErrorResponse>> {
  try {
    const { id } = await params

    // 会話が存在するか確認
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: '会話が見つかりません' },
        { status: 404 }
      )
    }

    // 削除
    await prisma.conversation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conversation Delete API Error:', error)
    return NextResponse.json(
      { error: '会話の削除に失敗しました' },
      { status: 500 }
    )
  }
}
