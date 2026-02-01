import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Prismaのモック
const mockConversations = [
  {
    id: 'conv-1',
    title: '会話1',
    messages: [{ id: '1', role: 'user', content: 'メッセージ1', createdAt: new Date() }],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'conv-2',
    title: '会話2',
    messages: [],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-04'),
  },
]

const mockConversation = {
  findMany: vi.fn().mockResolvedValue(mockConversations),
  findUnique: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/lib/prisma', () => ({
  default: {
    conversation: mockConversation,
  },
}))

describe('GET /api/conversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConversation.findMany.mockResolvedValue(mockConversations)
  })

  it('会話一覧を返す', async () => {
    const { GET } = await import('@/app/api/conversations/route')

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect(data[0].id).toBe('conv-1')
    expect(data[0].messageCount).toBe(1)
  })
})

describe('GET /api/conversations/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('指定した会話を返す', async () => {
    mockConversation.findUnique.mockResolvedValue(mockConversations[0])

    const { GET } = await import('@/app/api/conversations/[id]/route')

    const request = new NextRequest('http://localhost:3000/api/conversations/conv-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'conv-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.id).toBe('conv-1')
    expect(data.title).toBe('会話1')
  })

  it('存在しない会話は404エラー', async () => {
    mockConversation.findUnique.mockResolvedValue(null)

    const { GET } = await import('@/app/api/conversations/[id]/route')

    const request = new NextRequest('http://localhost:3000/api/conversations/not-found')
    const response = await GET(request, { params: Promise.resolve({ id: 'not-found' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('会話が見つかりません')
  })
})

describe('DELETE /api/conversations/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('会話を削除する', async () => {
    mockConversation.findUnique.mockResolvedValue(mockConversations[0])
    mockConversation.delete.mockResolvedValue(mockConversations[0])

    const { DELETE } = await import('@/app/api/conversations/[id]/route')

    const request = new NextRequest('http://localhost:3000/api/conversations/conv-1', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'conv-1' }) })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('存在しない会話の削除は404エラー', async () => {
    mockConversation.findUnique.mockResolvedValue(null)

    const { DELETE } = await import('@/app/api/conversations/[id]/route')

    const request = new NextRequest('http://localhost:3000/api/conversations/not-found', {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'not-found' }) })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('会話が見つかりません')
  })
})
