import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendMessage, ClaudeAPIError } from '@/lib/anthropic'
import {
  ChatRequest,
  ChatResponse,
  ErrorResponse,
  Message,
} from '@/types/chat'

/**
 * POST /api/chat
 * メッセージを送信し、AIの応答を取得
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ChatResponse | ErrorResponse>> {
  try {
    // リクエストボディを取得
    const body: ChatRequest = await request.json()

    // バリデーション
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      )
    }

    if (body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'メッセージが空です' },
        { status: 400 }
      )
    }

    let conversation = null
    let conversationHistory: Message[] = []

    // 既存の会話を取得
    if (body.conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: body.conversationId },
      })

      if (conversation) {
        conversationHistory = conversation.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          createdAt: msg.createdAt,
        }))
      }
    }

    // Claude APIを呼び出し
    const aiResponse = await sendMessage(body.message, conversationHistory, body.images)

    // 新しいメッセージを作成
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: body.message,
      createdAt: new Date(),
      images: body.images,
    }

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponse,
      createdAt: new Date(),
    }

    if (conversation) {
      // 既存の会話を更新
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messages: {
            push: [userMessage, assistantMessage],
          },
        },
      })
    } else {
      // 新しい会話を作成
      const title =
        body.message.length > 50
          ? body.message.substring(0, 50) + '...'
          : body.message

      conversation = await prisma.conversation.create({
        data: {
          title,
          messages: [userMessage, assistantMessage],
        },
      })
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
    })
  } catch (error) {
    console.error('Chat API Error:', error)

    if (error instanceof ClaudeAPIError) {
      return NextResponse.json(
        {
          error: 'AIからの応答取得に失敗しました',
          details: error.message,
        },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: '内部サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
