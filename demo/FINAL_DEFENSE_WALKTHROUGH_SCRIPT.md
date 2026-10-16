# 🏛️ Cabanatuan City Ordinance Portal
## Official System Demonstration & Walkthrough Recording Script (English / AI Voice Edition)
**BSIT Capstone Project Final Defense**

> **AI Voice Note:** This narration script is formatted specifically for Text-to-Speech (TTS) engines (e.g., ElevenLabs, Azure Speech, Murf AI, or Clipchamp). Sentences are structured with natural pauses, clean punctuation, and zero inline emojis or bracketed code within the speech blocks to guarantee smooth, professional pronunciation.

---

### 📋 Overview & Defense Guide Compliance Matrix

This script adheres strictly to the **BSIT Capstone Project Final Defense Guide** (`BSIT_Capstone_Final_Defense_Guide.pdf`, Section II & III). It follows the required sequential structure: **Administrator Flows first (City Hall LGU Super Admin & Barangay Administrator), followed by the End-User / Citizen Flow**, with a total target duration of **11 to 13 minutes** (well within the **10–15 minute limit**).

| Defense Guide Requirement | Guide Item # | Walkthrough Section & Timestamp | System Feature Covered |
| :--- | :---: | :--- | :--- |
| **Admin Login** | Item 15 | Part 1, Step 1.1 (`01:00`) | Multi-role JWT authentication via `/login` |
| **Admin Dashboard Overview** | Item 16 | Part 1, Step 1.2 (`01:25`) | Executive LGU Dashboard with city-wide metrics & Recharts |
| **Manage System Records** | Item 17 | Part 1, Step 1.3 (`02:10`) | City Ordinance Repository, filtering, and tab triage |
| **Review & Process Requests** | Item 18 | Part 1, Step 1.4 (`03:00`) | Reviewing & approving pending Barangay submissions |
| **Update Record Status** | Item 19 | Part 1, Step 1.4 (`03:30`) | Status update from Pending to Approved with audit logs |
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

Before recording the screen:

1. **Database Reset & Fresh Seed:**
   Open PowerShell in `c:\.JC\Antigravity-Projects\Capstone Project v2\app` and run:
   ```powershell
   npm run db:setup
   ```
   *(This ensures clean counters: 56 ordinances, 14 registered barangays, pre-populated pending items, and fresh accounts).*

2. **Launch Fast Production Demo:**
   ```powershell
   npm run demo
   ```
   Open `http://localhost:3000` in Google Chrome or Microsoft Edge.

3. **Test Fixtures Ready:**
   Ensure `test-fixtures/ordinance-sample-text.pdf` (or `test-fixtures/ordinance-page-1.png`) is accessible in a convenient folder on your Desktop for the AI upload demo.

4. **Recording Setup:**
   - **Resolution:** 1080p (1920 × 1080) at 100% browser zoom (`Ctrl + 0`).
   - **Browser State:** Clean browser window with bookmarks bar hidden (`Ctrl + Shift + B`), no extra tabs.
   - **Voice Track:** Load the verbatim narration blocks below directly into your AI voice generator (e.g., ElevenLabs "Adam", "Antoni", or "Rachel"), export the audio tracks, and synchronize with your screen capture.

---

# 🎙️ Complete Walkthrough Script & Narration (English)

---

## ⏱️ Video Opening & System Overview (`00:00 – 01:00`)
**Guide Reference: Section I (Overview) & Section II**

### On-Screen Action:
- Display the clean Homepage (`http://localhost:3000`) with the Cabanatuan City seal, civic header, and navigation bar.
- Optional: Display a clean Title Slide for 5 seconds showing:
  - **Project Title:** A Web-Based AI-Assisted Ordinance Information System for Cabanatuan City
  - **Proponents:** Chris Karl M. Lacanilao, John Carlo DG. Lemence, Manny N. Agulto, Reyven B. Calara
  - **Degree:** Bachelor of Science in Information Technology (BSIT)

### 🗣️ Verbatim Voice Narration (AI Voice):
> "A pleasant day to the members of the Capstone Defense Panel, to our capstone adviser, and to our faculty committee.
> 
> On behalf of our research team, we are pleased to present the official recorded system walkthrough of our capstone project entitled: 'A Web-Based AI-Assisted Ordinance Information System for Cabanatuan City'.
> 
> This platform was engineered to resolve the long-standing challenges of manual, fragmented, and paper-based ordinance management across the City of Cabanatuan and its eighty-nine administrative barangays. The system provides a centralized digital repository, full-text ordinance exploration, automated multimodal artificial intelligence document extraction, and a bilingual AI Civic Assistant powered by Google Gemini using Retrieval-Augmented Generation.
> 
> Following the official Capstone Final Defense Guide, this demonstration is organized into two primary segments: first, the Administrator Flows for both City Hall and Barangay administrators; and second, the End-User Citizen Flow for the general public."

