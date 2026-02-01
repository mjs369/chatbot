'use client'

import { useState, FormEvent, KeyboardEvent, useRef, ChangeEvent } from 'react'
import Button from '../ui/Button'
import { ImageAttachment } from '@/types/chat'

interface ChatInputProps {
  onSend: (message: string, images?: ImageAttachment[]) => void
  isLoading?: boolean
  disabled?: boolean
}

export default function ChatInput({
  onSend,
  isLoading = false,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<ImageAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if ((message.trim() || images.length > 0) && !isLoading && !disabled) {
      onSend(message.trim(), images.length > 0 ? images : undefined)
      setMessage('')
      setImages([])
    }
  }

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: ImageAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // ファイルタイプのチェック
      if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
        alert(`${file.name}は対応していない形式です。PNG、JPEG、GIF、WebPのみ対応しています。`)
        continue
      }

      // Base64エンコード
      const base64 = await fileToBase64(file)

      newImages.push({
        data: base64,
        mediaType: file.type as ImageAttachment['mediaType'],
        name: file.name,
      })
    }

    setImages([...images, ...newImages])

    // ファイル選択をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // data:image/png;base64,... から base64部分のみを取得
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
    })
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
      <div className="max-w-4xl mx-auto">
        {/* 画像プレビュー */}
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={`data:${image.mediaType};base64,${image.data}`}
                  alt={image.name || `画像 ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="画像を削除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
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

          {/* 画像添付ボタン */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            onChange={handleImageSelect}
            className="hidden"
            disabled={isLoading || disabled}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || disabled}
            variant="secondary"
            className="h-12 px-4"
            aria-label="画像を添付"
          >
            📎
          </Button>

          <Button
            type="submit"
            disabled={(!message.trim() && images.length === 0) || isLoading || disabled}
            isLoading={isLoading}
            className="h-12"
          >
            送信
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Shift+Enterで送信 / Enterで改行
        </p>
      </div>
    </form>
  )
}
