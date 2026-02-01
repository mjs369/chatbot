# AI Chatbot アプリケーション仕様書

## 1. 概要

Claude（Anthropic社のAI）を利用した対話型チャットボットアプリケーション。
ユーザーが入力したメッセージに対してAIが応答し、会話履歴をデータベースに永続化する。

---

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|----------|------|------------|
| フレームワーク | Next.js (App Router) | 16.x |
| 言語 | TypeScript | 5.x |
| UI | React + Tailwind CSS | 19.x / 4.x |
| AI API | Anthropic Claude API | claude-sonnet-4-20250514 |
| データベース | MongoDB Atlas | - |
| ORM | Prisma | 6.x |
| ホスティング | Google Cloud Run | - |
| テスト | Vitest + Testing Library | 4.x |

---

## 3. システムアーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   ブラウザ       │────▶│  Cloud Run      │────▶│  Claude API     │
│   (React)       │◀────│  (Next.js)      │◀────│  (Anthropic)    │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │  MongoDB Atlas  │
                        │                 │
                        └─────────────────┘
```

---

## 4. ディレクトリ構成

```
chatbot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/verify/    # 認証API
│   │   │   ├── chat/           # チャットAPI
│   │   │   └── conversations/  # 会話管理API
│   │   ├── login/              # ログインページ
│   │   ├── layout.tsx          # ルートレイアウト
│   │   └── page.tsx            # メインページ
│   ├── components/             # Reactコンポーネント
│   │   ├── Chat/               # チャット関連
│   │   └── ui/                 # 汎用UI
│   ├── lib/                    # ユーティリティ
│   │   ├── anthropic.ts        # Claude APIクライアント
│   │   └── prisma.ts           # Prismaクライアント
│   ├── types/                  # 型定義
│   └── middleware.ts           # 認証ミドルウェア
├── prisma/
│   └── schema.prisma           # データベーススキーマ
├── tests/                      # テストファイル
└── public/                     # 静的ファイル
```

---

## 5. データベース設計

### Conversation（会話）

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | ObjectId | 一意識別子 |
| title | String | 会話タイトル（最初のメッセージ） |
| messages | Message[] | メッセージ配列（埋め込み） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### Message（メッセージ）- 埋め込みドキュメント

| フィールド | 型 | 説明 |
|------------|-----|------|
| id | String (UUID) | メッセージID |
| role | String | "user" または "assistant" |
| content | String | メッセージ内容 |
| createdAt | DateTime | 作成日時 |

---

## 6. API仕様

### POST /api/chat
メッセージを送信してAI応答を取得

**リクエスト:**
```json
{
  "message": "こんにちは",
  "conversationId": "xxx" // 省略可（新規会話）
}
```

**レスポンス:**
```json
{
  "response": "こんにちは！何かお手伝いできることはありますか？",
  "conversationId": "xxx"
}
```

### GET /api/conversations
会話一覧を取得

**レスポンス:**
```json
[
  {
    "id": "xxx",
    "title": "こんにちは",
    "messageCount": 4,
    "createdAt": "2026-01-31T00:00:00Z",
    "updatedAt": "2026-01-31T00:00:00Z"
  }
]
```

### GET /api/conversations/[id]
特定の会話を取得

### DELETE /api/conversations/[id]
会話を削除

### POST /api/auth/verify
パスワード認証

**リクエスト:**
```json
{
  "password": "chatbot2024"
}
```

---

## 7. 認証フロー

1. ユーザーがURLにアクセス
2. ミドルウェアが`auth_token`クッキーをチェック
3. 未認証の場合、`/login`にリダイレクト
4. パスワード入力 → `/api/auth/verify`で検証
5. 認証成功時、`auth_token`クッキーを設定（7日間有効）
6. メインページにリダイレクト

---

## 8. コンポーネント構成

### ページ
- `page.tsx` - メインチャットページ
- `login/page.tsx` - ログインページ

### チャットコンポーネント
- `ChatContainer` - チャット全体のコンテナ
- `MessageList` - メッセージ一覧表示
- `MessageItem` - 個別メッセージ
- `ChatInput` - 入力フォーム
- `ConversationList` - 会話履歴サイドバー

### UIコンポーネント
- `Button` - ボタン
- `Input` - 入力フィールド
- `LoadingSpinner` - ローディング表示

### キーボード操作
| 操作 | 動作 |
|------|------|
| Shift+Enter | メッセージを送信 |
| Enter | 改行 |

---

## 9. 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| ANTHROPIC_API_KEY | Claude APIキー | ○ |
| DATABASE_URL | MongoDB接続文字列 | ○ |
| APP_PASSWORD | ログインパスワード | ○ |
| NODE_ENV | 環境（production/development） | - |

---

## 10. デプロイ

### ビルド＆デプロイコマンド

```bash
# Cloud Buildでイメージビルド
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-chatbot

# Cloud Runにデプロイ
gcloud run deploy ai-chatbot \
  --image gcr.io/PROJECT_ID/ai-chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest,DATABASE_URL=mongodb-uri:latest,APP_PASSWORD=app-password:latest"
```

---

## 11. テスト

```bash
# 全テスト実行
npm test

# カバレッジ付き
npm run test:coverage
```

### テストカテゴリ
- `tests/api/` - APIエンドポイントテスト
- `tests/components/` - コンポーネントテスト
- `tests/lib/` - ユーティリティテスト
- `tests/integration/` - 統合テスト

---

## 12. 制限事項・注意点

- Claude APIは従量課金（入力$3/100万トークン、出力$15/100万トークン）
- MongoDB Atlas Free Tier: 512MBストレージ制限
- Cloud Run Free Tier: 月200万リクエストまで無料
- パスワード認証は簡易的なもの（本格運用にはOAuth推奨）
