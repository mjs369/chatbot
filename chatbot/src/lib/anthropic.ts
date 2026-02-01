import Anthropic from '@anthropic-ai/sdk'
import { Message, ImageAttachment } from '@/types/chat'

// Anthropicクライアントのインスタンス（遅延初期化）
let anthropicClient: Anthropic | null = null

function getClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY 環境変数が設定されていません')
    }
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

// デフォルトのモデル
const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

// 最大トークン数
const MAX_TOKENS = 4096

// システムプロンプト
const SYSTEM_PROMPT = `あなたは親切で知識豊富なAIアシスタントです。
ユーザーの質問に対して、正確で分かりやすい回答を提供してください。
日本語で回答してください。`

/**
 * Claude APIエラー
 */
export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ClaudeAPIError'
  }
}

/**
 * 会話履歴をClaude API形式に変換
 */
function formatMessagesForAPI(
  messages: Message[]
): Anthropic.MessageParam[] {
  return messages.map((msg) => {
    // contentが既に配列形式の場合はそのまま使用
    if (Array.isArray(msg.content)) {
      return {
        role: msg.role,
        content: msg.content,
      }
    }

    // contentが文字列の場合
    return {
      role: msg.role,
      content: msg.content,
    }
  })
}

// サポートされる画像のメディアタイプ
type SupportedMediaType = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'

/**
 * 画像を含むメッセージコンテンツを構築
 */
function buildMessageContent(
  text: string,
  images?: ImageAttachment[]
): string | Anthropic.ContentBlockParam[] {
  // 画像がない場合は文字列をそのまま返す
  if (!images || images.length === 0) {
    return text
  }

  // 画像がある場合は配列形式で返す
  const content: Anthropic.ContentBlockParam[] = []

  // 画像を追加
  images.forEach((image) => {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: image.mediaType as SupportedMediaType,
        data: image.data,
      },
    })
  })

  // テキストを追加（空でない場合）
  if (text.trim()) {
    content.push({
      type: 'text',
      text: text,
    })
  }

  return content
}

/**
 * Claude APIを呼び出してレスポンスを取得
 */
export async function sendMessage(
  userMessage: string,
  conversationHistory: Message[] = [],
  images?: ImageAttachment[]
): Promise<string> {
  try {
    // 会話履歴を整形
    const messages: Anthropic.MessageParam[] = [
      ...formatMessagesForAPI(conversationHistory),
      {
        role: 'user',
        content: buildMessageContent(userMessage, images),
      },
    ]

    // Claude APIを呼び出し
    const response = await getClient().messages.create({
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages,
    })

    // レスポンスからテキストを抽出
    const textContent = response.content.find(
      (block) => block.type === 'text'
    )

    if (!textContent || textContent.type !== 'text') {
      throw new ClaudeAPIError('レスポンスにテキストが含まれていません')
    }

    return textContent.text
  } catch (error) {
    // Anthropic APIエラーの処理
    if (error instanceof Anthropic.APIError) {
      throw new ClaudeAPIError(
        `Claude API エラー: ${error.message}`,
        error.status,
        error
      )
    }

    // その他のエラー
    if (error instanceof ClaudeAPIError) {
      throw error
    }

    throw new ClaudeAPIError(
      'Claude APIの呼び出し中に予期せぬエラーが発生しました',
      undefined,
      error
    )
  }
}

/**
 * APIの接続テスト
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await getClient().messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }],
    })
    return response.content.length > 0
  } catch {
    return false
  }
}
