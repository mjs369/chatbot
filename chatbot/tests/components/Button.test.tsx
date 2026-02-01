import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/ui/Button'

describe('Button コンポーネント', () => {
  it('子要素を正しくレンダリングする', () => {
    render(<Button>テストボタン</Button>)
    expect(screen.getByRole('button', { name: 'テストボタン' })).toBeInTheDocument()
  })

  it('クリックイベントが発火する', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>クリック</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabled状態でクリックが無効になる', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>無効ボタン</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('isLoading時に「送信中...」が表示される', () => {
    render(<Button isLoading>送信</Button>)

    expect(screen.getByText('送信中...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('variant="secondary"でセカンダリスタイルが適用される', () => {
    render(<Button variant="secondary">セカンダリ</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-200')
  })

  it('size="lg"で大きいサイズが適用される', () => {
    render(<Button size="lg">大きいボタン</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3')
  })
})
