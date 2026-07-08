import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  "営業",
  "経理・財務",
  "人事・総務",
  "情報システム",
  "製造・生産管理",
  "品質管理",
  "カスタマーサポート",
  "企画・マーケティング",
];

async function main() {
  for (const [index, name] of DEFAULT_CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: index },
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
  console.log(
    "ユーザーは /register から作成してください(最初に登録したユーザーが自動的に管理者になります)。",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
