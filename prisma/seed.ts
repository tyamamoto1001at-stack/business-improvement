import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  "営業",
  "経理・財務",
  "人事・労務",
  "総務",
  "情報システム",
  "マーケティング",
  "カスタマーサポート",
  "製造・生産管理",
];

async function main() {
  const adminName = process.env.SEED_ADMIN_NAME ?? "管理者";
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  for (const [index, name] of DEFAULT_CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { name },
      update: { order: index },
      create: { name, order: index },
    });
  }

  console.log(`シード完了: 管理者ユーザー ${admin.email} を作成/確認しました。`);
  console.log(`カテゴリ ${DEFAULT_CATEGORIES.length} 件を登録しました。`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
