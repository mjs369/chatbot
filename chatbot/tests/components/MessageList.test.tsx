import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageList from '@/components/Chat/MessageList'
import { Message } from '@/types/chat'

describe('MessageList コンポーネント', () => {
  const messages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'こんにちは',
      createdAt: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'こんにちは！何かお手伝いできますか？',
      createdAt: new Date(),
    },
  ]

  it('メッセージがない場合は空の状態メッセージを表示', () => {
    render(<MessageList messages={[]} />)

    expect(screen.getByText('メッセージがありません')).toBeInTheDocument()
    expect(screen.getByText(/下の入力欄からメッセージを送信/)).toBeInTheDocument()
  })

  it('メッセージ一覧を表示する', () => {
    render(<MessageList messages={messages} />)

    expect(screen.getByText('こんにちは')).toBeInTheDocument()
    expect(screen.getByText('こんにちは！何かお手伝いできますか？')).toBeInTheDocument()
  })

  it('ローディング中はスピナーを表示', () => {
    render(<MessageList messages={messages} isLoading />)

    expect(screen.getByText('AIが考え中...')).toBeInTheDocument()
  })

  it('複数のメッセージが正しい順序で表示される', () => {
    const manyMessages: Message[] = [
      { id: '1', role: 'user', content: '1番目', createdAt: new Date() },
      { id: '2', role: 'assistant', content: '2番目', createdAt: new Date() },
      { id: '3', role: 'user', content: '3番目', createdAt: new Date() },
    ]

    render(<MessageList messages={manyMessages} />)

    const messageTexts = screen.getAllByText(/番目/)
    expect(messageTexts).toHaveLength(3)
    expect(messageTexts[0]).toHaveTextContent('1番目')
    expect(messageTexts[1]).toHaveTextContent('2番目')
    expect(messageTexts[2]).toHaveTextContent('3番目')
  })

  it('ローディング中でもメッセージは表示される', () => {
    render(<MessageList messages={messages} isLoading />)

    expect(screen.getByText('こんにちは')).toBeInTheDocument()
    expect(screen.getByText('AIが考え中...')).toBeInTheDocument()
  })
})