---

## 🏛️ PART 1: LGU SUPER ADMIN FLOW (`01:00 – 07:00`)
**Guide Reference: Section II.A (Items 15–22)**

---

### Step 1.1: Administrator Authentication [Item 15] (`01:00 – 01:25`)
- **URL:** `http://localhost:3000/login`
- **Credentials:** `admin@cabanatuan.gov.ph` / `admin123`

#### On-Screen Action:
1. Click the **"Mag-log In"** button on the top right navigation bar.
2. Enter the LGU Super Admin credentials:
   - Email: `admin@cabanatuan.gov.ph`
   - Password: `admin123`
3. Click the **"Pumasok sa Portal"** button.
4. Show the smooth transition and instant redirection to `/admin/lgu`.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "We begin the demonstration with the City Government LGU Super Admin Flow. On the authentication page, we sign in using the official demonstration credentials for the City Hall Administrator.
> 
> The platform utilizes secure JSON Web Tokens and HTTP-only session cookies paired with strict Role-Based Access Control, ensuring that only authorized city personnel can access the executive administration portal."

---

### Step 1.2: Executive Dashboard Overview [Item 16] (`01:25 – 02:10`)
- **URL:** `http://localhost:3000/admin/lgu`

#### On-Screen Action:
1. Hover over and showcase the live metric cards at the top of the dashboard:
   - **Total Ordinances:** `56`
   - **Approved Ordinances:** `43`
   - **Pending Submissions:** `6`
   - **Draft Ordinances:** `6`
   - **Registered Barangays:** `14`
2. Scroll slightly to display the recent legislative activity stream and status distributions.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "We are now inside the Executive Governance Dashboard. This view provides city administrators with a real-time summary of legislative data across Cabanatuan City.
> 
> At the top, live metric cards display our key performance indicators: fifty-six total ordinances registered in the database, forty-three enacted and approved, six pending barangay proposals awaiting executive action, six legislative drafts, and fourteen actively registered barangays.
> 
> These metrics query directly from our optimized local database with sub-thirty-millisecond response times, providing immediate legislative oversight to the City Mayor and the Sangguniang Panlungsod."

---

### Step 1.3: System Records & Ordinance Repository [Item 17] (`02:10 – 03:00`)
- **URL:** `http://localhost:3000/admin/lgu/ordinances`

#### On-Screen Action:
1. Click **"Mga Ordinansa"** on the left navigation sidebar.
2. Demonstrate accessible tab filtering:
   - Click the **"Lahat (56)"** tab.
   - Click the **"Nakabinbin / Pending (6)"** tab.
   - Click the **"Naaprubahan / Approved (43)"** tab.
3. In the search input, type `"Trapiko"` or `"Basura"` to demonstrate instant client-side table filtering.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "Next, we navigate to the City Ordinance Repository, where the local government manages all official records.
> 
> The repository is equipped with accessible status tabs allowing administrators to filter records instantly: All, Pending, Approved, Draft, and Rejected.
> 
> It also features an instant search filter. Typing terms such as 'Traffic' or 'Waste Management' instantly refines the records list without any server latency."

---

### Step 1.4: Reviewing & Processing Pending Barangay Submissions [Items 18 & 19] (`03:00 – 03:45`)
- **URL:** `http://localhost:3000/admin/lgu/ordinances` (Tab: Nakabinbin)

#### On-Screen Action:
1. Click the **"Nakabinbin"** tab.
2. Select a pending ordinance proposal submitted by a barangay (e.g., *Panukalang Ordinansa Blg. 2026-004 from Barangay Camp Tinio*).
3. Click the **"Suriin / Review"** action button.
4. An accessible confirmation dialog modal appears (`role="dialog"`).
5. Enter review remarks: `"Reviewed and approved pursuant to City Council session."`
6. Click **"Aprubahan / Approve"**.
7. Show the toast notification confirming approval, and watch the status badge immediately transition from yellow `Nakabinbin` to green `Naaprubahan`.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "In accordance with Items eighteen and nineteen of the defense guide, we will now demonstrate how the administrator reviews and processes incoming legislative submissions from barangays.
> 
> Under the Pending tab, we select an ordinance proposal submitted by Barangay Camp Tinio. The administrator reviews its title, provisions, and proposed penalties through an accessible modal dialog.
> 
> Upon clicking Approve, the system updates the record status to Approved, logs an administrative audit timestamp, and immediately publishes the ordinance to the public portal for citizen viewing."

