import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { GoogleGenAI } from "@google/genai";
import { prisma } from "./src/lib/prisma";

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    // 1. Simulate the user asking about a specific ordinance
    const userQuery = "Sino ang nag-akda at ano ang layunin ng Ordinance No. 681-2024 tungkol sa CCTV cameras?";
    
    const keywords = ["ordinance", "681-2024", "cctv"];
    let dbContext = "Walang partikular na ordinansang tumugma sa database.";

    console.log("Mocking DB search for:", keywords.join(", "));
    
    // Simulating what Prisma would return from the database
    const matchedOrdinances = [
      {
        resolutionNumber: "681-2024",
        type: "CITY",
        title: "CCTV Installation Ordinance of Cabanatuan City",
        description: "Nag-aatas sa lahat ng negosyo na maglagay ng CCTV cameras bilang requirement sa Business Permit.",
        articles: "Article 1: All commercial establishments must install high-definition CCTV cameras covering entry and exit points.",
        penalties: "Multa: Php 5,000 at revocation ng business permit para sa hindi pagsunod.",
        barangay: null
      },
      {
        resolutionNumber: "120-2024",
        type: "BARANGAY",
        title: "Pagpapataw ng Multa sa mga Asong Pagala-gala (Stray Dogs)",
        description: "Ipinagbabawal ang paggala ng mga alagang aso sa mga pampublikong lugar nang walang tali.",
        articles: "Seksyon 1: Lahat ng aso ay dapat may tali kapag inilalabas. Seksyon 2: Ang mga asong pagala-gala ay huhulihin ng barangay tanod.",
        penalties: "Unang paglabag: Php 500. Ikalawang paglabag: Php 1,000.",
        barangay: { name: "Camp Tinio" }
      }
    ];

    console.log(`Found ${matchedOrdinances.length} matching ordinances in DB.`);
    
    if (matchedOrdinances.length > 0) {
      dbContext =
        "KASALUKUYANG MGA ORDINANSA NG KABANATUAN SA DATABASE:\n" +
        matchedOrdinances
          .map(
            (ord) =>
              `- Res. No. ${ord.resolutionNumber} (${ord.type === "CITY" ? "City Ordinance" : `Brgy. ${ord.barangay?.name}`}): ${ord.title}\n  Buod/Description: ${ord.description || ""}\n  Nilalaman/Articles: ${ord.articles?.slice(0, 400) || ord.content?.slice(0, 300)}...\n  Penalties: ${ord.penalties?.slice(0, 300) || "Wala"}`
          )
          .join("\n\n");
    }

    console.log("\n--- INJECTED CONTEXT ---");
    console.log(dbContext);
    console.log("------------------------\n");

    const systemInstruction = `Ikaw ang "Cabanatuan Ordinance AI" — ang opisyal na AI Ordinance & Civic Assistant ng Lungsod ng Cabanatuan.
Lagi mong ibase ang iyong sagot sa ibinigay na data mula sa Cabanatuan Ordinance Database.

DATA MULA SA CABANATUAN ORDINANCE DATABASE:
${dbContext}
`;

    const contents = [{ role: "user", parts: [{ text: userQuery }] }];

    console.log("Calling Gemini API with user query:", userQuery);
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    console.log("\n--- GEMINI RESPONSE ---");
    console.log(response.text);
    console.log("-----------------------\n");

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
