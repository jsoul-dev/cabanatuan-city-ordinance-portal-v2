# 🏛️ Cabanatuan City Ordinance Portal
## Official System Demonstration & Walkthrough Recording Script
**BSIT Capstone Project Final Defense**

---

### 📋 Overview & Compliance Matrix

This script is tailored specifically to the requirements set forth in the **BSIT Capstone Project Final Defense Guide** (`BSIT_Capstone_Final_Defense_Guide.pdf`, Section II & III). It adheres strictly to the recommended sequence: **Administrator Flows first (LGU Super Admin & Barangay Admin), followed by the End-User / Citizen Flow**, with a total target runtime of **11 to 13 minutes** (strictly within the **10–15 minute limit**).

| Defense Guide Requirement | Guide Item # | Walkthrough Section & Timestamp | System Feature Covered |
| :--- | :---: | :--- | :--- |
| **Admin Login** | Item 15 | Part 1, Step 1.1 (`01:00`) | Multi-role JWT login via `/login` |
| **Admin Dashboard Overview** | Item 16 | Part 1, Step 1.2 (`01:25`) | Executive LGU Dashboard with city-wide counters & Recharts |
| **Manage System Records** | Item 17 | Part 1, Step 1.3 (`02:10`) | City Ordinance Repository, filtering, and tab triage |
| **Review & Process Requests** | Item 18 | Part 1, Step 1.4 (`03:00`) | Reviewing & approving pending Barangay submissions |
| **AI Document Extraction** | *Core Innovation* | Part 1, Step 1.5 (`03:45`) | Multimodal Gemini OCR parser (`/api/ordinances/extract`) |
| **Manage User Accounts** | Item 17 | Part 1, Step 1.6 (`05:00`) | Barangay official registry & new admin account creation |
| **City-Wide Monitoring & News** | Item 21 | Part 1, Step 1.7 (`05:40`) | Community reports monitoring & civic news broadcast |
| **Generate & View Reports** | Item 20 | Part 1, Step 1.8 (`06:15`) | Legislative PDF report generator & analytics charts |
| **Admin Logout** | Item 22 | Part 1, Step 1.9 (`06:55`) | Secure session termination |
| **Barangay Admin Scoped Flow** | Items 15–19 | Part 2, Steps 2.1–2.4 (`07:05`) | Scoped login, local ordinance proposal & report triage |
| **End-User / Citizen Access** | Item 23 | Part 3, Step 3.1 (`08:45`) | Zero-barrier public landing page & 3D archive |
| **User Dashboard & Features** | Item 24 | Part 3, Step 3.2 (`09:15`) | 3D archive, dark/light theme toggle, public advisories |
| **Search & Ordinance Explorer** | Item 25 | Part 3, Step 3.3 (`09:50`) | Full-text search, dynamic year slider, category filters |
| **Split-Screen & PDF Viewer** | Item 29 | Part 3, Step 3.4 (`10:35`) | Structured legal articles & interactive PDF viewer modal |
| **AI Civic Assistant (RAG)** | *Core Innovation* | Part 3, Step 3.5 (`11:15`) | Gemini bilingual RAG chatbot with citations & guardrails |
| **Submit Incident Report** | Items 25–26 | Part 3, Step 3.6 (`12:30`) | Incident report form, validation check, & draft persistence |
| **Feedback & Traceability** | Items 26–28 | Part 3, Step 3.7 (`13:15`) | Confirmation alert, reference ID, & cross-role resolution |
| **Conclusion & Q&A Transition** | Item 30 | Wrap-up (`13:45`) | Formal sign-off and transition to panel interrogation |

---

## 🎬 Pre-Recording Preparation Checklist

Before hitting the record button, ensure your local environment is configured and pristine:

1. **Database Reset & Fresh Seed:**
   Open PowerShell in `c:\.JC\Antigravity-Projects\Capstone Project v2\app` and run:
   ```powershell
   npm run db:setup
   ```
   *(This ensures clean counters: 56 ordinances, 14 registered barangays, pre-populated pending records, and fresh accounts).*

2. **Launch Fast Production Demo:**
   ```powershell
   npm run demo
   ```
   Open `http://localhost:3000` in Google Chrome or Microsoft Edge.

3. **Test Fixtures Ready:**
   Ensure `test-fixtures/ordinance-sample-text.pdf` (or `test-fixtures/ordinance-page-1.png`) is accessible in a convenient folder on your Desktop for the AI upload demo.

4. **Recording Setup:**
   - **Resolution:** 1080p (1920 × 1080) at 100% browser zoom (press `Ctrl + 0`).
   - **Browser State:** Clean browser window with bookmarks bar hidden (`Ctrl + Shift + B`), no extraneous tabs.
   - **Audio:** High-quality microphone, quiet room, no echo.
   - **Attire / Camera:** Corporate attire if webcam is included (or use consistent virtual background as required by the guide).

