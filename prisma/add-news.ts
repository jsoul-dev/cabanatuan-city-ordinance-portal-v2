import "dotenv/config";
import { NewsCategory } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.newsItem.create({
    data: {
      title: "Opisyal na Paglunsad ng Cabanatuan City Ordinance & Governance Dashboard",
      content: "Ipinagmamalaking ilunsad ng pamahalaang lungsod ang bagong Ordinance at Governance Dashboard para mapadali ang pag-access ng bawat mamamayan sa mga ordinansa at regulasyon ng Cabanatuan.",
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
