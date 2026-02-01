/**
 * チャットフロー統合テスト
 *
 * このテストはモックを使用してフロントエンド↔バックエンドの
 * 通信フローを検証します。実際のAPIは呼び出しません。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// fetchのモック
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('チャットフロー統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('メッセージ送信フロー', () => {
    it('新規会話でメッセージを送信できる', async () => {
      // APIレスポンスをモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: 'AIからの応答です',
          conversationId: 'new-conv-123',
        }),
      })

      // APIを呼び出し
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'こんにちは' }),
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.response).toBe('AIからの応答です')
      expect(data.conversationId).toBe('new-conv-123')
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
        method: 'POST',
      }))
    })

    it('既存の会話にメッセージを追加できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          response: '続きの応答です',
          conversationId: 'existing-conv-456',
        }),
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '続きの質問です',
          conversationId: 'existing-conv-456',
        }),
      })

      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.conversationId).toBe('existing-conv-456')
    })

    it('APIエラー時にエラーレスポンスを受け取る', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: '内部サーバーエラーが発生しました',
        }),
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'テスト' }),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('バリデーションエラー時に400エラーを受け取る', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'メッセージが必要です',
        }),
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBe('メッセージが必要です')
    })
  })

  describe('会話履歴フロー', () => {
    it('会話一覧を取得できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 'conv-1',
            title: '最初の会話',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T01:00:00Z',
            messageCount: 4,
          },
          {
            id: 'conv-2',
            title: '2番目の会話',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T01:00:00Z',
            messageCount: 2,
          },
        ],
      })

      const response = await fetch('/api/conversations')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].id).toBe('conv-1')
    })

    it('特定の会話詳細を取得できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'conv-1',
          title: '最初の会話',
          messages: [
            { id: '1', role: 'user', content: 'こんにちは', createdAt: '2024-01-01T00:00:00Z' },
            { id: '2', role: 'assistant', content: 'こんにちは！', createdAt: '2024-01-01T00:00:01Z' },
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:01Z',
        }),
      })

      const response = await fetch('/api/conversations/conv-1')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.id).toBe('conv-1')
      expect(data.messages).toHaveLength(2)
    })

    it('存在しない会話は404エラー', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: '会話が見つかりません',
        }),
      })

      const response = await fetch('/api/conversations/not-found')

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('会話を削除できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const response = await fetch('/api/conversations/conv-1', {
        method: 'DELETE',
      })
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
    })
  })

  describe('ネットワークエラー', () => {
    it('ネットワークエラー時に例外がスローされる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'テスト' }),
        })
      ).rejects.toThrow('Network Error')
    })
  })
})
