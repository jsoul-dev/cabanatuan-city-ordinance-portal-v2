import "dotenv/config";
import { UserRole, OrdinanceType, OrdinanceStatus, ReportType, ReportStatus, NewsCategory } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("⚠️  Wiping existing data for idempotent seed...");
  await prisma.chatSession.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.report.deleteMany();
  await prisma.ordinance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.barangay.deleteMany();
  console.log("🧹 Database wiped!");

  console.log("🌱 Seeding Cabanatuan City Ordinance Hub with comprehensive local data...");

  // 1. Barangays (Participating + Non-Participating)
  const participatingNames = [
    "Camp Tinio",
    "Dionisio S. Garcia",
    "Kapitan Pepe",
    "Magsaysay Norte",
    "San Josef Sur",
  ];

  const nonParticipatingNames = [
    "Bantug Bulalo",
    "Barrera",
    "Bitas",
    "Cabu",
    "Calawagan",
    "Daang Sarile",
    "Mayapyap Norte",
    "Valle Cruz",
    "Zulueta",
  ];

  const barangayMap = new Map<string, any>();

  for (const name of [...participatingNames, ...nonParticipatingNames]) {
    const created = await prisma.barangay.create({
      data: {
        name,
        description: participatingNames.includes(name)
          ? `Aktibong kalahok na barangay sa Cabanatuan Ordinance Portal.`
          : `Rehistradong barangay sa Lungsod ng Cabanatuan.`,
      },
    });
    barangayMap.set(name, created);
  }

  const campTinio = barangayMap.get("Camp Tinio");
  const dsGarcia = barangayMap.get("Dionisio S. Garcia");
  const kapPepe = barangayMap.get("Kapitan Pepe");
  const magsaysay = barangayMap.get("Magsaysay Norte");
  const sanJosef = barangayMap.get("San Josef Sur");

  // 2. Users (Mandatory README accounts + existing test accounts)
  const [adminHash, kapitanHash, citizenHash, defaultHash] = await Promise.all([
    hash("admin123", 10),
    hash("kapitan123", 10),
    hash("citizen123", 10),
    hash("password123", 10),
  ]);

  // README Accounts
  const readmeAdmin = await prisma.user.create({
    data: {
      email: "admin@cabanatuan.gov.ph",
      passwordHash: adminHash,
      name: "LGU Super Admin",
      role: UserRole.LGU_ADMIN,
    },
  });

  const readmeKapitan = await prisma.user.create({
    data: {
      email: "kapitan@cabanatuan.gov.ph",
      passwordHash: kapitanHash,
      name: "Kapitan Juan Del Rosario",
      role: UserRole.BARANGAY_ADMIN,
      barangayId: campTinio.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "juan@cabanatuan.gov.ph",
      passwordHash: citizenHash,
      name: "Juan Dela Cruz",
      role: UserRole.CITIZEN,
      barangayId: campTinio.id,
    },
  });

  // Additional realistic administrative accounts
  const legacyAdmin = await prisma.user.create({
    data: {
      email: "lgu.admin.cabanatuan@gmail.com",
      passwordHash: defaultHash,
      name: "LGU System Administrator",
      role: UserRole.LGU_ADMIN,
    },
  });

  const capTinio = await prisma.user.create({
    data: {
      email: "captain.camptinio@gmail.com",
      passwordHash: defaultHash,
      name: "Kap. Anita S. Pascual",
      role: UserRole.BARANGAY_ADMIN,
      barangayId: campTinio.id,
    },
  });

  const capGarcia = await prisma.user.create({
    data: {
      email: "captain.garcia@gmail.com",
      passwordHash: defaultHash,
      name: "Kap. Juan Garcia",
      role: UserRole.BARANGAY_ADMIN,
      barangayId: dsGarcia.id,
    },
  });

  const capPepe = await prisma.user.create({
    data: {
      email: "captain.pepe@gmail.com",
      passwordHash: defaultHash,
      name: "Kap. Renato Perez",
      role: UserRole.BARANGAY_ADMIN,
      barangayId: kapPepe.id,
    },
  });

  const capMagsaysay = await prisma.user.create({
    data: {
      email: "captain.magsaysay@gmail.com",
      passwordHash: defaultHash,
      name: "Kap. Maria Santos",
      role: UserRole.BARANGAY_ADMIN,
      barangayId: magsaysay.id,
    },
  });

  const capSanJosef = await prisma.user.create({
    data: {
      email: "captain.sanjosef@gmail.com",
      passwordHash: defaultHash,
      name: "Kap. Eduardo Ramos",
      role: UserRole.BARANGAY_ADMIN,
      barangayId: sanJosef.id,
    },
  });

  // 3. Comprehensive Ordinances spanning 2015-2026 across all categories
  const cityOrdinancesData = [
    {
      title: "Comprehensive Traffic Code and Tricycle Management of Cabanatuan City",
      res: "2023-045",
      cat: "Traffic",
      stat: OrdinanceStatus.APPROVED,
      yr: 2023,
      date: "2023-04-12",
      tags: ["traffic", "tricycle", "parking", "transportation"],
      desc: "Komprehensibong patakaran sa daloy ng trapiko, tamang ruta, at regulasyon ng pamamasada ng mga traysikel sa lungsod.",
      penalties: "Unang Paglabag: Php 500 multa; Ikalawang Paglabag: Php 1,000 multa; Ikatlong Paglabag: Php 2,500 multa o pagbawi ng prangkisa.",
    },
    {
      title: "City-Wide Ecological Solid Waste Management and Plastic Regulation Act",
      res: "2022-112",
      cat: "Environment",
      stat: OrdinanceStatus.APPROVED,
      yr: 2022,
      date: "2022-06-20",
      tags: ["waste", "environment", "plastic", "recycling"],
      desc: "Pagbabawal sa paggamit ng single-use plastics tuwing Miyerkules at Sabado, at obligadong waste segregation sa bawat tahanan.",
      penalties: "Unang Paglabag: Babala at 4 na oras na community service; Ikalawang Paglabag: Php 1,000; Ikatlong Paglabag: Php 2,500 at suspensyon ng business permit.",
    },
    {
      title: "Establishing the Cabanatuan City Youth Development and Scholarship Council",
      res: "2024-231",
      cat: "Youth",
      stat: OrdinanceStatus.APPROVED,
      yr: 2024,
      date: "2024-02-15",
      tags: ["youth", "scholarship", "education", "development"],
      desc: "Pagpapalakas ng programa sa iskolarship at suporta sa kabataan para sa edukasyon at pangkabuhayan sa lungsod.",
      penalties: "Walang parusa; administratibong regulasyon para sa pamamahagi ng tulong pinansyal.",
    },
    {
      title: "Business Permit Renewal Modernization and One-Stop-Shop Digitization Act",
      res: "2024-008",
      cat: "Business",
      stat: OrdinanceStatus.PENDING,
      yr: 2024,
      date: null,
      tags: ["business", "permits", "digitization", "economy"],
      desc: "Digitalisasyon ng proseso ng business permit at licensing upang mapabilis ang transaksyon ng mga negosyante.",
      penalties: "Late filing fee: 25% surcharge sa assessed business tax alinsunod sa Local Government Code.",
    },
    {
      title: "Strict Enforcement of the Anti-Rabies and Responsible Pet Ownership Act",
      res: "2021-199",
      cat: "Health",
      stat: OrdinanceStatus.APPROVED,
      yr: 2021,
      date: "2021-08-10",
      tags: ["rabies", "health", "pets", "safety"],
      desc: "Pagbabawal sa mga asong pagala-gala, libreng bakuna sa barangay, at responsableng pag-aalaga ng hayop.",
      penalties: "Pagkahuli ng aso: Php 500 impounding fee bawat araw; Kabiguang magpabakuna: Php 1,500 multa.",
    },
    {
      title: "Public Market Stall Standardization and Sanitation Guidelines",
      res: "2024-055",
      cat: "Business",
      stat: OrdinanceStatus.DRAFT,
      yr: 2024,
      date: null,
      tags: ["market", "sanitation", "business", "vendors"],
      desc: "Panukalang pamantayan sa kalinisan at kaayusan ng mga tindahan sa Sangitan at Cabanatuan Public Market.",
      penalties: "Unang Paglabag: Babala; Ikalawang Paglabag: Php 500; Ikatlong Paglabag: Pagbawi ng puwesto.",
    },
    {
      title: "Mandatory High-Definition CCTV Installation for Commercial Establishments",
      res: "2023-401",
      cat: "Public Safety",
      stat: OrdinanceStatus.APPROVED,
      yr: 2023,
      date: "2023-09-05",
      tags: ["cctv", "security", "public safety", "commercial"],
      desc: "Kautusang nag-aatas sa mga bangko, mall, gasolinahan, at establisimyento na magkabit ng gumaganang CCTV na may 30-araw na recording.",
      penalties: "Hindi pagkakaloob o pagpapawalang-bisa ng Business Permit at multa na Php 2,500.",
    },
    {
      title: "Amendment to Tricycle Fare Matrix and Fuel Subsidy Program",
      res: "2024-011",
      cat: "Traffic",
      stat: OrdinanceStatus.REJECTED,
      yr: 2024,
      date: null,
      tags: ["fare", "tricycle", "traffic", "subsidy"],
      desc: "Panukalang pagtaas ng pamasahe sa traysikel na tinanggihan matapos ang konsultasyon sa publiko.",
      penalties: "Walang parusa (hindi inaprubahan).",
    },
    {
      title: "Comprehensive Senior Citizens and PWD Welfare and Privilege Act",
      res: "2018-088",
      cat: "Senior Citizens",
      stat: OrdinanceStatus.APPROVED,
      yr: 2018,
      date: "2018-05-18",
      tags: ["senior citizens", "pwd", "welfare", "discount"],
      desc: "Pagbibigay ng karagdagang benepisyo, libreng sine, at express lane sa mga senior citizens at PWDs sa Cabanatuan.",
      penalties: "Php 2,000 multa sa establisimyentong hindi magbibigay ng nararapat na diskwento alinsunod sa batas.",
    },
    {
      title: "Cabanatuan City Women and Children Protection Center Institutionalization",
      res: "2019-142",
      cat: "Women & Children",
      stat: OrdinanceStatus.APPROVED,
      yr: 2019,
      date: "2019-11-25",
      tags: ["women", "children", "protection", "crisis center"],
      desc: "Pagtatag ng 24/7 crisis intervention desk para sa mga kababaihan at kabataang biktima ng karahasan.",
      penalties: "Mahigpit na parusa alinsunod sa RA 9262 at kaugnay na mga batas ng Republika ng Pilipinas.",
    },
    {
      title: "Urban Drainage Maintenance and Flood Mitigation Infrastructure Policy",
      res: "2020-077",
      cat: "Infrastructure",
      stat: OrdinanceStatus.APPROVED,
      yr: 2020,
      date: "2020-03-10",
      tags: ["infrastructure", "drainage", "flood control", "public works"],
      desc: "Pagbabawal sa pagtatapon ng basura at pagtatayo ng anumang estruktura sa ibabaw ng mga pampublikong kanal at estero.",
      penalties: "Php 2,500 multa at demolisyon ng ilegal na estruktura sa gastos ng may-ari.",
    },
    {
      title: "Cabanatuan City Public Library and Digital Community Learning Centers",
      res: "2017-033",
      cat: "Education",
      stat: OrdinanceStatus.APPROVED,
      yr: 2017,
      date: "2017-07-22",
      tags: ["education", "library", "internet", "learning"],
      desc: "Paglalagay ng libreng internet at mga computer terminals sa City Library para sa pananaliksik ng mga mag-aaral.",
      penalties: "Walang parusa; polisiya sa edukasyon.",
    },
    {
      title: "Micro-Enterprise and Livelihood Seed Capital Assistance Program",
      res: "2016-052",
      cat: "Livelihood",
      stat: OrdinanceStatus.APPROVED,
      yr: 2016,
      date: "2016-09-14",
      tags: ["livelihood", "loans", "micro-business", "assistance"],
      desc: "Pautang na walang interes para sa mga sari-sari store owners at manininda upang palakasin ang lokal na ekonomiya.",
      penalties: "Diskwalipikasyon sa susunod na loan cycle sakaling hindi makabayad alinsunod sa kasunduan.",
    },
    {
      title: "General City Code of Ordinances Codification and Archive Framework",
      res: "2015-001",
      cat: "General",
      stat: OrdinanceStatus.APPROVED,
      yr: 2015,
      date: "2015-01-20",
      tags: ["general", "codification", "transparency", "governance"],
      desc: "Pormal na pagsasaayos at digital na pag-iingat ng lahat ng naipasang resolusyon at ordinansa ng Sangguniang Panlungsod.",
      penalties: "Walang parusa; internal administrative framework.",
    },
    {
      title: "City Green Energy and Solar Streetlighting Transition Framework 2026",
      res: "2026-004",
      cat: "Environment",
      stat: OrdinanceStatus.APPROVED,
      yr: 2026,
      date: "2026-02-10",
      tags: ["green energy", "solar", "environment", "infrastructure"],
      desc: "Pagpapalit ng lahat ng streetlights sa pangunahing lansangan ng lungsod patungong solar-powered LED lighting system.",
      penalties: "Php 5,000 multa sa paninira o pagnanakaw ng solar equipment alinsunod sa Revised Penal Code.",
    },
    {
      title: "AI and Smart City Public Data Access Protocol",
      res: "2025-019",
      cat: "General",
      stat: OrdinanceStatus.APPROVED,
      yr: 2025,
      date: "2025-04-18",
      tags: ["smart city", "ai", "open data", "governance"],
      desc: "Pagpapatupad ng open civic data and AI assistant tools upang gawing transparent at mabilis ang pag-access sa impormasyon.",
      penalties: "Administratibong pananagutan sa sinumang kawani na sadyang magtatago ng pampublikong talaan.",
    },
  ];

  for (const ord of cityOrdinancesData) {
    await prisma.ordinance.create({
      data: {
        slug: `city-${ord.res.toLowerCase()}`,
        title: ord.title,
        resolutionNumber: ord.res,
        ordinanceLabel: `ORDINANCE NO. ${ord.res.split("-")[1]} S. ${ord.yr}`,
        series: `S. ${ord.yr}`,
        type: OrdinanceType.CITY,
        status: ord.stat,
        category: ord.cat,
        year: ord.yr,
        dateEnacted: ord.date ? new Date(ord.date) : null,
        description: ord.desc,
        content: `### SECTION 1. TITLE.\nAng Ordinansang ito ay kikilalanin bilang "${ord.title}".\n\n### SECTION 2. DECLARATION OF POLICY.\nIsinasaad ng Pamahalaang Lungsod ng Cabanatuan ang pangako nitong pangalagaan ang kapakanan, kaligtasan, at kaunlaran ng bawat mamamayan alinsunod sa Local Government Code of 1991.\n\n### SECTION 3. IMPLEMENTING RULES AND GUIDELINES.\nAng lahat ng kinauukulang ahensya at mga Punong Barangay ay inaatasan na ipatupad ang bawat probisyon ng ordinansang ito.\n\n### SECTION 4. PENAL CLAUSE.\n${ord.penalties}\n\n### SECTION 5. SEPARABILITY CLAUSE.\nKung ang anumang bahagi ng ordinansang ito ay mapatunayang labag sa Saligang Batas, ang ibang bahagi ay mananatiling may bisa.`,
        penalties: ord.penalties,
        signatories: "Hon. City Mayor, Sangguniang Panlungsod Presiding Officer, SP Secretary",
        enforcement: "PNP Cabanatuan City Police Station, POSO, City Health Office, CDRRMO",
        coverage: "Lahat ng 89 na Barangay sa Lungsod ng Cabanatuan",
        tags: ord.tags,
        submittedById: readmeAdmin.id,
        reviewedById: ord.stat === OrdinanceStatus.APPROVED || ord.stat === OrdinanceStatus.REJECTED ? readmeAdmin.id : null,
        approvedAt: ord.stat === OrdinanceStatus.APPROVED && ord.date ? new Date(ord.date) : null,
        rejectedReason: ord.stat === OrdinanceStatus.REJECTED ? "Hindi tumugma sa kasalukuyang socio-economic assessment ng lungsod." : null,
      },
    });
  }

  // Barangay Ordinances across multiple participating barangays
  const brgyTemplates = [
    {
      title: "Mahigpit na Pagbabawal sa Pagsusunog ng Basura (Anti-Siga)",
      cat: "Environment",
      tags: ["anti-siga", "basura", "environment", "usok"],
      desc: "Pagbabawal sa pagsusunog ng dahon, plastik, at anumang uri ng basura upang maiwasan ang sakit sa baga at sunog.",
      penalties: "Unang Paglabag: Babala at paglilinis ng kalsada; Ikalawang Paglabag: Php 500 multa; Ikatlong Paglabag: Php 1,000 multa.",
    },
    {
      title: "Barangay Curfew Hours para sa mga Menor de Edad (10:00 PM hanggang 4:00 AM)",
      cat: "Peace & Order",
      tags: ["curfew", "minors", "kabataan", "peace and order"],
      desc: "Pagbabawal sa mga kabataang may edad 17 pababa na lumaboy sa lansangan sa gabi maliban kung may kasamang magulang o may emergency.",
      penalties: "Unang Paglabag: Paghahatid sa tahanan at pagpapaliwanag sa magulang; Ikalawang Paglabag: 4 na oras na community service kasama ang magulang.",
    },
    {
      title: "Pagbabawal sa mga Maiingay na Videoke at Modified Muffler Mula 10:00 ng Gabi",
      cat: "Public Safety",
      tags: ["videoke", "ingay", "muffler", "katahimikan"],
      desc: "Pagpapanatili ng katahimikan sa barangay upang matiyak ang maayos na pamamahinga ng mga manggagawa at mag-aaral.",
      penalties: "Unang Paglabag: Pakiusap at babala; Ikalawang Paglabag: Php 500 multa; Ikatlong Paglabag: Pagkumpiska ng sound system at Php 1,000 multa.",
    },
    {
      title: "One-Side Parking Policy sa mga Pangunahing Kalsada at Pasilyo ng Barangay",
      cat: "Traffic",
      tags: ["parking", "kalsada", "traffic", "fire truck"],
      desc: "Pagtatalaga ng isang bahagi lamang ng kalsada para sa paradahan upang makadaan nang mabilis ang ambulansya at bumbero.",
      penalties: "Pagkakabit ng wheel clamp at multa na Php 500 para sa release fee.",
    },
    {
      title: "Obligadong Tapat Ko, Linis Ko at Pag-aalis ng Nakaharang sa Bangketa",
      cat: "Health",
      tags: ["kalinisan", "tapat ko linis ko", "dengue", "health"],
      desc: "Pagpapanatiling malinis ng harapan ng bawat bahay tuwing Sabado upang sugpuin ang pamumugad ng lamok na nagdadala ng Dengue.",
      penalties: "Babala at paglahok sa lingguhang Barangay Clean-up Drive.",
    },
    {
      title: "Pagpapataw ng Multa sa mga Asong Pagala-gala (Stray Dogs Regulation)",
      cat: "Health",
      tags: ["aso", "stray dogs", "rabies", "health"],
      desc: "Regulasyon laban sa mga asong pinababayaan sa labas ng bakod upang maiwasan ang panunuklaw at aksidente sa kalsada.",
      penalties: "Php 300 impounding fee bawat araw at obligadong pagpapabakuna bago ilabas.",
    },
    {
      title: "Regulasyon sa Pagtatayo ng mga Sari-Sari Store at Tiangge sa Bangketa",
      cat: "Business",
      tags: ["business", "sari-sari store", "bangketa", "tiangge"],
      desc: "Pagbabawal sa pagharang sa daanan ng pedestrian para sa ligtas na paglalakad ng mga mamamayan.",
      penalties: "Paglilipat ng paninda at Php 500 multa sakaling magmatigas.",
    },
    {
      title: "Pagtatalaga ng mga Designated Smoking at Vaping Areas sa Barangay",
      cat: "Health",
      tags: ["smoking", "vaping", "health", "public places"],
      desc: "Pagbabawal sa paninigarilyo sa paligid ng mga paaralan, day care centers, at barangay hall.",
      penalties: "Unang Paglabag: Php 500; Ikalawang Paglabag: Php 1,000 o 8 oras na serbisyong pangkomunidad.",
    },
  ];

  const brgyList = [
    { brgy: campTinio, admin: readmeKapitan, code: "CT" },
    { brgy: dsGarcia, admin: capGarcia, code: "DSG" },
    { brgy: kapPepe, admin: capPepe, code: "KP" },
    { brgy: magsaysay, admin: capMagsaysay, code: "MN" },
    { brgy: sanJosef, admin: capSanJosef, code: "SJS" },
  ];

  let brgyOrdCount = 101;

  for (const b of brgyList) {
    for (let i = 0; i < brgyTemplates.length; i++) {
      const tmpl = brgyTemplates[i];
      const yr = 2020 + (i % 7); // Years 2020-2026
      const resNum = `${yr}-${String(brgyOrdCount++).padStart(3, "0")}`;
      const isApproved = i < 6;
      const status = isApproved
        ? OrdinanceStatus.APPROVED
        : i === 6
        ? OrdinanceStatus.PENDING
        : OrdinanceStatus.DRAFT;

      await prisma.ordinance.create({
        data: {
          slug: `brgy-${b.code.toLowerCase()}-${resNum}`,
          title: `${tmpl.title} sa Barangay ${b.brgy.name}`,
          resolutionNumber: resNum,
          ordinanceLabel: `KAUTUSANG PAMBARANGAY BLG. ${i + 1} S. ${yr}`,
          series: `S. ${yr}`,
          type: OrdinanceType.BARANGAY,
          status,
          category: tmpl.cat,
          year: yr,
          dateEnacted: isApproved ? new Date(`${yr}-04-18`) : null,
          description: `${tmpl.desc} Naaangkop para sa buong nasasakupan ng Barangay ${b.brgy.name}.`,
          content: `### SEKSYON 1. PAMAGAT.\nAng Kautusang ito ay kikilalanin bilang "${tmpl.title}".\n\n### SEKSYON 2. LAYUNIN AT NASASAKUPAN.\nIpatutupad ang ordinansang ito sa lahat ng purok at lansangan sa loob ng teritoryo ng Barangay ${b.brgy.name}.\n\n### SEKSYON 3. MGA IPINAGBABAWAL AT PATAKARAN.\n${tmpl.desc}\n\n### SEKSYON 4. MGA PARUSA AT MULTA.\n${tmpl.penalties}\n\n### SEKSYON 5. PAGPAPATUPAD.\nInaatasan ang mga Barangay Tanod at Lupong Tagapamayapa na subaybayan ang mahigpit na pagsunod dito.`,
          penalties: tmpl.penalties,
          signatories: `Punong Barangay, Sangguniang Barangay Members, Kalihim ng Barangay ${b.brgy.name}`,
          enforcement: `Barangay Tanod ng ${b.brgy.name}, PNP Cabanatuan Sub-Station`,
          coverage: `Buong nasasakupan ng Barangay ${b.brgy.name}`,
          tags: tmpl.tags,
          barangayId: b.brgy.id,
          submittedById: b.admin.id,
          reviewedById: isApproved ? readmeAdmin.id : null,
          approvedAt: isApproved ? new Date(`${yr}-04-18`) : null,
        },
      });
    }
  }

  // 4. Resident Community Reports
  const reportScenarios = [
    {
      type: ReportType.TRASH_BURNING,
      desc: "[Pagsusunog ng Plastik sa Bakanteng Lote]\n\nMay nagsusunog ng goma at plastik sa may purok 3 tuwing hapon. Makapal at masangsang ang usok na nagdudulot ng ubo sa mga bata.",
      status: ReportStatus.NEW,
    },
    {
      type: ReportType.TRASH_BURNING,
      desc: "[Araw-araw na Pagsisiga ng Tuyo at Basura]\n\nAng aming kapitbahay ay patuloy na nagsisiga sa likod-bahay kahit ilang beses nang pinaalalahanan ng mga tanod.",
      status: ReportStatus.IN_PROGRESS,
    },
    {
      type: ReportType.NOISE,
      desc: "[Malakas na Videoke Lampas 11:00 PM]\n\nMay nagkakantahan sa kalye gamit ang sound system na may malalakas na bass kahit hatinggabi na sa araw ng may pasok.",
      status: ReportStatus.RESOLVED,
    },
    {
      type: ReportType.NOISE,
      desc: "[Open Pipe Muffler ng mga Motorsiklo]\n\nMadalas dumaan ang mga motorsiklong may bukas na tambutso na gumigising sa mga natutulog na residente tuwing ala-una ng madaling araw.",
      status: ReportStatus.NEW,
    },
    {
      type: ReportType.ROAD_OBSTRUCTION,
      desc: "[Sirang Sasakyan na Nakaparada sa Gitna ng Kalsada]\n\nMay nakaparadang lumang delivery van na flat ang gulong sa kanto, dahilan para magkaroon ng matinding trapiko tuwing umaga.",
      status: ReportStatus.IN_PROGRESS,
    },
    {
      type: ReportType.ROAD_OBSTRUCTION,
      desc: "[Nakaharang na Construction Gravel and Sand sa Bangketa]\n\nIbinuhos ang graba at buhangin sa mismong daanan ng tao kaya napipilitang maglakad sa gitna ng highway ang mga estudyante.",
      status: ReportStatus.RESOLVED,
    },
    {
      type: ReportType.OTHER,
      desc: "[Mga Asong Pagala-gala na Nanghahabol ng Tricycle]\n\nMaraming aso na walang tali ang tumatambay sa tapat ng chapel at nanghahabol ng mga dumadaang sasakyan.",
      status: ReportStatus.NEW,
    },
    {
      type: ReportType.OTHER,
      desc: "[Kulang na Ilaw sa Madilim na Esquinita]\n\nKailangan ng karagdagang streetlight sa Purok Ilang-Ilang para sa seguridad ng mga umuuwi galing sa trabaho sa gabi.",
      status: ReportStatus.DISMISSED,
    },
  ];

  for (const b of brgyList) {
    for (let i = 0; i < reportScenarios.length; i++) {
      const rep = reportScenarios[i];
      const isAnon = i % 2 === 0;
      await prisma.report.create({
        data: {
          type: rep.type,
          description: rep.desc,
          status: rep.status,
          barangayId: b.brgy.id,
          isAnonymous: isAnon,
          contactName: isAnon ? null : `Residente ${b.code} #${i + 1}`,
          contactPhone: isAnon ? null : `0917${Math.floor(1000000 + Math.random() * 9000000)}`,
          submittedAt: new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000),
          resolvedAt: rep.status === ReportStatus.RESOLVED ? new Date() : null,
        },
      });
    }
  }

  // 5. News Items
  await prisma.newsItem.create({
    data: {
      title: "Opisyal na Paglunsad ng Cabanatuan City Local Ordinance & AI Civic Portal",
      content: "Ipinagmamalaki ng Pamahalaang Lungsod ng Cabanatuan ang paglulunsad ng bagong digital platform para sa mga ordinansa at agarang AI civic assistance para sa bawat mamamayan.",
      category: NewsCategory.CITY,
      isPinned: true,
      publishedAt: new Date("2026-03-01"),
    },
  });

  await prisma.newsItem.create({
    data: {
      title: "City-Wide Anti-Siga at Oplan Tapat Ko, Linis Ko Pinatindi",
      content: "Mahigpit na ipatutupad ng POSO at mga Barangay Tanod ang mga ordinansa laban sa pagsusunog ng basura at pagbabara sa mga estero ngayong tag-init.",
      category: NewsCategory.CITY,
      isPinned: true,
      publishedAt: new Date("2026-03-10"),
    },
  });

  await prisma.newsItem.create({
    data: {
      title: "Pampublikong Konsultasyon sa Bagong One-Side Parking Policy sa mga Barangay",
      content: "Inaanyayahan ang lahat ng mga motorista at residente na dumalo sa konsultasyon ngayong linggo upang maipaliwanag ang mga itinalagang paradahan.",
      category: NewsCategory.BARANGAY,
      isPinned: false,
      publishedAt: new Date("2026-03-15"),
    },
  });

  console.log("✅ Seed completed successfully! All README and administrative accounts ready.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
