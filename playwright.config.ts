import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定ファイル
 * E2Eテストの実行環境を定義
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './e2e',

  // 各テストのタイムアウト（30秒）
  timeout: 30 * 1000,

  // テスト実行前のグローバルタイムアウト
  globalTimeout: 60 * 60 * 1000,

  // 失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,

  // 並列実行ワーカー数
  workers: process.env.CI ? 1 : undefined,

  // レポーター設定
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // すべてのテストで共通の設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:3000',

    // トレース設定（失敗時のみ）
    trace: 'on-first-retry',

    // スクリーンショット設定（失敗時のみ）
    screenshot: 'only-on-failure',

    // ビデオ設定（失敗時のみ）
    video: 'retain-on-failure',

    // ナビゲーションタイムアウト
    navigationTimeout: 15 * 1000,

    // アクションタイムアウト
    actionTimeout: 10 * 1000,
  },

  // プロジェクト設定（ブラウザ別）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // 必要に応じて他のブラウザも追加可能
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    //
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 開発サーバー設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
