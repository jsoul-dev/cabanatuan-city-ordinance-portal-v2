import "dotenv/config";
import { PrismaClient, UserRole, OrdinanceType, OrdinanceStatus, ReportType, ReportStatus, NewsCategory } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const connectionString = `${process.env.DIRECT_URL || process.env.DATABASE_URL!}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("⚠️  Wiping existing data...");
  await prisma.chatSession.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.report.deleteMany();
  await prisma.ordinance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.barangay.deleteMany();
  console.log("🧹 Database wiped!");

  console.log("🌱 Seeding Cabanatuan City Ordinance Hub with realistic mock data...");

  // 1. Barangays
  const brgys = ["Camp Tinio", "Dionisio S. Garcia", "Kapitan Pepe"];
  const createdBrgys = [];
  for (const name of brgys) {
    createdBrgys.push(await prisma.barangay.create({ data: { name } }));
  }
  const [campTinio, dsGarcia, kapPepe] = createdBrgys;

  // 2. Users
  const passwordHash = await hash("password123", 12);
  const lguAdmin = await prisma.user.create({
    data: { email: "lgu.admin.cabanatuan@gmail.com", passwordHash, name: "LGU Super Admin", role: UserRole.LGU_ADMIN }
  });
  const capTinio = await prisma.user.create({
    data: { email: "captain.camptinio@gmail.com", passwordHash, name: "Kap. Anita S. Pascual", role: UserRole.BARANGAY_ADMIN, barangayId: campTinio.id }
  });
  const capGarcia = await prisma.user.create({
    data: { email: "captain.garcia@gmail.com", passwordHash, name: "Kap. Juan Garcia", role: UserRole.BARANGAY_ADMIN, barangayId: dsGarcia.id }
  });
  const capPepe = await prisma.user.create({
    data: { email: "captain.pepe@gmail.com", passwordHash, name: "Kap. Renato Perez", role: UserRole.BARANGAY_ADMIN, barangayId: kapPepe.id }
  });

  // 3. Realistic Ordinance Data
  const cityOrdinances = [
    { title: "Comprehensive Traffic Code of Cabanatuan City", res: "045-2023", cat: "Traffic", stat: OrdinanceStatus.APPROVED, yr: 2023 },
    { title: "City-Wide Plastic Bag Ban and Regulation", res: "112-2022", cat: "Environment", stat: OrdinanceStatus.APPROVED, yr: 2022 },
    { title: "Establishing the Cabanatuan City Youth Development Council", res: "231-2024", cat: "Youth", stat: OrdinanceStatus.APPROVED, yr: 2024 },
    { title: "Business Permit Renewal Modernization Act", res: "008-2024", cat: "Business", stat: OrdinanceStatus.PENDING, yr: 2024 },
    { title: "Strict Enforcement of the Anti-Rabies Act (Dog Impounding)", res: "199-2021", cat: "Health", stat: OrdinanceStatus.APPROVED, yr: 2021 },
    { title: "Proposed Market Stall Standardization", res: "055-2024", cat: "Business", stat: OrdinanceStatus.DRAFT, yr: 2024 },
    { title: "Mandatory CCTV Installation for Commercial Establishments", res: "401-2023", cat: "Peace & Order", stat: OrdinanceStatus.APPROVED, yr: 2023 },
    { title: "Amendment to Tricycle Fare Matrix", res: "011-2024", cat: "Traffic", stat: OrdinanceStatus.REJECTED, yr: 2024 }
  ];

  const barangayOrdinances = [
    { title: "Mahigpit na Pagbabawal sa Pagsusunog ng Basura (Anti-Siga)", cat: "Environment" },
    { title: "Ordinansa sa Pagtatayo ng Barangay Material Recovery Facility", cat: "Environment" },
    { title: "Barangay Curfew Hours para sa mga Menor de Edad (10PM - 4AM)", cat: "Peace & Order" },
    { title: "Pagbabawal sa mga Maiingay na Videoke Mula 10:00 ng Gabi", cat: "Peace & Order" },
    { title: "One-Side Parking Policy sa mga Pangunahing Kalsada ng Barangay", cat: "Traffic" },
    { title: "Obligadong Paglilinis ng Bakuran Tuwing Sabado (Tapat Ko, Linis Ko)", cat: "Health" },
    { title: "Pagrehistro ng mga Nangungupahan (Boarders/Tenants) sa Barangay", cat: "Peace & Order" },
    { title: "Pagpapataw ng Multa sa mga Asong Pagala-gala (Stray Dogs)", cat: "Health" },
    { title: "Regulasyon sa Pagtatayo ng mga Sari-Sari Store sa Bangketa", cat: "Business" },
    { title: "Pagtatalaga ng mga Designated Smoking Areas", cat: "Health" }
  ];

  let idCounter = 1;
  const statuses = [OrdinanceStatus.APPROVED, OrdinanceStatus.APPROVED, OrdinanceStatus.PENDING, OrdinanceStatus.DRAFT, OrdinanceStatus.REJECTED];

  // Insert City Ordinances
  for (const ord of cityOrdinances) {
    await prisma.ordinance.create({
      data: {
        slug: `city-${ord.res}`,
        title: ord.title,
        resolutionNumber: ord.res,
        ordinanceLabel: `ORDINANCE NO. ${idCounter++} S. ${ord.yr}`,
        series: `S. ${ord.yr}`,
        type: OrdinanceType.CITY,
        status: ord.stat,
        category: ord.cat,
        year: ord.yr,
        dateEnacted: ord.stat === OrdinanceStatus.APPROVED ? new Date(`${ord.yr}-06-15`) : null,
        description: `This is a sample description for the ${ord.title}.`,
        content: `Section 1. Title. ${ord.title}\nSection 2. Guidelines...`,
        submittedById: lguAdmin.id,
        reviewedById: (ord.stat === OrdinanceStatus.APPROVED || ord.stat === OrdinanceStatus.REJECTED) ? lguAdmin.id : null,
        approvedAt: ord.stat === OrdinanceStatus.APPROVED ? new Date(`${ord.yr}-06-15`) : null,
      }
    });
  }

  // Insert Barangay Ordinances
  for (const brgy of [
    { admin: capTinio, id: campTinio.id, prefix: "CT" },
    { admin: capGarcia, id: dsGarcia.id, prefix: "DSG" },
    { admin: capPepe, id: kapPepe.id, prefix: "KP" }
  ]) {
    // Pick 6 to 8 random distinct ordinances for this barangay
    const numOrds = Math.floor(Math.random() * 3) + 6; // 6 to 8
    const shuffled = [...barangayOrdinances].sort(() => 0.5 - Math.random()).slice(0, numOrds);
    
    for (const ord of shuffled) {
      const year = 2021 + Math.floor(Math.random() * 4);
      const resNum = `${Math.floor(Math.random() * 800) + 100}-${year}`;
      const stat = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.ordinance.create({
        data: {
          slug: `brgy-${brgy.prefix}-${resNum}`,
          title: ord.title,
          resolutionNumber: resNum,
          ordinanceLabel: `ORDINANSA BLG. ${Math.floor(Math.random() * 50) + 1} S. ${year}`,
          series: `S. ${year}`,
          type: OrdinanceType.BARANGAY,
          status: stat,
          category: ord.cat,
          year: year,
          dateEnacted: stat === OrdinanceStatus.APPROVED ? new Date(`${year}-08-10`) : null,
          description: `Ito ay isang halimbawang paglalarawan para sa ${ord.title}.`,
          content: `Seksyon 1. Titulo: ${ord.title}\nSeksyon 2. Mga Patakaran...`,
          barangayId: brgy.id,
          submittedById: brgy.admin.id,
          reviewedById: (stat === OrdinanceStatus.APPROVED || stat === OrdinanceStatus.REJECTED) ? lguAdmin.id : null,
          approvedAt: stat === OrdinanceStatus.APPROVED ? new Date(`${year}-08-10`) : null,
        }
      });
    }
  }

  // 4. Realistic Resident Reports
  const reportScenarios = [
    { type: ReportType.TRASH_BURNING, desc: "May nagsusunog ng plastik at gulong sa bakanteng lote tuwing hapon. Sobrang asim ng usok at hindi makahinga ang mga bata." },
    { type: ReportType.TRASH_BURNING, desc: "Nagsusunog ng tuyong dahon araw-araw ang aming kapitbahay. Papunta lahat ng usok sa bintana namin." },
    { type: ReportType.NOISE, desc: "Ang lakas mag-videoke hanggang alas-tres ng madaling araw. Kahit weekdays nagkakantahan sila." },
    { type: ReportType.NOISE, desc: "Nagpapa-andar ng malakas na tambutso (open pipe) ang isang grupo ng riders tuwing gabi." },
    { type: ReportType.ROAD_OBSTRUCTION, desc: "May nakaparadang sirang jeep sa gitna mismo ng daan kaya hindi makadaan ang mga tricycle at garbage truck." },
    { type: ReportType.ROAD_OBSTRUCTION, desc: "Nagtayo ng tent sa kalsada ang isang pamilya at hindi pa nililigpit kahit tapos na ang okasyon." },
    { type: ReportType.OTHER, desc: "May umaaligid na kahina-hinalang indibidwal sa aming kalye tuwing madaling araw na tila sumisilip sa mga gate." },
    { type: ReportType.OTHER, desc: "Ang daming asong pagala-gala na nanghahabol ng mga naglalakad na estudyante." }
  ];

  const reportStatuses = [ReportStatus.NEW, ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED, ReportStatus.DISMISSED];

  for (const brgy of [campTinio, dsGarcia, kapPepe]) {
    // 4 to 5 reports per barangay
    const numReps = Math.floor(Math.random() * 2) + 4; // 4 to 5
    const shuffled = [...reportScenarios].sort(() => 0.5 - Math.random()).slice(0, numReps);
    
    for (const rep of shuffled) {
      const isAnon = Math.random() > 0.4;
      await prisma.report.create({
        data: {
          type: rep.type,
          description: rep.desc,
          status: reportStatuses[Math.floor(Math.random() * reportStatuses.length)],
          barangayId: brgy.id,
          isAnonymous: isAnon,
          contactName: isAnon ? null : "Resident " + Math.floor(Math.random() * 100),
          contactPhone: isAnon ? null : "0917" + Math.floor(Math.random() * 9000000 + 1000000),
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random time within last 30 days
        }
      });
    }
  }

  // Add 1 news item just so the dashboard isn't completely empty for news
  await prisma.newsItem.create({
    data: {
      title: "Barangay Cleanup Drive at Anti-Siga Campaign Inilunsad",
      content: "Sabay-sabay nating panatilihing malinis at ligtas ang ating kapaligiran. Ipapatupad na nang mas mahigpit ang mga ordinansa kontra basura at pagsusunog.",
      category: NewsCategory.CITY,
      isPinned: true
    }
  });

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

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
