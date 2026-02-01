'use client'

import { useState, useEffect, useCallback } from 'react'
import { Message, ConversationListItem, Conversation, ImageAttachment } from '@/types/chat'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import ConversationList from './ConversationList'

export default function ChatContainer() {
  // 状態管理
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 会話一覧を取得
  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    try {
      const response = await fetch('/api/conversations')
      if (!response.ok) {
        throw new Error('会話一覧の取得に失敗しました')
      }
      const data: ConversationListItem[] = await response.json()
      setConversations(data)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  // 特定の会話を取得
  const fetchConversation = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (!response.ok) {
        throw new Error('会話の取得に失敗しました')
      }
      const data: Conversation = await response.json()
      setMessages(data.messages)
      setCurrentConversationId(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '会話の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // メッセージを送信
  const handleSendMessage = async (content: string, images?: ImageAttachment[]) => {
    setIsLoading(true)
    setError(null)

    // 楽観的更新: ユーザーメッセージを先に表示
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
      images,
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId: currentConversationId,
          images,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'メッセージの送信に失敗しました')
      }

      const data = await response.json()

      // AIの応答を追加
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // 会話IDを更新
      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId)
      }

      // 会話一覧を更新
      fetchConversations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      // エラー時は楽観的更新を取り消す
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  // 新しいチャットを開始
  const handleNewChat = () => {
    setMessages([])
    setCurrentConversationId(undefined)
    setError(null)
    setIsSidebarOpen(false)
  }

  // 会話を選択
  const handleSelectConversation = (id: string) => {
    fetchConversation(id)
    setIsSidebarOpen(false)
  }

  // 初回ロード時に会話一覧を取得
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* モバイル用オーバーレイ */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-72 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          isLoading={isLoadingConversations}
        />
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* ヘッダー */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            aria-label="メニューを開く"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Chatbot
          </h1>
          <div className="w-10 md:hidden" /> {/* スペーサー */}
        </header>

        {/* エラー表示 */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
            >
              閉じる
            </button>
          </div>
        )}

        {/* メッセージ一覧 */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* 入力欄 */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  )
}