---

# 🎙️ Complete Walkthrough Script & Narration

---

## ⏱️ Video Opening & System Brief Overview (`00:00 – 01:00`)
**Guide Reference: Section I (Overview) & Section II**

### On-Screen Action:
- Display the clean Homepage (`http://localhost:3000`) with the Cabanatuan City seal, civic header, and navigation bar.
- Optional: Start with a brief Title Card slide showing:
  - **Project Title:** A Web-Based AI-Assisted Ordinance Information System for Cabanatuan City
  - **Proponents:** Chris Karl M. Lacanilao, John Carlo DG. Lemence, Manny N. Agulto, Reyven B. Calara
  - **Degree:** Bachelor of Science in Information Technology (BSIT)

### 🗣️ Verbatim Narration:
> "Magandang araw po sa ating kagalang-galang na Capstone Defense Panel, sa aming tagapayo, at sa mga panauhin.
> 
> Ako po si **[Pangalan ng Presenter]**, at ikinagagalak naming ipakita ang opisyal na recorded system demonstration ng aming capstone project na pinamagatang: **'A Web-Based AI-Assisted Ordinance Information System for Cabanatuan City'**.
> 
> Binuo ang sistemang ito upang tugunan ang matagal nang suliranin ng manu-mano at pira-pirasong pamamahala ng mga ordinansa sa Lungsod ng Cabanatuan at sa 89 na mga barangay nito. Layunin ng portal na gawing sentralisado, transparent, at madaling ma-access ng bawat mamamayan ang mga resolusyon at regulasyon sa pamamagitan ng **full-text search**, **automated multimodal AI document parsing**, at isang **bilingual AI Civic Assistant** na pinapagana ng Google Gemini gamit ang Retrieval-Augmented Generation (RAG).
> 
> Alinsunod sa Capstone Final Defense Guide, hahatiin natin ang demonstrasyon sa dalawang pangunahing bahagi: una, ang **Administrator Flows** para sa City Hall LGU Super Admin at Barangay Captain; at pangalawa, ang **End-User / Citizen Flow** para sa pangkalahatang publiko."

---

## 🏛️ PART 1: LGU SUPER ADMIN FLOW (`01:00 – 07:00`)
**Guide Reference: Section II.A (Items 15–22)**

---

### Step 1.1: Administrator Authentication [Item 15] (`01:00 – 01:25`)
- **URL:** `http://localhost:3000/login`
- **Credentials:** `admin@cabanatuan.gov.ph` / `admin123`

#### On-Screen Action:
1. Click the **"Mag-log In"** button on the top right of the navbar.
2. Enter the LGU Super Admin credentials:
   - Email: `admin@cabanatuan.gov.ph`
   - Password: `admin123`
3. Click the **"Pumasok sa Portal"** button.
4. Show the smooth transition and instant redirection to `/admin/lgu`.

#### 🗣️ Verbatim Narration:
> "Sisimulan natin ang demonstrasyon sa **LGU Super Admin Flow**. Dito sa authentication page, magla-log in tayo gamit ang opisyal na demonstration credentials ng LGU Super Admin ng Cabanatuan City Hall.
> 
> Gumagamit ang aming sistema ng secure na JSON Web Token at HTTP-only session cookies kalakip ang matibay na Role-Based Access Control o RBAC, upang matiyak na tanging awtorisadong kawani lamang ng LGU ang makakapasok sa executive administration portal."

---

### Step 1.2: Executive Dashboard & Governance Overview [Item 16] (`01:25 – 02:10`)
- **URL:** `http://localhost:3000/admin/lgu`

#### On-Screen Action:
1. Hover and showcase the live metric cards at the top of the dashboard:
   - **Kabuuang Ordinansa:** `56`
   - **Naaprubahan:** `43`
   - **Nakabinbin (Pending):** `6`
   - **Draft:** `6`
   - **Mga Rehistradong Barangay:** `14`
2. Scroll slightly to show the quick summary charts and recent legislative activity feed.

#### 🗣️ Verbatim Narration:
> "Matagumpay tayong nakapasok sa **Executive Governance Dashboard** ng LGU. Malinaw na ibinubuod dito ang pinakamahahalagang datos ng pamahalaang lungsod sa real time.
> 
> Makikita sa itaas ang mga interactive metric cards: mayroon tayong 56 na kabuuang ordinansa sa database kung saan 43 ang ganap nang naaprubahan, 6 ang nakabinbing panukala na nangangailangan ng aksyon, 6 ang nasa draft status, at 14 na rehistradong barangay sa portal.
> 
> Ang mga datos na ito ay direktang kumokonekta sa aming optimized local SQLite database na may sub-30 millisecond query response time, na nagbibigay sa punong lungsod at Sangguniang Panlungsod ng agarang visibility sa estado ng lehislatura."

