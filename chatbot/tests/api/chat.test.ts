import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Prismaのモック
const mockConversation = {
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({
  default: {
    conversation: mockConversation,
  },
}))

// Anthropic APIのモック
vi.mock('@/lib/anthropic', () => ({
  sendMessage: vi.fn().mockResolvedValue('AIからの応答'),
  ClaudeAPIError: class ClaudeAPIError extends Error {
    statusCode?: number
    constructor(message: string, statusCode?: number) {
      super(message)
      this.statusCode = statusCode
      this.name = 'ClaudeAPIError'
    }
  },
}))

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConversation.findUnique.mockResolvedValue(null)
    mockConversation.create.mockResolvedValue({
      id: 'new-conv-id',
      title: 'テスト',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  it('新しい会話を作成してレスポンスを返す', async () => {
    const { POST } = await import('@/app/api/chat/route')

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'こんにちは' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.response).toBe('AIからの応答')
    expect(data.conversationId).toBeDefined()
  })

  it('既存の会話に追加する', async () => {
    mockConversation.findUnique.mockResolvedValue({
      id: 'existing-conv-id',
      title: '既存の会話',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockConversation.update.mockResolvedValue({
      id: 'existing-conv-id',
    })

    const { POST } = await import('@/app/api/chat/route')

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: '続きの質問',
        conversationId: 'existing-conv-id',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.conversationId).toBe('existing-conv-id')
  })

  it('メッセージがない場合は400エラー', async () => {
    const { POST } = await import('@/app/api/chat/route')

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('メッセージが必要です')
  })

  it('空のメッセージは400エラー', async () => {
    const { POST } = await import('@/app/api/chat/route')

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: '   ' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('メッセージが空です')
  })
})