---

### Step 1.5: Core Innovation — Multimodal AI Document & OCR Extractor (`03:45 – 05:00`)
- **URL:** `http://localhost:3000/admin/lgu/ordinances`
- **File:** `test-fixtures/ordinance-sample-text.pdf`

#### On-Screen Action:
1. Click the button: **"Magdagdag ng Ordinansa"** or **"AI Auto-Extract"**.
2. An interactive modal dialog opens titled **"AI Auto-Extraction ng Dokumento"**.
3. Click the upload zone and select `test-fixtures/ordinance-sample-text.pdf`.
4. Click **"I-Extract gamit ang AI"**.
5. Highlight the animated multi-stage progress indicator:
   - *Stage 1: Document Analysis & Multimodal OCR...*
   - *Stage 2: Parsing Resolution Number & Year Series...*
   - *Stage 3: Structuring Summary, Categories, & Sanctions...*
6. Watch the form fields automatically populate with extracted metadata:
   - **Resolution Number:** `2024-572`
   - **Series Year:** `2024`
   - **Title:** Cleaned official ordinance title
   - **Category:** `Kapayapaan at Kaayusan` / `Trapiko`
   - **Summary & Penalties:** Structured breakdown of first, second, and third offense fines
7. Make a minor text adjustment to demonstrate human-in-the-loop review, then click **"I-save at I-lathala"**.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "We now highlight one of the primary technical innovations of our research: the AI-Powered Multimodal OCR Ordinance Extractor, powered by Google Gemini.
> 
> Traditionally, government clerks spend hours manually transcribing multi-page scanned documents—a process prone to typographical errors. With our system, the administrator simply uploads the digital PDF or scanned image copies of an ordinance, even if it contains official stamps and physical signatures.
> 
> Within seconds, the multimodal vision model extracts the document, filters out verbose bureaucratic preambles, and automatically populates the resolution number, series year, category, legal summary, and tiered penalties.
> 
> The system includes a human-in-the-loop verification step, allowing the administrator to confirm or adjust the extracted data before committing it to the database, reducing manual encoding time by over eighty-five percent."

---

### Step 1.6: Official Accounts & Barangay Directory Administration [Item 17] (`05:00 – 05:40`)
- **URL:** `http://localhost:3000/admin/lgu/users` & `/admin/lgu/barangays`

