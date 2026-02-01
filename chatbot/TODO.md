# AI Chatbot 開発 TODO リスト

## 概要
Claude APIを使用したAIチャットボットアプリケーションの開発計画

---

## Phase 1: プロジェクトセットアップ

### 1.1 Next.js プロジェクト初期化
- [x] Next.js プロジェクトを作成（App Router, TypeScript, Tailwind CSS）
  ```bash
  npx create-next-app@latest ai-chatbot --typescript --tailwind --app --src-dir
  ```
- [x] 不要なボイラープレートコードを削除
- [x] プロジェクト構成の確認

### 1.2 追加パッケージのインストール
- [x] Claude API SDK
  ```bash
  npm install @anthropic-ai/sdk
  ```
- [x] MongoDB クライアント
  ```bash
  npm install mongodb
  ```
- [x] 開発ツール
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```

### 1.3 設定ファイルの作成
- [x] `.env.local` の作成（環境変数）
- [x] `.env.example` の作成（テンプレート）
- [x] `vitest.config.ts` の作成
- [x] `.gitignore` の確認・更新

---

## Phase 2: 開発環境構築

### 2.1 Docker環境
- [x] `Dockerfile` の作成
- [x] `docker-compose.yml` の作成（MongoDB含む）
- [ ] Docker環境での動作確認 ※Dockerインストール後に実行

### 2.2 ローカルMongoDB
- [ ] docker-compose でMongoDBを起動 ※Dockerインストール後に実行
- [ ] 接続確認 ※Dockerインストール後に実行

---

## Phase 3: バックエンド開発

### 3.1 データベース接続
- [x] `src/lib/mongodb.ts` - MongoDB接続ユーティリティ
- [x] 接続プーリングの実装
- [x] 接続テストの作成

### 3.2 Claude API クライアント
- [x] `src/lib/anthropic.ts` - Claude APIクライアント
- [x] エラーハンドリングの実装
- [x] API呼び出しテストの作成

### 3.3 型定義
- [x] `src/types/chat.ts` - チャット関連の型定義
  - Message型
  - Conversation型
  - APIリクエスト/レスポンス型

### 3.4 API Routes 実装
- [x] `POST /api/chat` - メッセージ送信・応答取得
  - リクエストバリデーション
  - Claude API呼び出し
  - 会話履歴の保存
  - エラーハンドリング
- [x] `GET /api/conversations` - 会話一覧取得
- [x] `GET /api/conversations/[id]` - 会話詳細取得
- [x] `DELETE /api/conversations/[id]` - 会話削除（オプション）

### 3.5 API テスト
- [x] 各エンドポイントのユニットテスト
- [x] エラーケースのテスト

---

## Phase 4: フロントエンド開発

### 4.1 レイアウト
- [x] `src/app/layout.tsx` - ルートレイアウト
- [x] 基本的なメタデータ設定
- [x] フォント設定

### 4.2 共通コンポーネント
- [x] `src/components/ui/Button.tsx`
- [x] `src/components/ui/Input.tsx`
- [x] `src/components/ui/LoadingSpinner.tsx`

### 4.3 チャットコンポーネント
- [x] `src/components/Chat/ChatContainer.tsx` - メインコンテナ
- [x] `src/components/Chat/MessageList.tsx` - メッセージ一覧表示
- [x] `src/components/Chat/MessageItem.tsx` - 個別メッセージ
- [x] `src/components/Chat/ChatInput.tsx` - 入力フォーム
- [x] `src/components/Chat/ConversationList.tsx` - 会話履歴サイドバー

### 4.4 メインページ
- [x] `src/app/page.tsx` - チャットページ
- [x] レスポンシブデザイン対応

### 4.5 状態管理・API通信
- [x] チャット送信ロジック（fetch/axios）
- [x] ローディング状態の管理
- [x] エラー状態の管理

### 4.6 フロントエンドテスト
- [x] コンポーネントのユニットテスト
- [x] ユーザーインタラクションのテスト

---

## Phase 5: 機能統合・動作確認

### 5.1 ローカル統合テスト
- [x] フロントエンド ↔ バックエンド通信確認（モックテスト作成済み）
- [x] MongoDB への保存・読み込み確認 ✅ 完了
- [x] Claude API 応答確認 ✅ 完了

### 5.2 エラーハンドリング確認
- [x] API エラー時の表示（テスト作成済み）
- [x] ネットワークエラー時の表示（テスト作成済み）
- [x] 入力バリデーション（テスト作成済み）

---

## Phase 6: Cloud Run デプロイ準備

### 6.1 本番用設定
- [x] `next.config.ts` の本番設定（standalone出力設定済み）
- [x] 環境変数の整理（.env.production.example作成済み）
- [x] ビルドの最適化確認（60MB）

### 6.2 Dockerfile最適化
- [x] マルチステージビルドの確認
- [x] standalone出力の設定
- [x] イメージサイズの最適化（.dockerignore設定済み）

### 6.3 MongoDB Atlas（本番DB）※ユーザー手動タスク
- [ ] MongoDB Atlas アカウント作成
- [ ] クラスター作成
- [ ] 接続文字列の取得
- [ ] IP許可リストの設定

---

## Phase 7: 本番デプロイ ※ユーザー手動タスク

### 7.1 GCP 設定
- [ ] GCP プロジェクト作成/選択
- [ ] Cloud Run API 有効化
- [ ] Container Registry / Artifact Registry 設定

### 7.2 シークレット管理
- [ ] Secret Manager で API キーを管理
- [ ] Cloud Run からシークレットを参照する設定

### 7.3 デプロイ実行
- [ ] Cloud Build でイメージビルド
- [ ] Cloud Run へデプロイ
- [ ] 動作確認

### 7.4 本番確認
- [ ] 本番環境でのチャット動作確認
- [ ] エラーログの確認
- [ ] パフォーマンス確認

---

## Phase 8: 追加機能（オプション）

### 8.1 UI改善
- [ ] ストリーミング応答の実装
- [ ] Markdownレンダリング対応
- [ ] ダークモード対応
- [ ] メッセージコピー機能

### 8.2 機能拡張
- [ ] 新規会話作成機能
- [ ] 会話タイトル自動生成
- [ ] メッセージ検索機能

---

## 進捗管理

| Phase | 状態 | 開始日 | 完了日 |
|-------|------|--------|--------|
| Phase 1: セットアップ | 完了 | 2026-01-31 | 2026-01-31 |
| Phase 2: 開発環境 | 一部完了（Docker未インストール） | 2026-01-31 | - |
| Phase 3: バックエンド | 完了 | 2026-01-31 | 2026-01-31 |
| Phase 4: フロントエンド | 完了 | 2026-01-31 | 2026-01-31 |
| Phase 5: 統合テスト | ✅ 完了（実機テスト確認済み） | 2026-01-31 | 2026-02-01 |
| Phase 6: デプロイ準備 | 完了（MongoDB Atlasはユーザー手動） | 2026-01-31 | 2026-01-31 |
| Phase 7: 本番デプロイ | ユーザー手動タスク | - | - |
| Phase 8: 追加機能 | 未着手 | - | - |

---

## 備考

- 各Phaseは順番に進めることを推奨
- Phase 8（追加機能）は必須ではなく、基本機能完成後に検討
- 不明点があれば都度確認すること

---

## ユーザー手動タスク一覧

以下のタスクはユーザーが手動で実行する必要があります。
詳細な手順は `DEPLOY.md` を参照してください。

### 必須タスク（ローカル動作確認用）

1. **Dockerのインストール**
   - [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

2. **MongoDBの起動**
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

3. **APIキーの設定**
   - [Anthropic Console](https://console.anthropic.com/) でAPIキーを取得
   - `.env.local` の `ANTHROPIC_API_KEY` を実際のキーに変更

4. **アプリの起動と動作確認**
   ```bash
   npm run dev
   ```
   ブラウザで http://localhost:3000 にアクセス

### 本番デプロイ用タスク

1. **MongoDB Atlas のセットアップ**
   - アカウント作成、クラスター作成、接続文字列取得

2. **GCP のセットアップ**
   - プロジェクト作成、Cloud Run API有効化

3. **シークレット設定**
   - Secret Manager にAPIキー、MongoDB URIを保存

4. **デプロイ実行**
   - `gcloud run deploy` コマンド実行

※ 詳細な手順は `DEPLOY.md` を参照
