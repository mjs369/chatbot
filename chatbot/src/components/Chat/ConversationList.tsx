'use client'

import { ConversationListItem } from '@/types/chat'

interface ConversationListProps {
  conversations: ConversationListItem[]
  currentConversationId?: string
  onSelect: (id: string) => void
  onNewChat: () => void
  isLoading?: boolean
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelect,
  onNewChat,
  isLoading = false,
}: ConversationListProps) {
  const formatDate = (date: Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + 新しいチャット
        </button>
      </div>

      {/* 会話一覧 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            読み込み中...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            会話履歴がありません
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => onSelect(conv.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                      : ''
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                    {conv.title}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(conv.updatedAt)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {conv.messageCount}件
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
