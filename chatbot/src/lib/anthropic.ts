import Anthropic from '@anthropic-ai/sdk'
import { Message } from '@/types/chat'

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
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))
}

/**
 * Claude APIを呼び出してレスポンスを取得
 */
export async function sendMessage(
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<string> {
  try {
    // 会話履歴を整形
    const messages: Anthropic.MessageParam[] = [
      ...formatMessagesForAPI(conversationHistory),
      { role: 'user', content: userMessage },
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
