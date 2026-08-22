import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { prisma } from "./src/lib/prisma";
import { ai } from "./src/lib/gemini";

async function main() {
  try {
    const messages = [{ role: "user", content: "Ano ang ordinansa at curfew hours para sa mga menor de edad sa Cabanatuan?" }];
    const lastMessage = messages[messages.length - 1]?.content || "";

    const keywords = lastMessage
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 3)
      .slice(0, 3);

    let dbContext = "Walang partikular na ordinansang tumugma sa database.";

    if (keywords.length > 0) {
      console.log("Searching DB with keywords:", keywords);
      const matchedOrdinances = await prisma.ordinance.findMany({
        where: {
          status: "APPROVED",
          OR: keywords.map((kw: string) => ({
            OR: [
              { title: { contains: kw, mode: "insensitive" } },
              { content: { contains: kw, mode: "insensitive" } },
              { resolutionNumber: { contains: kw, mode: "insensitive" } },
            ],
          })),
        },
        take: 3,
        include: {
          barangay: true,
        },
      });
      console.log("Found ordinances:", matchedOrdinances.length);
    }

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const systemInstruction = "Ikaw ay AI.";

    console.log("Calling gemini");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    console.log("Response text:", response.text);

  } catch (err) {
    console.error("Crashed with:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