---

### Step 1.3: System Records & Ordinance Repository [Item 17] (`02:10 – 03:00`)
- **URL:** `http://localhost:3000/admin/lgu/ordinances`

#### On-Screen Action:
1. Click **"Mga Ordinansa"** on the left administrative sidebar.
2. Demonstrate table tab filtering:
   - Click the **"Lahat (56)"** tab.
   - Click the **"Nakabinbin / Pending (6)"** tab.
   - Click the **"Naaprubahan / Approved (43)"** tab.
3. In the table search input, type `"Trapiko"` or `"Basura"` to show instant client-side table filtering.

#### 🗣️ Verbatim Narration:
> "Pumunta naman tayo sa **City Ordinance Repository** kung saan pinamamahalaan ng LGU ang lahat ng opisyal na talaan ng lungsod at mga barangay.
> 
> Binuo ang repository na ito na may accessible tab filters upang madaling mapaghiwalay ang mga ordinansa ayon sa status: Lahat, Nakabinbin, Naaprubahan, Draft, at Tinanggihan. 
> 
> Mayroon din itong instant search bar kung saan sa pag-type pa lamang ng salitang tulad ng 'Trapiko' o 'Basura', agad na sinasala ng talaan ang mga kaukulang rekord nang walang pagkaantala."

---

### Step 1.4: Reviewing & Processing Pending Barangay Submissions [Items 18 & 19] (`03:00 – 03:45`)
- **URL:** `http://localhost:3000/admin/lgu/ordinances` (Tab: Nakabinbin)

#### On-Screen Action:
1. Select the **"Nakabinbin"** tab.
2. Locate a pending ordinance submitted by a barangay (e.g., *Panukalang Ordinansa Blg. 2026-004 mula sa Barangay Camp Tinio ukol sa Basura*).
3. Click the **"Suriin / Review"** or **"Aksyon"** button.
4. An accessible confirmation dialog appears (`role="dialog"`).
5. Add an administrative note: `"Naaprubahan alinsunod sa pagsusuri ng Sangguniang Panlungsod."`
6. Click **"Aprubahan / Approve"**.
7. Show the instant toast notification confirming approval, and watch the status badge change from yellow `Nakabinbin` to green `Naaprubahan`.

#### 🗣️ Verbatim Narration:
> "Isa sa mga kritikal na tungkulin ng LGU Administrator alinsunod sa Item 18 at 19 ng defense guide ay ang pagsusuri at pag-apruba ng mga transaksyon mula sa mga barangay.
> 
> Dito sa 'Nakabinbin' tab, makikita natin ang isang panukalang ordinansa na isinumite ng Barangay Camp Tinio. Bubuksan ng LGU Admin ang review dialog upang suriin ang mga probisyon nito. 
> 
> Sa pag-click ng 'Aprubahan', agad na nagtatala ang sistema ng administrative audit log, ina-update ang status ng rekord sa 'Naaprubahan', at awtomatiko itong inilalathala sa pampublikong portal upang makita ng mga mamamayan."

---

### Step 1.5: Core Innovation — Multimodal AI Document & OCR Extractor (`03:45 – 05:00`)
- **URL:** `http://localhost:3000/admin/lgu/ordinances`
- **File:** `test-fixtures/ordinance-sample-text.pdf`

#### On-Screen Action:
1. Click the prominent button: **"Magdagdag ng Ordinansa"** or **"AI Auto-Extract"**.
2. Show the modal dialog titled **"AI Auto-Extraction ng Dokumento"**.
3. Click the file upload box and select `ordinance-sample-text.pdf` (or drag and drop).
4. Click **"I-Extract gamit ang AI"**.
5. Highlight the animated multi-step progress indicator on screen:
   - *Hakbang 1: Pagsusuri sa Dokumento at OCR Vision...*
   - *Hakbang 2: Pag-extract ng Resolution Number at Serye...*
   - *Hakbang 3: Pagbabalangkas ng Pamagat at mga Parusa...*
6. Watch the form fields automatically populate with extracted metadata:
   - **Resolution Number:** `2024-572`
   - **Series Year:** `2024`
   - **Pamagat:** Cleaned title without bureaucratic clutter
   - **Kategorya:** `Kapayapaan at Kaayusan` / `Trapiko`
   - **Buod & Parusa:** Structured fine breakdown (1st Offense, 2nd Offense, 3rd Offense)
7. Make a minor edit to demonstrate human-in-the-loop verification, then click **"I-save at I-lathala"**.

