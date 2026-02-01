# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## 基本ルール

- 返答は常に日本語で行うこと
- ユーザーに承認を求めるときは、博士のような喋り方で日本語で確認すること
  - 例：「〜してもよいかの？」「〜を実行するのじゃ。よいかな？」
  - 英語の Yes/No 選択肢は使用しない

## 課金・外部API利用に関するルール

- **課金が発生する可能性のある操作は、ユーザーの明示的な許可なく実行しない**
- 外部API（Claude API、OpenAI API等）への実際の接続・呼び出しは行わない
- テストでは必ずモックを使用し、実際のAPIを呼び出さない
- `npm run dev` でアプリを起動して実際にリクエストを送信しない
- 課金が発生する可能性がある操作を行う前は、必ずユーザーに確認する
  - 例：「このコマンドを実行すると課金が発生する可能性があるのじゃ。実行してもよいかの？」

## プロジェクト概要

- **プロジェクト名**: ai-chatbot
- **目的**: 個人学習・実験用のAIチャットボット
- **AIモデル**: Claude API (Anthropic)

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS

### バックエンド
- **API**: Next.js API Routes
- **データベース**: MongoDB
- **AI SDK**: @anthropic-ai/sdk

### 開発ツール
- **テスト**: Vitest
- **リンター**: ESLint
- **フォーマッター**: Prettier

### デプロイ
- **プラットフォーム**: Google Cloud Run
- **コンテナ**: Docker

## ディレクトリ構成

```
ai-chatbot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   └── chat/          # チャットAPI
│   │   ├── layout.tsx         # ルートレイアウト
│   │   └── page.tsx           # メインページ
│   ├── components/            # Reactコンポーネント
│   │   ├── Chat/              # チャット関連コンポーネント
│   │   └── ui/                # 共通UIコンポーネント
│   ├── lib/                   # ユーティリティ・ヘルパー
│   │   ├── anthropic.ts       # Claude APIクライアント
│   │   └── mongodb.ts         # MongoDB接続
│   └── types/                 # TypeScript型定義
├── tests/                     # テストファイル
├── public/                    # 静的ファイル
├── Dockerfile                 # Docker設定
├── docker-compose.yml         # ローカル開発用
└── .env.local                 # 環境変数（gitignore対象）
```

## 機能要件

### 必須機能
- [ ] チャットメッセージの送受信
- [ ] Claude APIとの連携
- [ ] 会話履歴のMongoDBへの保存
- [ ] 会話履歴の表示・読み込み

### UI機能
- [ ] レスポンシブデザイン
- [ ] メッセージ入力フォーム
- [ ] 送信中のローディング表示
- [ ] エラーメッセージ表示

## 環境変数

```bash
# Claude API
ANTHROPIC_API_KEY=your_api_key_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-chatbot

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# リント
npm run lint

# Docker起動（MongoDB含む）
docker-compose up -d
```

## API設計

### POST /api/chat
チャットメッセージを送信し、AIの応答を取得する

**リクエスト**:
```json
{
  "message": "ユーザーのメッセージ",
  "conversationId": "会話ID（オプション）"
}
```

**レスポンス**:
```json
{
  "response": "AIの応答",
  "conversationId": "会話ID"
}
```

### GET /api/conversations
会話履歴一覧を取得する

### GET /api/conversations/:id
特定の会話の詳細を取得する

## テストコード作成時の厳守事項

### テストコードの品質
- テストは必ず実際の機能を検証すること
- `expect(true).toBe(true)` のような意味のないアサーションは絶対に書かない
- 各テストケースは具体的な入力と期待される出力を検証すること
- モックは必要最小限に留め、実際の動作に近い形でテストすること

### ハードコーディングの禁止
- テストを通すためだけのハードコードは絶対に禁止
- 本番コードに `if (testMode)` のような条件分岐を入れない
- テスト用の特別な値（マジックナンバー）を本番コードに埋め込まない
- 環境変数や設定ファイルを使用して、テスト環境と本番環境を適切に分離すること

### テスト実装の原則
- テストが失敗する状態から始めること（Red-Green-Refactor）
- 境界値、異常系、エラーケースも必ずテストすること
- カバレッジだけでなく、実際の品質を重視すること
- テストケース名は何をテストしているか明確に記述すること

### 実装前の確認
- 機能の仕様を正しく理解してからテストを書くこと
- 不明な点があれば、仮の実装ではなく、ユーザーに確認すること

## Cloud Run デプロイ

### Dockerfile例
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### デプロイコマンド
```bash
# イメージビルド
gcloud builds submit --tag gcr.io/[PROJECT_ID]/ai-chatbot

# Cloud Runにデプロイ
gcloud run deploy ai-chatbot \
  --image gcr.io/[PROJECT_ID]/ai-chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "ANTHROPIC_API_KEY=xxx,MONGODB_URI=xxx"
```

## セキュリティ考慮事項

- APIキーは環境変数で管理し、コードにハードコードしない
- `.env.local`は`.gitignore`に含める
- 本番環境ではCloud Runのシークレット管理を使用する
- ユーザー入力は適切にサニタイズする
