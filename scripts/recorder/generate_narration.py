import asyncio
import os
import subprocess
import edge_tts

AUDIO_DIR = r"C:\.JC\Antigravity-Projects\Capstone Project v2\demo-output\audio"
VOICE = "en-US-ChristopherNeural"

SCRIPTS = {
    "section_a": """Good day, respected members of the panel, advisers, and guests. Welcome to the official system demonstration of our capstone project: the Cabanatuan City Ordinance Portal. In modern local governance, access to public legislative records is critical for civic compliance, transparency, and administrative efficiency. Before this portal, citizens and local officials faced significant bottlenecks—such as fragmented record keeping, difficult physical archiving, and lack of real-time visibility into enacted city and barangay ordinances. This web-based portal bridges that gap by delivering a centralized, dual-tier digital repository that connects the LGU administration, participating barangay councils, and ordinary citizens. Today, we will present a complete operational walkthrough of the system, starting with the Administrator flow, followed by the citizen-facing features and analytical reporting.""",

    "section_b1": """We begin our demonstration with the Administrator Flow, which showcases the portal's dual-tier governance architecture. First, we log in as a Barangay Administrator using Kapitan Juan Del Rosario's demonstration account for Barangay Camp Tinio. Upon authentication, we arrive at the localized Barangay Dashboard. Here, barangay officials have a dedicated operational view of their community's legislative records, active resident reports, and enactment statistics. In the Barangay Ordinance module, local councils can draft and upload community-level ordinances—such as our Camp Tinio Solid Waste Segregation Measure. Once drafted, the barangay submits the ordinance directly to the city government for legislative review. In addition, the Barangay Reports module allows local officials to view and manage incident reports submitted by their own residents—such as open trash burning or neighborhood noise disturbances. Officials can review evidence, post action notes, and update statuses from New, to In-Progress, to Resolved. Having demonstrated the barangay level, we now log out to transition to the city-wide administration.""",

    "section_b2": """Next, we log in using the LGU Super Administrator account. Welcomed by the City Executive Dashboard, city officials monitor consolidated legislative data across all eighty-nine barangays of Cabanatuan City. Navigating to the legislative review queue, the LGU administrator inspects the newly submitted Camp Tinio ordinance, verifies the statutory terms and resolution details, and officially approves it into the public registry. In addition, the administrator can manage city-wide ordinances enacted by the Sangguniang Panlungsod, including uploading digitized official PDF copies, categorizing regulatory scope, and defining penal sanctions. Under the City Reports view, administrators maintain cross-barangay oversight on all reported infractions. Furthermore, the User Management module guarantees secure role-based access control, allowing administrators to govern staff credentials across both municipal and barangay tiers. We now conclude the administrator demonstration and proceed to the citizen flow.""",

    "section_c": """We now transition to the End-User Flow, designed specifically for citizens and community stakeholders. Arriving at the public portal, citizens have immediate, friction-free access to legislative information without requiring an upfront login. In the Ordinance Directory, users can explore records using an intelligent search and filtering system. Whether looking for environmental regulations, curfew policies, or traffic measures, users can filter by jurisdiction level, category, year, and specific barangay. Opening an ordinance displays complete, verified information. Rather than presenting dense, unreadable scans, the portal structures the document clearly—highlighting penalties, enforcement bodies, and legislative articles, while preserving access to the official signed PDF copy for legal verification. To foster civic participation, the portal includes an online Ordinance Reporting module. Citizens witnessing non-compliance—such as noise violations or illegal dumping—can submit structured reports directly to the concerned authorities. The system supports anonymous reporting to safeguard informant privacy and issues an immediate tracking reference upon submission. A standout innovation of our capstone is the AI-Assisted Ordinance Assistant. Built on retrieval-grounded technology, this tool allows citizens to ask plain-language questions—such as youth curfews or business permit rules—and receive instant, synthesized explanations grounded directly in verified municipal ordinances, complete with citations and clear legal disclaimers. Lastly, the News module keeps the public informed on upcoming public hearings, executive orders, and newly enacted policies.""",

    "section_d": """Local governance relies heavily on evidence-based decision-making. In Section D, we highlight the portal's Analytics and Reporting suite. Administrators can evaluate legislative trends over time through interactive visualizations—identifying high-frequency regulatory categories, measuring annual ordinance output, and monitoring legislative contributions across all eighty-nine barangays of Cabanatuan City. Furthermore, the incident analytics module aggregates community violation reports into actionable data, allowing the Sangguniang Panlungsod and barangay officials to identify systemic compliance issues—such as chronic traffic bottlenecks or environmental hot spots. Reports can be customized with date and status filters and exported for formal council sessions, enhancing both institutional memory and accountability.""",

    "section_e": """In conclusion, the Cabanatuan City Ordinance Portal transforms how local legislation is preserved, accessed, and enforced. By bridging the administrative workflow between the LGU and barangays, and empowering citizens with accessible digital records, incident reporting, and an AI-powered inquiry assistant, the system fulfills its primary objective of enhancing transparency, public compliance, and local legislative efficiency. Thank you very much for your time and attention. We now welcome the questions and recommendations of our esteemed panel of evaluators."""
}

async def generate_all():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    for key, text in SCRIPTS.items():
        out_path = os.path.join(AUDIO_DIR, f"{key}.mp3")
        print(f"Generating voiceover for {key}...")
        communicate = edge_tts.Communicate(text, VOICE, rate="-2%")
        await communicate.save(out_path)
        
        # Check duration with ffprobe
        cmd = [
            "ffprobe", "-v", "error", "-show_entries",
            "format=duration", "-of", "default=noprint_wrappers=1:nokey=1",
            out_path
        ]
        duration = float(subprocess.check_output(cmd).decode().strip())
        print(f"  -> {key}.mp3 saved! Duration: {duration:.2f}s ({duration/60:.2f} min)")

if __name__ == "__main__":
    asyncio.run(generate_all())
