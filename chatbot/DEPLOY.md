# デプロイ手順書

このドキュメントでは、AI ChatbotをGoogle Cloud Runにデプロイする手順を説明します。

## 前提条件

- Google Cloud アカウント
- gcloud CLI がインストール済み
- Docker Desktop がインストール済み（ローカルテスト用）

---

## ユーザー手動タスク一覧

以下のタスクはユーザーが手動で実行する必要があります：

### 1. APIキーの設定

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. APIキーを作成
3. `.env.local` を編集して実際のキーを設定：
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```

### 2. MongoDB Atlas のセットアップ

1. [MongoDB Atlas](https://cloud.mongodb.com/) にアクセス
2. 無料アカウントを作成（無料クラスターあり）
3. クラスターを作成（M0 Free Tierで十分）
4. Database Access でユーザーを作成
5. Network Access で IP を許可（Cloud Run用に `0.0.0.0/0` を許可）
6. 接続文字列を取得

### 3. Google Cloud プロジェクトのセットアップ

```bash
# gcloud にログイン
gcloud auth login

# プロジェクトを作成または選択
gcloud projects create ai-chatbot-project --name="AI Chatbot"
# または既存のプロジェクトを選択
gcloud config set project YOUR_PROJECT_ID

# 必要なAPIを有効化
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 4. シークレットの設定

```bash
# APIキーをSecret Managerに保存
echo -n "sk-ant-xxxxxxxxxxxxx" | gcloud secrets create anthropic-api-key --data-file=-

# MongoDB URIをSecret Managerに保存
echo -n "mongodb+srv://user:pass@cluster.mongodb.net/ai-chatbot" | gcloud secrets create mongodb-uri --data-file=-
```

### 5. Dockerイメージのビルドとプッシュ

```bash
# プロジェクトディレクトリで実行
cd /Users/masa/Desktop/test/chatbot

# Dockerイメージをビルド
docker build -t gcr.io/YOUR_PROJECT_ID/ai-chatbot .

# Container Registryにプッシュ
docker push gcr.io/YOUR_PROJECT_ID/ai-chatbot
```

または Cloud Build を使用：

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-chatbot
```

### 6. Cloud Run にデプロイ

```bash
gcloud run deploy ai-chatbot \
  --image gcr.io/YOUR_PROJECT_ID/ai-chatbot \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-secrets "ANTHROPIC_API_KEY=anthropic-api-key:latest,MONGODB_URI=mongodb-uri:latest" \
  --set-env-vars "NODE_ENV=production"
```

### 7. 動作確認

デプロイ完了後に表示されるURLにアクセスして動作確認。

---

## ローカルでの動作確認（デプロイ前）

### MongoDBをローカルで起動

```bash
# Docker Composeを使用
docker compose -f docker-compose.dev.yml up -d
```

### アプリを起動

```bash
# .env.local にAPIキーを設定後
npm run dev
```

ブラウザで http://localhost:3000 にアクセス。

---

## トラブルシューティング

### Cloud Run でエラーが発生する場合

```bash
# ログを確認
gcloud run services logs read ai-chatbot --region asia-northeast1
```

### MongoDB に接続できない場合

- MongoDB Atlas の Network Access で IP を許可しているか確認
- 接続文字列が正しいか確認
- ユーザー名/パスワードが正しいか確認

### APIキーエラーの場合

- Secret Manager にキーが正しく保存されているか確認
- Cloud Run がシークレットにアクセスできる権限があるか確認

---

## 料金について

| サービス | 料金 |
|----------|------|
| Cloud Run | 無料枠あり（毎月200万リクエストまで無料） |
| MongoDB Atlas | M0 Free Tier は無料 |
| Claude API | 従量課金（入力$3/100万トークン、出力$15/100万トークン） |

※ 最新の料金は各サービスの公式サイトで確認してください。
