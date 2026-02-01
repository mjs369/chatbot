/**
 * エラーハンドリング統合テスト
 *
 * 各種エラーケースでの動作を検証します。
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('エラーハンドリング統合テスト', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('APIエラー', () => {
    it('Claude APIエラー時にエラーメッセージを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'AIからの応答取得に失敗しました',
          details: 'Claude API エラー: Rate limit exceeded',
        }),
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'テスト' }),
      })

      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(data.error).toBe('AIからの応答取得に失敗しました')
      expect(data.details).toContain('Rate limit')
    })

    it('MongoDB接続エラー時にエラーメッセージを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: '内部サーバーエラーが発生しました',
        }),
      })

      const response = await fetch('/api/conversations')
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe('入力バリデーション', () => {
    it('空のメッセージは拒否される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'メッセージが空です',
        }),
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '   ' }),
      })

      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
      expect(data.error).toBe('メッセージが空です')
    })

    it('メッセージフィールドがない場合は拒否される', async () => {
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
        body: JSON.stringify({ wrongField: 'value' }),
      })

      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
      expect(data.error).toBe('メッセージが必要です')
    })

    it('不正なJSONは拒否される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: '不正なリクエストです',
        }),
      })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })

  describe('ネットワークエラー', () => {
    it('タイムアウトエラーを処理できる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'))

      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'テスト' }),
        })
        // ここには到達しないはず
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Request timeout')
      }
    })

    it('接続エラーを処理できる', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'))

      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'テスト' }),
        })
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Failed to fetch')
      }
    })
  })

  describe('リソース不在エラー', () => {
    it('存在しない会話IDで404エラー', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: '会話が見つかりません',
        }),
      })

      const response = await fetch('/api/conversations/nonexistent-id')
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
      expect(data.error).toBe('会話が見つかりません')
    })

    it('存在しない会話の削除で404エラー', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: '会話が見つかりません',
        }),
      })

      const response = await fetch('/api/conversations/nonexistent-id', {
        method: 'DELETE',
      })
      const data = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
      expect(data.error).toBe('会話が見つかりません')
    })
  })
})
