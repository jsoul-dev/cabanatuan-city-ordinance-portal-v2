import { jsPDF } from "jspdf";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const FIXTURES_DIR = path.resolve(process.cwd(), "test-fixtures");
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

async function generateTextPdf() {
  const doc = new jsPDF();
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("REPUBLIKA NG PILIPINAS", 105, 20, { align: "center" });
  doc.setFontSize(14);
  doc.text("LUNGSOD NG CABANATUAN", 105, 28, { align: "center" });
  doc.text("SANGGUNIANG PANLUNGSOD", 105, 36, { align: "center" });
  doc.line(20, 42, 190, 42);

  doc.setFontSize(12);
  doc.text("ORDINANCE NO. 2024-572", 105, 52, { align: "center" });
  doc.text("SERIES OF 2024", 105, 58, { align: "center" });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.text("PAGBABAWAL SA MGA MAIINGAY NA MODIFIED MUFFLER", 105, 70, { align: "center" });
  doc.text("AT OPEN-PIPE SA LAHAT NG LANSANGAN NG CABANATUAN", 105, 78, { align: "center" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  const content = [
    "WHEREAS, ang katahimikan at kaligtasan ng mga mamamayan sa Lungsod ng Cabanatuan ay pangunahing prayoridad;",
    "WHEREAS, marami ang dumaraing sa ingay na dulot ng mga modified muffler na lumalagpas sa 90 decibels;",
    "",
    "SECTION 1. TITLE. Ang Ordinansang ito ay tatawaging 'Cabanatuan Anti-Modified Muffler Ordinance of 2024'.",
    "SECTION 2. COVERAGE. Naaangkop sa lahat ng uri ng motorsiklo at pampasaherong sasakyan sa buong Lungsod.",
    "SECTION 3. PROHIBITED ACTS. Bawal ang paggamit ng tambutso na lumilikha ng sobrang ingay mula 10:00 PM hanggang 5:00 AM.",
    "SECTION 4. PENALTIES AND FINES. Ang mga lalabag ay papatawan ng:",
    "   - Unang Paglabag: Babala at multa na Limang Daan Piso (Php 500.00).",
    "   - Ikalawang Paglabag: Multa na Isang Libong Piso (Php 1,000.00).",
    "   - Ikatlong Paglabag: Multa na Dalawang Libong Limang Daan Piso (Php 2,500.00) at impounding.",
    "SECTION 5. ENFORCEMENT. Pamumunuan ng PNP Cabanatuan, City POSO, at mga Barangay Tanod.",
    "",
    "Pinagtibay ngayong ika-14 ng Agosto, 2024 sa Bulwagan ng Sangguniang Panlungsod.",
    "",
    "LUMAGDA AT NAGPATIBAY:",
    "Hon. Myca Elizabeth R. Vergara - City Mayor",
    "Hon. Julius Cesar C. Vergara - Vice Mayor & Presiding Officer",
    "Atty. Manuel S. Garcia - SP Secretary",
  ];

  let y = 90;
  for (const line of content) {
    doc.text(line, 20, y);
    y += 7;
  }

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const targetPath = path.join(FIXTURES_DIR, "ordinance-sample-text.pdf");
  fs.writeFileSync(targetPath, pdfBuffer);
  console.log(`✓ Generated text PDF: ${targetPath} (${pdfBuffer.length} bytes)`);
}

async function generateScannedPngPages() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1100 } });

  // Page 1
  const htmlPage1 = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; background: #faf9f6; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 20px; }
        .seal { font-size: 13px; font-weight: bold; letter-spacing: 1px; }
        .ord-num { font-size: 18px; font-weight: bold; color: #b91c1c; margin: 15px 0 5px 0; }
        .title { font-size: 16px; font-weight: bold; text-align: center; text-transform: uppercase; margin: 20px 0; line-height: 1.4; }
        .body-text { font-size: 14px; line-height: 1.6; text-align: justify; }
        .stamp { position: absolute; top: 50px; right: 50px; border: 3px solid #1e3a8a; color: #1e3a8a; padding: 8px 12px; font-weight: bold; font-size: 13px; transform: rotate(12deg); opacity: 0.85; }
      </style>
    </head>
    <body>
      <div class="stamp">OFFICIAL RECORD<br>APPROVED 2024</div>
      <div class="header">
        <div class="seal">REPUBLIKA NG PILIPINAS</div>
        <div class="seal">LALAWIGAN NG NUEVA ECIJA</div>
        <div class="seal">LUNGSOD NG CABANATUAN</div>
        <div style="font-size: 12px; margin-top: 5px;">TANGGAPAN NG SANGGUNIANG BARANGAY - CAMP TINIO</div>
      </div>
      <div style="text-align: center;">
        <div class="ord-num">KAUTUSANG PAMBARANGAY BLG. 2024-009</div>
        <div style="font-weight: bold; font-size: 13px;">SERYE NG 2024 (DATE ENACTED: 2024-05-20)</div>
      </div>
      <div class="title">
        KAUTUSANG NAG-AATAS NG SAPILITANG PAGREHISTRO NG MGA NANGUNGUPAHAN AT DORMITORY RESIDENTS SA BARANGAY CAMP TINIO
      </div>
      <div class="body-text">
        <p><strong>BUOD / SUMMARY:</strong> Ordinansang nag-aatas sa lahat ng may-ari ng boarding house, apartment, at paupahan na irehistro ang kanilang mga boarders at nangungupahan sa Barangay Hall sa loob ng 15 araw mula sa paglipat.</p>
        <p><strong>SEKSYON 1. PAMAGAT:</strong> Barangay Camp Tinio Tenant Registration and Safety Code of 2024.</p>
        <p><strong>SEKSYON 2. NASASAKUPAN / COVERAGE:</strong> Lahat ng commercial apartments, boarding houses, at residential units sa buong Barangay Camp Tinio, Cabanatuan City.</p>
        <p><strong>SEKSYON 3. MGA TAGS:</strong> tenant, boarding house, safety, registration, peace and order</p>
        <p style="text-align: right; margin-top: 40px; font-style: italic;">[Itutuloy sa Pahina 2...]</p>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlPage1);
  const page1Path = path.join(FIXTURES_DIR, "ordinance-page-1.png");
  await page.screenshot({ path: page1Path });
  console.log(`✓ Generated scanned PNG Page 1: ${page1Path}`);

  // Page 2
  const htmlPage2 = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; background: #faf9f6; color: #1a1a1a; }
        .body-text { font-size: 14px; line-height: 1.6; text-align: justify; }
        .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .sig-block { text-align: center; }
        .sig-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; font-weight: bold; font-size: 13px; }
      </style>
    </head>
    <body>
      <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">[PAHINA 2 - KAUTUSANG PAMBARANGAY BLG. 2024-009]</div>
      <div class="body-text">
        <p><strong>SEKSYON 4. MGA PARUSA AT MULTA (PENALTIES):</strong></p>
        <ul>
          <li><strong>Unang Paglabag:</strong> Pormal na babala at 3 araw na palugit para magparehistro.</li>
          <li><strong>Ikalawang Paglabag:</strong> Multa na Limang Daan Piso (Php 500.00) bawat hindi narehistrong boarder.</li>
          <li><strong>Ikatlong Paglabag:</strong> Multa na Isang Libong Piso (Php 1,000.00) at rekomendasyon sa City LGU para sa suspensyon ng Business Clearance.</li>
        </ul>
        <p><strong>SEKSYON 5. TAGAPAGPATUPAD (ENFORCEMENT):</strong> Barangay Tanod ng Camp Tinio, Barangay Secretary, at PNP Cabanatuan Community Precinct.</p>
        
        <div class="signatures">
          <div class="sig-block">
            <div style="font-family: cursive; font-size: 20px; color: #1e3a8a;">Anita S. Pascual</div>
            <div class="sig-line">HON. ANITA S. PASCUAL<br>Punong Barangay</div>
          </div>
          <div class="sig-block">
            <div style="font-family: cursive; font-size: 20px; color: #1e3a8a;">Roberto M. Cruz</div>
            <div class="sig-line">ROBERTO M. CRUZ<br>Barangay Secretary</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlPage2);
  const page2Path = path.join(FIXTURES_DIR, "ordinance-page-2.png");
  await page.screenshot({ path: page2Path });
  console.log(`✓ Generated scanned PNG Page 2: ${page2Path}`);

  await browser.close();
}

async function generateCorruptAndInvalidFiles() {
  // Corrupt file (broken PDF header)
  const corruptPath = path.join(FIXTURES_DIR, "corrupt-file.pdf");
  fs.writeFileSync(corruptPath, "THIS IS CORRUPT RANDOM BYTES NOT A VALID PDF CONTENT");
  console.log(`✓ Generated corrupt PDF: ${corruptPath}`);

  // Non-ordinance invalid text
  const invalidPath = path.join(FIXTURES_DIR, "non-ordinance.txt");
  fs.writeFileSync(invalidPath, "Random grocery list: apples, milk, bread, eggs, cheese.");
  console.log(`✓ Generated non-ordinance file: ${invalidPath}`);
}

async function main() {
  console.log("Generating realistic QA test fixtures in ./test-fixtures...");
  await generateTextPdf();
  await generateScannedPngPages();
  await generateCorruptAndInvalidFiles();
  console.log("All test fixtures ready.");
}

main().catch(console.error);