#### 🗣️ Verbatim Narration:
> "Ipinagmamalaki naming ipakita ang isa sa mga pangunahing teknikal na inobasyon ng aming proyekto: ang **AI-Powered Multimodal OCR Ordinance Parser** na pinapagana ng Google Gemini.
> 
> Sa tradisyonal na sistema, ang mga kawani ng City Hall ay manu-manong nagta-type ng bawat pahina ng ordinansa—isang prosesong mabagal at madaling magkamali. Sa aming sistema, i-a-upload lamang ng administrator ang opisyal na PDF o mga litrato ng scanned pages ng ordinansa kahit may mga selyo o lagda.
> 
> Sa loob ng ilang segundo, binabasa ng multimodal AI model ang buong dokumento, inaalis ang mga bureaucratic preambles, at awtomatikong pinupunan ang Resolution Number, taon, kategorya, buod, at ang eksaktong listahan ng mga multa at parusa. 
> 
> Sinusuportahan ng modal ang human-in-the-loop review upang magawa ng administrator ang anumang kaukulang pagwawasto bago pinal na i-save sa database. Binabawasan nito ang encoding time nang higit 85 porsyento."

---

### Step 1.6: Official Accounts & Barangay Directory Administration [Item 17] (`05:00 – 05:40`)
- **URL:** `http://localhost:3000/admin/lgu/users` & `/admin/lgu/barangays`

