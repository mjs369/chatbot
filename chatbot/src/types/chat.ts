// メッセージの役割
export type MessageRole = 'user' | 'assistant'

// 画像データ
export interface ImageAttachment {
  data: string // Base64エンコードされた画像データ
  mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
  name?: string
}

// メッセージコンテンツ（テキストまたは画像）
export type MessageContent =
  | string
  | Array<{ type: 'text'; text: string } | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }>

// 個別メッセージ
export interface Message {
  id: string
  role: MessageRole
  content: MessageContent
  createdAt: Date
  images?: ImageAttachment[] // UI表示用
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
  images?: ImageAttachment[]
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
