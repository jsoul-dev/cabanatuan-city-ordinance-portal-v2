import "dotenv/config";
import { PrismaClient, NewsCategory } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DIRECT_URL || process.env.DATABASE_URL!}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.newsItem.create({
    data: {
      title: "Opisyal na Paglunsad ng Cabanatuan City Ordinance & Governance Dashboard",
      content: "Ipinagmamalaking ilunsad ng pamahalaang lungsod ang bagong Ordinance at Governance Dashboard para mapadali ang pag-access ng bawat mamamayan sa mga batas at regulasyon ng Cabanatuan.",
      category: NewsCategory.CITY,
      isPinned: true
    }
  });

  await prisma.newsItem.create({
    data: {
      title: "Public Hearing: Bagong Traffic Scheme at One-Side Parking Policy",
      content: "Inaanyayahan ang lahat ng mga residente at tricycle drivers na dumalo sa gaganaping Public Hearing ngayong darating na Biyernes sa Barangay Hall patungkol sa panukalang One-Side Parking Policy.",
      category: NewsCategory.BARANGAY,
      isPinned: false
    }
  });
  console.log("Added 2 news items!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