#### On-Screen Action:
1. Navigate to **"Mga Opisyal / Users"** in the sidebar.
2. Show the directory of registered administrative accounts (LGU Admin, Barangay Captains, Secretaries).
3. Click **"Magrehistro ng Opisyal"** or show the Barangay account creation modal.
4. Point out the role selection (`LGU_ADMIN`, `BARANGAY_ADMIN`), assigned barangay dropdown (strictly mapped to Cabanatuan's barangays), and password hashing.
5. Click over to **"Direktoryo ng Barangay"** (`/admin/lgu/barangays`) showing monitoring coverage across Cabanatuan City.

#### 🗣️ Verbatim Narration:
> "Alinsunod sa Item 17 ng gabay, ipinapakita naman natin ang **User and Barangay Account Management**.
> 
> Dito pinamamahalaan ng LGU ang direktoryo ng mga opisyal sa 89 na mga barangay ng Cabanatuan. Maaaring magtalaga ang LGU Admin ng bagong Punong Barangay o Kalihim na may tiyak na saklaw o scope. 
> 
> Ang bawat account ay protektado ng bcrypt password hashing at mahigpit na naka-isolate sa kanilang partikular na barangay jurisdiction upang mapanatili ang integridad ng mga datos."

---

### Step 1.7: City-Wide Community Reports & Public Advisories [Item 21] (`05:40 – 06:15`)
- **URL:** `http://localhost:3000/admin/lgu/reports` & `/admin/lgu/news`

#### On-Screen Action:
1. Click **"Mga Ulat ng Komunidad"** (`/admin/lgu/reports`).
2. Show the city-wide monitoring table showing incident reports filed by citizens across all barangays (e.g., illegal dumping, open burning, traffic obstructions).
3. Navigate to **"Mga Balita at Anunsyo"** (`/admin/lgu/news`).
4. Click **"Maglathala ng Anunsyo"**, type Title: `"Public Advisory: Oplan Kalinisan sa Lungsod 2026"`, select category `"Advisory"`, and click Publish.
5. Show the toast notification and immediate update in the news list.

#### 🗣️ Verbatim Narration:
> "Sa **City-Wide Community Reports Desk**, sinusubaybayan ng City Hall ang lahat ng insidente ng paglabag sa ordinansa na iniulat ng mga mamamayan sa buong lungsod. Nagbibigay ito sa LGU ng kabuuang larawan sa mga lugar na nangangailangan ng mas mahigpit na pagpapatupad.
> 
> Bukod dito, sa pamamagitan ng **News & Advisories Module**, maaaring mag-broadcast ang pamahalaang lungsod ng mga opisyal na anunsyo at paalala ukol sa mga bagong regulasyon na agad na lumalabas sa pampublikong portal."

---

### Step 1.8: Legislative Report Generation & Analytics [Item 20] (`06:15 – 06:55`)
- **URL:** `http://localhost:3000/admin/lgu/ordinance-reports` & `/admin/lgu/analytics`

#### On-Screen Action:
1. Navigate to **"Mga Ulat at Dokumento"** (`/admin/lgu/ordinance-reports`).
2. Select Category filter: `"Lahat ng Kategorya"`, Year: `"2024–2026"`.
3. Click the **"I-export bilang PDF"** button.
4. Show the exported official legislative summary document rendered with the official seal of Cabanatuan City, serial codes, and tabular format.
5. Click **"Analytics"** (`/admin/lgu/analytics`) to briefly showcase interactive charts: Enactment Velocity (Line chart) and Category Breakdown (Pie chart).

#### 🗣️ Verbatim Narration:
> "Para sa Item 20 ng defense guide, ipinapakita natin ang **Report Generation and Governance Analytics**.
> 
> Sa Legislative Report Generator, madaling makapag-e-export ang LGU ng opisyal na PDF compilation ng mga ordinansa na kumpleto kalakip ang Opisyal na Selyo ng Lungsod ng Cabanatuan para sa mga physical archive at session documentation ng Sangguniang Panlungsod.
> 
> Sa tab naman ng Analytics, makikita ang mga interactive visual charts para sa bilis ng pagpasa ng mga ordinansa at ang distribusyon ng mga patakaran gamit ang accessible Recharts components."

---

### Step 1.9: LGU Administrator Session Sign Out [Item 22] (`06:55 – 07:05`)
#### On-Screen Action:
1. Click the user profile icon or **"Mag-log Out"** button on the bottom of the sidebar.
2. Confirm logout.
3. System clears cookies and returns cleanly to `/login`.

#### 🗣️ Verbatim Narration:
> "Matapos ang tungkulin sa antas ng lungsod, ligtas na magsa-sign out ang LGU Super Admin upang buksan naman ang antas ng pamamahala sa barangay."

---

## 🏘️ PART 2: BARANGAY ADMINISTRATOR FLOW (`07:05 – 08:45`)
**Guide Reference: Section II.A (Items 15–22, Barangay Level)**

---

### Step 2.1: Scoped Barangay Authentication [Item 15] (`07:05 – 07:30`)
- **URL:** `http://localhost:3000/login`
- **Credentials:** `kapitan@cabanatuan.gov.ph` / `kapitan123`

#### On-Screen Action:
1. Enter credentials for Punong Barangay of Camp Tinio:
   - Email: `kapitan@cabanatuan.gov.ph`
   - Password: `kapitan123`
2. Click **"Pumasok sa Portal"**.
3. System redirects to `/admin/barangay`.

#### 🗣️ Verbatim Narration:
> "Ngayon naman ay papasok tayo bilang **Barangay Administrator**. Magla-log in tayo bilang Punong Barangay ng **Barangay Camp Tinio**.
> 
> Dito natin mapatutunayan ang mahigpit na role-based data isolation ng sistema: ang punong barangay ay may access lamang sa mga talaan, panukala, at mga ulat na sumasakop sa kanyang sariling barangay."

---

### Step 2.2: Localized Barangay Governance Dashboard [Item 16] (`07:30 – 08:00`)
- **URL:** `http://localhost:3000/admin/barangay`

#### On-Screen Action:
1. Highlight the dashboard header: **"Barangay Governance Dashboard — Camp Tinio"**.
2. Show the scoped metric cards:
   - Lokal na Ordinansa ng Camp Tinio
   - Mga Nakabinbing Panukala
   - Mga Ulat ng Komunidad mula sa mga Residente ng Camp Tinio

#### 🗣️ Verbatim Narration:
> "Ito ang Barangay Governance Dashboard ng Camp Tinio. Hindi tulad ng city-wide view ng LGU, ang mga numero at tsart dito ay awtomatikong naka-filter para lamang sa nasasakupan ng Camp Tinio.
> 
> Nakikita ng punong barangay ang bilang ng kanilang mga aktibong lokal na ordinansa at ang dami ng mga natanggap na reklamo o ulat mula sa kanilang mga kabarangay."

---

### Step 2.3: Processing Community Incident Reports [Items 18 & 19] (`08:00 – 08:45`)
- **URL:** `http://localhost:3000/admin/barangay/reports`

#### On-Screen Action:
1. Click **"Mga Ulat ng Residente"** (`/admin/barangay/reports`).
2. Open a newly submitted incident report (e.g., *Ilegal na Pagsusunog ng Basura sa Purok 4*).
3. Review the reported details, date, and description.
4. Click the status dropdown and change from **"Bago / Pending"** to **"Inaaksyunan / In Progress"**.
5. Add an action remark: `"Ipinag-utos na sa Barangay Tanod Desk para sa beripikasyon at on-site inspection."`
6. Click **"I-update ang Status"**.
7. Show toast confirmation and updated badge.
8. Sign out as Barangay Admin.

#### 🗣️ Verbatim Narration:
> "Sa Barangay Incident Reports Desk, pinoproseso ng pamunuan ang mga ulat ng paglabag na isinumite ng mga residente.
> 
> Bubuksan natin ang ulat ukol sa ilegal na pagsusunog ng basura sa Purok 4. Matapos suriin, ia-update natin ang status mula sa 'Bago' patungo sa 'Inaaksyunan' kalakip ang opisyal na tala na ipinadala na ito sa mga barangay tanod para sa beripikasyon. 
> 
> Ang ganitong transaksyon ay nagbibigay ng maagap na feedback loop sa pagitan ng barangay at ng mga mamamayan. Magsa-sign out na tayo upang ipakita ang karanasan ng end-user."

---

## 👥 PART 3: END-USER / CITIZEN FLOW (`08:45 – 13:45`)
**Guide Reference: Section II.B (Items 23–30)**

---

### Step 3.1: Zero-Barrier Public Access & Citizen Login [Item 23] (`08:45 – 09:15`)
- **URL:** `http://localhost:3000/`

#### On-Screen Action:
1. Open the Homepage (`http://localhost:3000/`).
2. Emphasize that all public features are accessible **without login** for complete civic transparency.
3. Show that citizens can optionally log in via `juan@cabanatuan.gov.ph` / `citizen123` for submitting authenticated civic feedback.

#### 🗣️ Verbatim Narration:
> "Tutungo naman tayo sa **End-User Flow**.
> 
> Mahalagang bigyang-diin na sa Cabanatuan City Ordinance Portal, hindi kinakailangang pilitin ang mamamayan na magrehistro o mag-log in upang makapagbasa ng mga batas at ordinansa. Ang aming layunin ay bukas na transparency para sa bawat Cabanatueño. 
> 
> Gayunpaman, mayroon ding nakalaang Citizen account tulad ni Juan Dela Cruz para sa mga residenteng nais magkaroon ng nakatala at personalized na karanasan."

---

### Step 3.2: User Dashboard & 3D Interactive Archive [Item 24] (`09:15 – 09:50`)
- **URL:** `http://localhost:3000/`

#### On-Screen Action:
1. Scroll down the homepage to showcase key user interface components:
   - **Hero Search Bar** with quick suggestions.
   - **Interactive 3D Ordinance Archive** (Rotate the cylinder or interact with the Three.js canvas).
   - **Category Quick Chips:** `#Basura`, `#Trapiko`, `#Kalusugan`, `#Kapayapaan`.
2. Click the **Theme Toggle** (`theme-toggle.tsx`) in the top navigation bar to switch between **Dark Mode** and **Light Mode**, showing zero-flicker CSS tokens and high contrast.

#### 🗣️ Verbatim Narration:
> "Ito ang pampublikong interface ng portal. Sinasalubong ang residente ng isang modernong landing page na may **interactive 3D ordinance archive**, mabilisang category tags para sa mga karaniwang paksa tulad ng basura at trapiko, at ang pinakabagong anunsyo mula sa City Hall.
> 
> Sumusunod din ang aming sistema sa Web Content Accessibility Guidelines (WCAG) kung saan mayroon itong seamless **Dark at Light mode toggle** na nagpapanatili ng tamang contrast ratio para sa mga may kapansanan sa paningin o nagbabasa sa gabi."

---

### Step 3.3: Ordinance Search & Dynamic Multi-Filtering [Item 25] (`09:50 – 10:35`)
- **URL:** `http://localhost:3000/ordinances`

#### On-Screen Action:
1. Type `"Curfew"` in the search bar and press `Enter` to navigate to `/ordinances?search=Curfew`.
2. Show the matching ordinances rendered instantly (e.g. *Ordinansa Blg. 2022-018: Pagpapatupad ng Curfew Hours para sa mga Menor de Edad*).
3. Clear search. Demonstrate **Year Range Filter** (e.g. 2022 to 2026).
4. Select Category Filter: **"Kalusugan at Sanitasyon"**.
5. Watch the cards update with smooth skeleton shimmer states and accurate count badge.

#### 🗣️ Verbatim Narration:
> "Sa **Public Ordinance Explorer**, napapadali ang paghahanap ng mga lokal na regulasyon. 
> 
> Maaaring maghanap ang mamamayan gamit ang natural keywords o resolution number. Halimbawa, sa paghahanap ng salitang 'Curfew', agad na lumalabas ang kaukulang ordinansa para sa mga menor de edad sa lungsod.
> 
> Bukod sa keyword search, mayroon itong dynamic year range slider at policy domain filters upang mabilis na masubaybayan ang mga bagong batas sa kalusugan, kalakalan, o kapayapaan."

---

### Step 3.4: Split-Screen Detail View & Official PDF Modal [Item 29] (`10:35 – 11:15`)
- **URL:** `http://localhost:3000/ordinances/[slug]`

#### On-Screen Action:
1. Click on an ordinance card to open the detail page (e.g., *City Ordinance on Noise & Modified Mufflers*).
2. Showcase the **Split-Screen Layout**:
   - Left side: Cleanly formatted legal articles, penalties, enacting body, and coverage.
   - Right side: Overview summary and action buttons.
3. Click the button: **"Buksan ang Opisyal na PDF / View PDF"**.
4. The interactive PDF modal dialog opens (`pdf-viewer-modal.tsx`).
5. Demonstrate zoom in, zoom out, and click the **"I-download ang Dokumento"** button to show direct download capability.
6. Press the `Escape` key to smoothly dismiss the modal.

#### 🗣️ Verbatim Narration:
> "Alinsunod sa Item 29 ng guide, ipinapakita natin kung paano binabasa at dina-download ng mamamayan ang opisyal na dokumento.
> 
> Sa **Split-Screen Ordinance Detail View**, malinaw na nakaayos ang bawat probisyon, saklaw, at takdang multa upang madaling maunawaan ng karaniwang tao nang walang nakalilitong legal jargon.
> 
> Kung kailangan ng mamamayan ng sertipikadong kopya para sa legal o opisyal na layunin, bubuksan lamang ang integrated PDF viewer modal kung saan maaaring basahin ang nilagdaang orihinal na dokumento, mag-zoom in, o direktang i-download ang kopya sa kanilang computer o cellphone."

---

### Step 3.5: Core Innovation — "Cabanatuan Ordinance AI" Civic Assistant (`11:15 – 12:30`)
- **URL:** `http://localhost:3000/chatbot`

#### On-Screen Action:
1. Click **"AI Assistant"** in the navigation bar to open `/chatbot`.
2. Point out the clear disclaimer badge at the top:
   > *"Ang AI Assistant ay nagbibigay ng impormasyon batay lamang sa mga opisyal na ordinansa ng Cabanatuan City. Hindi ito nagbibigay ng legal advice."*
3. **Question 1 (Tagalog Inquiry with Specific Ordinance Citation):**
   - Type and send: `"Ano po ang parusa kapag nahuling nagkakalat o nagsusunog ng basura sa barangay?"`
   - Observe real-time token streaming.
   - Highlight the AI's response: cites exact Resolution Number, series year, and tiered monetary fines / community service penalties.
4. **Question 2 (Safety Guardrail & Honest Out-of-Scope Test):**
   - Type and send: `"Paano po kumuha ng DFA passport?"` or `"Sino po ang nanalo sa NBA?"`
   - Observe the response: The AI politely and honestly explains that it is strictly scoped to Cabanatuan City ordinances, does not hallucinate national agency procedures, and advises the resident accordingly.
5. Demonstrate the **"Bagong Usapan / Clear Chat"** button and local storage session persistence.

#### 🗣️ Verbatim Narration:
> "Dumako tayo sa pinakamalaking technological breakthrough ng aming pag-aaral: ang **'Cabanatuan Ordinance AI' Civic Assistant**, na pinapagana ng Google Gemini gamit ang Retrieval-Augmented Generation o RAG.
> 
> Kadalasan, nahihirapan ang mga residente na maunawaan ang mga legal na termino ng mga ordinansa. Dito, maaaring magtanong ang mamamayan sa purong Tagalog o Taglish. 
> 
> Halimbawa, nagtanong tayo: *'Ano ang parusa kapag nahuling nagsusunog ng basura?'* 
> 
> Sa halip na mag-imbento ng sagot, hinahanap muna ng aming RAG pipeline sa lokal na database ang kaukulang ordinansa at ibinibigay ito bilang konteksto sa Gemini model. Makikita ninyo na eksaktong binanggit ng AI ang Resolution Number, ang mga kaukulang seksyon, at ang tiered fines mula una hanggang ikatlong paglabag.
> 
> Bukod dito, mayroon itong mahigpit na **ethical safety guardrail**: kapag tinanong ito ng out-of-scope na paksa tulad ng DFA passport o pampalakasan, magalang nitong nililinaw ang kanyang limitasyon na ito ay eksklusibo lamang para sa mga lokal na ordinansa ng Cabanatuan at hindi nagbibigay ng legal advice."

---

### Step 3.6: Submitting a Community Incident Report [Items 25 & 26] (`12:30 – 13:15`)
- **URL:** `http://localhost:3000/report`

#### On-Screen Action:
1. Click **"Mag-ulat ng Paglabag"** on the navigation bar.
2. **Demonstrate Form Validation (Item 26):**
   - Click the submit button immediately without filling the form.
   - Show the instant field validation errors: *"Kinakailangan ang barangay"*, *"Pakilagay ang lokasyon at detalye"*.
3. **Fill out the Valid Report:**
   - Barangay: Select **"Camp Tinio"** (participating barangay).
   - Kategorya ng Paglabag: **"Ilegal na Pagtatapon ng Basura / Open Burning"**.
   - Lokasyon / Landmark: `"Purok 4, malapit sa kanto ng San Josef Road"`.
   - Detalye ng Insidente: `"May patuloy na nagsusunog ng mga tuyong dahon at plastik tuwing hapon."`
4. Demonstrate **Draft Persistence**: Refresh the browser page (`F5`) to prove that typed contents survive accidental reload via client-side draft storage!
5. Click **"I-sumite ang Ulat sa Barangay"**.

#### 🗣️ Verbatim Narration:
> "Para sa Item 25 at 26 ng guide, ipinapakita natin ang **Community Incident Reporting Module**.
> 
> Kung makaranas ang residente ng paglabag sa ordinansa sa kanilang komunidad, maaari silang magsumite ng ulat nang direkta sa kanilang barangay hall.
> 
> Sinubukan nating i-submit ang blangkong form upang ipakita ang matibay na validation ng sistema na pumipigil sa maling input. Mayroon din itong automatic draft persistence kung saan kahit ma-refresh ang browser, hindi mawawala ang nai-type ng residente. 
> 
> Pipiliin natin ang Barangay Camp Tinio, ilalagay ang lokasyon sa Purok 4, at isa-submit ang ulat."

---

### Step 3.7: Submission Feedback, Verification & Traceability [Items 26–28] (`13:15 – 13:45`)
- **URL:** `http://localhost:3000/report`

#### On-Screen Action:
1. Highlight the green confirmation alert banner rendered on screen (`role="alert"`).
2. Point out:
   - **Kumpirmasyon:** Matagumpay na naipadala ang ulat.
   - **Target Barangay Hall:** Barangay Camp Tinio.
   - **Transaction / Reference Code:** Awtomatikong nabuo para sa monitoring.
3. Briefly highlight that this seamlessly ties back to the earlier **Barangay Admin Flow (Part 2)** where the Punong Barangay receives, triages, and updates the report status.

#### 🗣️ Verbatim Narration:
> "Agad na nagpapakita ang portal ng pormal na validation alert na naglalaman ng opisyal na reference tracking code at nagpapatunay na natanggap na ng Barangay Hall ng Camp Tinio ang ulat.
> 
> Ito ang eksaktong ulat na nakita natin kanina sa Barangay Admin Flow kung saan agarang naaksyunan at nabago ng pamunuan ang status nito. Sa pamamagitan nito, nagkakaroon ng ganap na transparency at pananagutan ang lokal na pamahalaan."

---

## 🎯 WRAP-UP & TRANSITION TO DEFENSE Q&A (`13:45 – 14:15`)
**Guide Reference: Section III & IV**

### On-Screen Action:
- Return to the clean Homepage or the Capstone Slide Summary.
- Presenter looks at the camera with confident demeanor.

### 🗣️ Verbatim Narration:
> "Sa kabuuan, naipakita po natin ang buong functional lifecycle ng **Cabanatuan City Ordinance Portal**:
> 
> 1. Ang sentralisadong pamamahala, multimodal OCR AI parsing, at PDF legislative reporting ng **LGU Super Admin**;
> 2. Ang localized oversight at incident triage ng **Barangay Captain** sa 89 na mga barangay; at
> 3. Ang walang-hadlang na pampublikong akses, split-screen legal explorer, civic reporting, at bilingual Gemini RAG chatbot para sa bawat **Mamamayan** ng Lungsod ng Cabanatuan.
> 
> Dito po nagtatapos ang aming opisyal na system demonstration walkthrough. Maraming salamat po sa inyong pakikinig, at buong puso po kaming handa na sagutin ang mga katanungan ng ating kagalang-galang na panel ng mga eksperto."

---

## 📌 Panel Defense Quick-Reference Card (Anticipated Q&A)

Keep these answers ready for the live defense Q&A:

1. **Q: Bakit Google Gemini ang piniling AI model sa halip na OpenAI o lokal na LLM?**  
   *A:* "Ayon sa aming pananaliksik sa Chapter 1 at 2, may pambihirang bilis at cost-efficiency ang Gemini 3.5 Flash Lite para sa multimodal OCR vision at bilingual Tagalog/English comprehension. Bukod dito, sa pamamagitan ng Retrieval-Augmented Generation (RAG), ang Gemini API ang tanging external call ng sistema, habang ang lahat ng sensitibong datos ng LGU ay nananatiling 100% lokal sa loob ng database."

2. **Q: Ano ang proteksyon laban sa 'AI Hallucination' o maling legal advice?**  
   *A:* "Mahigpit na ipinatutupad sa system prompt at RAG pipeline ang 'Grounding Constraint'. Tanging ang mga opisyal na probisyon na nakuha mula sa lokal na database ang ginagamit bilang konteksto. Malinaw ding nakasaad sa disclaimer na ang sistema ay ordinance information portal lamang at hindi legal counsel o legal authority."

3. **Q: Paano pinangangalagaan ang seguridad sa pagitan ng iba't ibang barangay?**  
   *A:* "Nagpatupad kami ng multi-tenant schema isolation gamit ang Prisma ORM at JWT role-based access control. Ang bawat session token ay may nakatalang `barangayId`. Kung susubukan ng isang Barangay Admin na i-access ang URL o API ng ibang barangay, awtomatiko itong hinaharang ng server-side route guards."
