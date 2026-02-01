import { describe, it, expect, vi, beforeEach } from 'vitest'

// Anthropic SDKのモック
const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: 'text', text: 'モックされた応答です' }],
})

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
      }
    },
    APIError: class APIError extends Error {
      status: number
      constructor(status: number, message: string) {
        super(message)
        this.status = status
        this.name = 'APIError'
      }
    },
  }
})

// 環境変数を設定
vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key')

describe('Anthropic APIクライアント', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'モックされた応答です' }],
    })
  })

  it('sendMessageがAIの応答を返す', async () => {
    const { sendMessage } = await import('@/lib/anthropic')
    const response = await sendMessage('こんにちは')

    expect(response).toBe('モックされた応答です')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'こんにちは' }),
        ]),
      })
    )
  })

  it('sendMessageが会話履歴を考慮する', async () => {
    const { sendMessage } = await import('@/lib/anthropic')
    const history = [
      {
        id: '1',
        role: 'user' as const,
        content: '前のメッセージ',
        createdAt: new Date(),
      },
      {
        id: '2',
        role: 'assistant' as const,
        content: '前の応答',
        createdAt: new Date(),
      },
    ]

    const response = await sendMessage('新しいメッセージ', history)

    expect(response).toBe('モックされた応答です')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: '前のメッセージ' }),
          expect.objectContaining({ role: 'assistant', content: '前の応答' }),
          expect.objectContaining({ role: 'user', content: '新しいメッセージ' }),
        ]),
      })
    )
  })

  it('testConnectionが成功時にtrueを返す', async () => {
    const { testConnection } = await import('@/lib/anthropic')
    const result = await testConnection()

    expect(result).toBe(true)
  })

  it('testConnectionが失敗時にfalseを返す', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'))

    const { testConnection } = await import('@/lib/anthropic')
    const result = await testConnection()

    expect(result).toBe(false)
  })
})

describe('ClaudeAPIError', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('エラーが正しく作成される', async () => {
    const { ClaudeAPIError } = await import('@/lib/anthropic')
    const error = new ClaudeAPIError('テストエラー', 400)

    expect(error.message).toBe('テストエラー')
    expect(error.statusCode).toBe(400)
    expect(error.name).toBe('ClaudeAPIError')
  })

  it('statusCodeなしでもエラーが作成される', async () => {
    const { ClaudeAPIError } = await import('@/lib/anthropic')
    const error = new ClaudeAPIError('テストエラー')

    expect(error.message).toBe('テストエラー')
    expect(error.statusCode).toBeUndefined()
  })
})
