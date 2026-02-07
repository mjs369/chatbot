import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * テスト用データのクリーンアップ
 * @param reportDate クリーンアップ対象の日報の報告日
 */
export async function cleanupTestData(reportDate: string) {
  try {
    // 指定された報告日の日報を削除（カスケードで関連データも削除される）
    await prisma.dailyReport.deleteMany({
      where: {
        reportDate: new Date(reportDate),
        sales: {
          email: 'yamada@example.com', // テストユーザーの日報のみ削除
        },
      },
    });

    console.log(`テストデータをクリーンアップしました: ${reportDate}`);
  } catch (error) {
    console.error('クリーンアップエラー:', error);
  }
}

/**
 * Prisma接続を閉じる
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
