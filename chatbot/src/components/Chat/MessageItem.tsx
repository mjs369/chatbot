'use client'

import { Message } from '@/types/chat'

interface MessageItemProps {
  message: Message
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'
  const contentText = typeof message.content === 'string' ? message.content : ''

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium opacity-70">
            {isUser ? 'あなた' : 'AI'}
          </span>
        </div>

        {/* 画像表示 */}
        {message.images && message.images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.images.map((image, index) => (
              <img
                key={index}
                src={`data:${image.mediaType};base64,${image.data}`}
                alt={image.name || `画像 ${index + 1}`}
                className="max-w-xs rounded-lg border border-gray-300 dark:border-gray-600"
              />
            ))}
          </div>
        )}

        {/* テキスト表示 */}
        {contentText && (
          <p className="whitespace-pre-wrap break-words text-sm md:text-base">
            {contentText}
          </p>
        )}
      </div>
    </div>
  )
}
