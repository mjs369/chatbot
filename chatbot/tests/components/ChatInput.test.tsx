import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInput from '@/components/Chat/ChatInput'

describe('ChatInput コンポーネント', () => {
  it('テキストエリアが表示される', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByPlaceholderText(/メッセージを入力/)).toBeInTheDocument()
  })

  it('送信ボタンが表示される', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByRole('button', { name: '送信' })).toBeInTheDocument()
  })

  it('空のメッセージでは送信ボタンが無効', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByRole('button', { name: '送信' })).toBeDisabled()
  })

  it('メッセージ入力後に送信ボタンが有効になる', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={vi.fn()} />)

    const textarea = screen.getByPlaceholderText(/メッセージを入力/)
    await user.type(textarea, 'こんにちは')

    expect(screen.getByRole('button', { name: '送信' })).not.toBeDisabled()
  })

  it('送信後にテキストエリアがクリアされる', async () => {
    const user = userEvent.setup()
    const handleSend = vi.fn()
    render(<ChatInput onSend={handleSend} />)

    const textarea = screen.getByPlaceholderText(/メッセージを入力/)
    await user.type(textarea, 'テストメッセージ')

    fireEvent.click(screen.getByRole('button', { name: '送信' }))

    expect(handleSend).toHaveBeenCalledWith('テストメッセージ')
    expect(textarea).toHaveValue('')
  })

  it('isLoading時に送信ボタンが無効になる', () => {
    render(<ChatInput onSend={vi.fn()} isLoading />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('disabled時にテキストエリアが無効になる', () => {
    render(<ChatInput onSend={vi.fn()} disabled />)
    expect(screen.getByPlaceholderText(/メッセージを入力/)).toBeDisabled()
  })

  it('空白のみのメッセージは送信されない', async () => {
    const user = userEvent.setup()
    const handleSend = vi.fn()
    render(<ChatInput onSend={handleSend} />)

    const textarea = screen.getByPlaceholderText(/メッセージを入力/)
    await user.type(textarea, '   ')

    expect(screen.getByRole('button', { name: '送信' })).toBeDisabled()
  })
})
