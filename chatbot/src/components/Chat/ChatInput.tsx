'use client'

import { useState, FormEvent, KeyboardEvent } from 'react'
import Button from '../ui/Button'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export default function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enterで送信
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900"
    >
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力... (Shift+Enterで送信)"
            disabled={isLoading || disabled}
            rows={1}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading || disabled}
          isLoading={isLoading}
          className="h-12"
        >
          送信
        </Button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Shift+Enterで送信 / Enterで改行
      </p>
    </form>
  )
}
