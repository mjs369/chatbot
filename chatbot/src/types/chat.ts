// メッセージの役割
export type MessageRole = 'user' | 'assistant'

// 個別メッセージ
export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: Date
}

// 会話
export interface Conversation {
  _id?: string
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// チャットAPIリクエスト
export interface ChatRequest {
  message: string
  conversationId?: string
}

// チャットAPIレスポンス
export interface ChatResponse {
  response: string
  conversationId: string
}

// 会話一覧レスポンス
export interface ConversationListItem {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}

// エラーレスポンス
export interface ErrorResponse {
  error: string
  details?: string
}