#### On-Screen Action:
1. Navigate to **"Mga Opisyal / Users"** in the sidebar.
2. Display the directory of registered administrative accounts (LGU Admin, Barangay Captains, Secretaries).
3. Click **"Magrehistro ng Opisyal"** or display the Barangay account creation modal.
4. Point out the role selection (`LGU_ADMIN`, `BARANGAY_ADMIN`), assigned barangay dropdown (strictly mapped to Cabanatuan's barangays), and password hashing.
5. Click over to **"Direktoryo ng Barangay"** (`/admin/lgu/barangays`) showing monitoring coverage across Cabanatuan City.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "Covering Item seventeen of the guide, we present User and Barangay Account Management.
> 
> Here, the City Administrator manages the official roster of registered barangay captains and administrative secretaries across Cabanatuan City. New accounts can be provisioned with dedicated role-based privileges and mapped directly to their assigned barangay.
> 
> Passwords are encrypted using salted bcrypt hashing, ensuring complete credential safety and data isolation between jurisdictions."

---

### Step 1.7: City-Wide Community Reports & Public Advisories [Item 21] (`05:40 – 06:15`)
- **URL:** `http://localhost:3000/admin/lgu/reports` & `/admin/lgu/news`

#### On-Screen Action:
1. Click **"Mga Ulat ng Komunidad"** (`/admin/lgu/reports`).
2. Show the city-wide monitoring table showing incident reports filed by citizens across all barangays (e.g., illegal dumping, open burning, traffic obstructions).
3. Navigate to **"Mga Balita at Anunsyo"** (`/admin/lgu/news`).
4. Click **"Maglathala ng Anunsyo"**, type Title: `"Public Advisory: City-Wide Cleanliness and Anti-Littering Drive 2026"`, select category `"Advisory"`, and click Publish.
5. Show the toast notification and immediate update in the news list.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "In the Community Reports Monitoring Desk, the city government maintains continuous visibility over ordinance violation reports filed by citizens across all eighty-nine barangays.
> 
> Furthermore, through the News and Advisories module, city hall can broadcast official legislative advisories, reminders, and updates that synchronize instantly with the public portal for citizen awareness."

---

### Step 1.8: Legislative Report Generation & Analytics [Item 20] (`06:15 – 06:55`)
- **URL:** `http://localhost:3000/admin/lgu/ordinance-reports` & `/admin/lgu/analytics`

#### On-Screen Action:
1. Navigate to **"Mga Ulat at Dokumento"** (`/admin/lgu/ordinance-reports`).
2. Select Category filter: `"Lahat ng Kategorya"`, Year: `"2024–2026"`.
3. Click the **"I-export bilang PDF"** button.
4. Show the exported official legislative summary document rendered with the official seal of Cabanatuan City, serial codes, and tabular format.
5. Click **"Analytics"** (`/admin/lgu/analytics`) to briefly showcase interactive charts: Enactment Velocity (Line chart) and Category Breakdown (Pie chart).

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "Addressing Item twenty of the guide, we demonstrate Report Generation and Governance Analytics.
> 
> Using the Legislative Report Generator, administrators can export official PDF documentation containing comprehensive ordinance listings complete with the Official Seal of Cabanatuan City for legislative records and physical archives.
> 
> In the Analytics view, administrators can explore interactive visual charts tracking ordinance enactment velocity, policy distributions, and citizen report resolution rates."

---

### Step 1.9: LGU Administrator Session Sign Out [Item 22] (`06:55 – 07:05`)
#### On-Screen Action:
1. Click the user profile icon or **"Mag-log Out"** button on the bottom of the sidebar.
2. Confirm logout.
3. System clears cookies and returns cleanly to `/login`.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "Having concluded the city-level administrative walkthrough, the administrator securely signs out to transition to the barangay governance tier."

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

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "We now sign in under the Barangay Administrator Flow as the Barangay Captain of Barangay Camp Tinio.
> 
> This demonstrates our multi-tenant role-based data isolation: the barangay official can only access and manage legislative records and community reports that fall strictly within their own barangay jurisdiction."

---

### Step 2.2: Localized Barangay Governance Dashboard [Item 16] (`07:30 – 08:00`)
- **URL:** `http://localhost:3000/admin/barangay`

#### On-Screen Action:
1. Highlight the dashboard header: **"Barangay Governance Dashboard — Camp Tinio"**.
2. Show the scoped metric cards:
   - Local Ordinances of Camp Tinio
   - Pending Legislative Proposals
   - Community Reports received from Camp Tinio residents

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "This is the Barangay Governance Dashboard for Camp Tinio. Unlike the city-wide LGU view, all statistics, graphs, and notifications here are scoped exclusively to Camp Tinio.
> 
> The Barangay Captain can monitor their active local ordinances, draft resolutions, and recent incident reports filed by their constituents."

---

### Step 2.3: Processing Community Incident Reports [Items 18 & 19] (`08:00 – 08:45`)
- **URL:** `http://localhost:3000/admin/barangay/reports`

#### On-Screen Action:
1. Click **"Mga Ulat ng Residente"** (`/admin/barangay/reports`).
2. Open a newly submitted incident report (e.g., *Illegal Waste Burning in Purok 4*).
3. Review the reported details, date, and description.
4. Click the status dropdown and change from **"Bago / Pending"** to **"Inaaksyunan / In Progress"**.
5. Add an action remark: `"Forwarded to Barangay Tanod Desk for on-site inspection and verification."`
6. Click **"I-update ang Status"**.
7. Show toast confirmation and updated badge.
8. Sign out as Barangay Admin.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "In the Barangay Incident Reports Desk, officials triage citizen concerns.
> 
> We open an incident report regarding open waste burning in Purok Four. After inspecting the citizen's report, we update the status from New to In Progress, attaching an official note stating that barangay officers have been dispatched for verification.
> 
> This creates an active feedback loop between local officials and the community. We now sign out to demonstrate the public citizen experience."

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

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "We now transition to the End-User Citizen Flow.
> 
> A critical design principle of the Cabanatuan City Ordinance Portal is zero-barrier public transparency. Citizens are not required to create an account or sign in simply to read local laws, search ordinances, or consult the AI assistant.
> 
> However, an optional citizen account is available for residents who wish to file and track official community reports."

---

### Step 3.2: User Dashboard & 3D Interactive Archive [Item 24] (`09:15 – 09:50`)
- **URL:** `http://localhost:3000/`

#### On-Screen Action:
1. Scroll down the homepage to showcase key user interface components:
   - **Hero Search Bar** with quick suggestions.
   - **Interactive 3D Ordinance Archive** (Rotate the cylinder or interact with the Three.js canvas).
   - **Category Quick Chips:** `#Basura`, `#Trapiko`, `#Kalusugan`, `#Kapayapaan`.
2. Click the **Theme Toggle** (`theme-toggle.tsx`) in the top navigation bar to switch between **Dark Mode** and **Light Mode**, showing zero-flicker CSS tokens and high contrast.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "This is the citizen landing interface. Residents are welcomed with an interactive 3D digital ordinance archive, quick category tags for common concerns such as waste disposal and traffic rules, and the latest official advisories from City Hall.
> 
> The portal adheres strictly to Web Content Accessibility Guidelines, featuring a persistent Light and Dark theme toggle that maintains accessible contrast ratios across all viewports."

---

### Step 3.3: Ordinance Search & Dynamic Multi-Filtering [Item 25] (`09:50 – 10:35`)
- **URL:** `http://localhost:3000/ordinances`

#### On-Screen Action:
1. Type `"Curfew"` in the search bar and press `Enter` to navigate to `/ordinances?search=Curfew`.
2. Show the matching ordinances rendered instantly (e.g. *Ordinance on Curfew Hours for Minors*).
3. Clear search. Demonstrate **Year Range Filter** (e.g. 2022 to 2026).
4. Select Category Filter: **"Kalusugan at Sanitasyon"**.
5. Watch the cards update with smooth skeleton shimmer states and accurate count badge.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "In the Public Ordinance Explorer, finding local regulations is fast and intuitive.
> 
> Citizens can search using plain keywords or resolution numbers. For instance, searching for 'Curfew' immediately returns the municipal ordinance regarding curfew hours for minors.
> 
> In addition to keyword search, users can combine dynamic year range sliders with policy category filters to discover health, environmental, and public safety regulations."

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

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "Addressing Item twenty-nine of the guide, we demonstrate how citizens view and download official documentation.
> 
> The split-screen ordinance viewer breaks down complex legal texts into readable articles, penalties, and designated enforcement agencies.
> 
> If a resident requires an official copy for legal purposes, they can open the integrated PDF viewer modal to inspect the signed document with zoom controls, or download the original file directly to their device."

---

### Step 3.5: Core Innovation — "Cabanatuan Ordinance AI" Civic Assistant (`11:15 – 12:30`)
- **URL:** `http://localhost:3000/chatbot`

#### On-Screen Action:
1. Click **"AI Assistant"** in the navigation bar to open `/chatbot`.
2. Point out the clear disclaimer badge at the top:
   > *"Ang AI Assistant ay nagbibigay ng impormasyon batay lamang sa mga opisyal na ordinansa ng Cabanatuan City. Hindi ito nagbibigay ng legal advice."*
3. **Question 1 (Tagalog / English Inquiry with Specific Ordinance Citation):**
   - Type and send: `"What are the penalties for open burning of waste or garbage in our barangay?"`
   - Observe real-time token streaming.
   - Highlight the AI's response: cites exact Resolution Number, series year, and tiered monetary fines / community service penalties.
4. **Question 2 (Safety Guardrail & Honest Out-of-Scope Test):**
   - Type and send: `"How do I apply for a Philippine passport at DFA?"` or `"Who won the latest basketball championship?"`
   - Observe the response: The AI politely and honestly explains that it is strictly scoped to Cabanatuan City ordinances, does not hallucinate national agency procedures, and advises the resident accordingly.
5. Demonstrate the **"Bagong Usapan / Clear Chat"** button and local storage session persistence.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "We now turn to the flagship feature of our research: the Cabanatuan Ordinance AI Civic Assistant, powered by Google Gemini using Retrieval-Augmented Generation.
> 
> Citizens often struggle to interpret technical legal phrasing. Through our conversational AI, residents can ask questions in natural English, Tagalog, or Taglish.
> 
> For example, when asking: 'What are the penalties for open burning of waste?', our retrieval pipeline queries the local database for relevant ordinances and injects them as grounding context into the Gemini model. Notice that the AI cites the exact resolution number, specific article sections, and the tiered penalty structure from first to third offenses.
> 
> Furthermore, the AI enforces strict ethical safety boundaries. When asked unrelated questions such as passport renewals or sports trivia, it politely clarifies that its knowledge is strictly delimited to Cabanatuan City ordinances and that it does not provide legal counsel."

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
   - Violation Category: **"Ilegal na Pagtatapon ng Basura / Open Burning"**.
   - Location / Landmark: `"Purok 4, near the corner of San Josef Road"`.
   - Incident Details: `"Ongoing open burning of dry leaves and plastic waste occurring during late afternoons."`
4. Demonstrate **Draft Persistence**: Refresh the browser page (`F5`) to prove that typed contents survive accidental reload via client-side draft storage!
5. Click **"I-sumite ang Ulat sa Barangay"**.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "For Items twenty-five and twenty-six of the guide, we demonstrate the Community Incident Reporting module.
> 
> When residents witness an ordinance violation, they can submit an official report directly to their barangay hall.
> 
> Attempting to submit an empty form triggers accessible field validations, preventing malformed submissions. The form also features client-side draft persistence, ensuring that user input is never lost upon an accidental page refresh.
> 
> We select Barangay Camp Tinio, specify the incident details in Purok Four, and submit the report."

---

### Step 3.7: Submission Feedback, Verification & Traceability [Items 26–28] (`13:15 – 13:45`)
- **URL:** `http://localhost:3000/report`

#### On-Screen Action:
1. Highlight the green confirmation alert banner rendered on screen (`role="alert"`).
2. Point out:
   - **Confirmation Notice:** Report successfully submitted.
   - **Destination Barangay Hall:** Barangay Camp Tinio.
   - **Reference Tracking Code:** Generated unique identifier for tracking.
3. Briefly highlight that this seamlessly ties back to the earlier **Barangay Admin Flow (Part 2)** where the Punong Barangay received, triaged, and updated this exact report.

#### 🗣️ Verbatim Voice Narration (AI Voice):
> "Upon submission, the portal displays an instant confirmation banner containing an official transaction reference code, verifying that the report has been routed to the Barangay Hall of Camp Tinio.
> 
> This is the exact report that we reviewed and processed earlier during the Barangay Administrator walkthrough, proving complete end-to-end transparency and operational traceability."

---

## 🎯 WRAP-UP & DEFENSE CONCLUSION (`13:45 – 14:15`)
**Guide Reference: Section III & IV**

### On-Screen Action:
- Return to the clean Homepage or the Capstone Slide Summary.
- Present a final closing screen with project credits.

### 🗣️ Verbatim Voice Narration (AI Voice):
> "In summary, we have demonstrated the complete operational lifecycle of the Cabanatuan City Ordinance Portal:
> 
> First, centralized administration, multimodal AI document parsing, and PDF legislative reporting for City Hall;
> 
> Second, localized governance and citizen incident triage for the eighty-nine administrative barangays; and
> 
> Third, zero-barrier public access, split-screen legal exploration, civic reporting, and the bilingual Gemini AI assistant for the citizens of Cabanatuan City.
> 
> This concludes our official system walkthrough. Thank you very much for your time and attention, and we look forward to your questions during the defense examination."

---

## 📌 Defense Panel FAQ Cheat Sheet (Anticipated Questions & Answers)

Keep these answers ready for the live panel examination:

1. **Question: Why was Google Gemini chosen over OpenAI or a self-hosted model?**  
   *Answer:* "Google Gemini 3.5 Flash Lite was selected based on our technical benchmarks in Chapter Two. It provides native multimodal vision capabilities for scanning physical ordinance pages and superior bilingual Tagalog and English comprehension at sub-second inference speeds. Furthermore, under our Retrieval-Augmented Generation architecture, the Gemini API is the only external service call, keeping all city records private within our local SQLite database."

2. **Question: How does the system prevent AI hallucinations and unauthorized legal advice?**  
   *Answer:* "The AI chatbot enforces strict grounding constraints. It only generates answers based on retrieved context from uploaded city ordinances stored in the local database. A prominent system-wide disclaimer clarifies that the assistant is an information-retrieval tool, not a legal authority, and explicitly refuses out-of-scope national legal inquiries."

3. **Question: How is multi-tenant security handled across eighty-nine barangays?**  
   *Answer:* "We implemented multi-tenant role-based access control using Prisma ORM and cryptographically verified JSON Web Tokens. Each barangay administrator's session is strictly bounded to their assigned barangay identifier. Server-side middleware and route guards automatically deny any cross-barangay record mutations."
