import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageItem from '@/components/Chat/MessageItem'
import { Message } from '@/types/chat'

describe('MessageItem コンポーネント', () => {
  const userMessage: Message = {
    id: '1',
    role: 'user',
    content: 'ユーザーのメッセージ',
    createdAt: new Date(),
  }

  const assistantMessage: Message = {
    id: '2',
    role: 'assistant',
    content: 'AIの応答',
    createdAt: new Date(),
  }

  it('ユーザーメッセージが正しく表示される', () => {
    render(<MessageItem message={userMessage} />)

    expect(screen.getByText('ユーザーのメッセージ')).toBeInTheDocument()
    expect(screen.getByText('あなた')).toBeInTheDocument()
  })

  it('AIメッセージが正しく表示される', () => {
    render(<MessageItem message={assistantMessage} />)

    expect(screen.getByText('AIの応答')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('ユーザーメッセージは右寄せ', () => {
    const { container } = render(<MessageItem message={userMessage} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('justify-end')
  })

  it('AIメッセージは左寄せ', () => {
    const { container } = render(<MessageItem message={assistantMessage} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('justify-start')
  })

  it('ユーザーメッセージに青背景が適用される', () => {
    const { container } = render(<MessageItem message={userMessage} />)

    // 青背景のdivを探す
    const blueBox = container.querySelector('.bg-blue-600')
    expect(blueBox).toBeInTheDocument()
  })

  it('長いメッセージが折り返される', () => {
    const longMessage: Message = {
      ...userMessage,
      content: 'これは非常に長いメッセージです。'.repeat(10),
    }
    render(<MessageItem message={longMessage} />)

    const content = screen.getByText(/これは非常に長いメッセージです/)
    expect(content).toHaveClass('break-words')
  })
})
