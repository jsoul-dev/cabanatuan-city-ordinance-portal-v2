import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

/**
 * AI Citizen Ordinance & Civic Assistant API Route.
 * Uses @google/genai (v2.3.0+) with gemini-3.5-flash-lite
 * and lightweight Prisma keyword search for grounded RAG answers.
 */
const STOP_WORDS = new Set([
  "ano", "ang", "mga", "para", "sa", "ng", "at", "o", "na", "ay", "may", "ba",
  "tungkol", "nito", "dito", "doon", "sino", "bakit", "paano", "kailan", "saan",
  "ordinansa", "ordinances", "ordinance", "batas", "cabanatuan", "lungsod", "city",
  "hours", "oras", "lahat", "meron", "alamin", "pwede", "bawal", "anong", "naman",
  "kung", "saan", "ano-ano", "anong", "ito", "iyan", "iyon", "kami", "kayo", "sila",
  "what", "is", "the", "in", "of", "for", "about", "and", "or", "are", "there"
]);

function extractSearchKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

export async function POST(request: Request) {
  const startTime = performance.now();
  try {
    const { messages, sessionId, userId } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mangyaring magpadala ng tamang mensahe." },
        { status: 400 }
      );
    }

    // 1 Session per device/user in Database (prevents spamming chat_sessions table)
    try {
      if (sessionId || userId) {
        let existingSession = null;
        if (sessionId) {
          existingSession = await prisma.chatSession.findUnique({
            where: { id: sessionId },
          });
        }
        if (!existingSession && userId) {
          existingSession = await prisma.chatSession.findFirst({
            where: { userId },
          });
        }

        if (existingSession) {
          await prisma.chatSession.update({
            where: { id: existingSession.id },
            data: {
              messages: messages as any,
              userId: userId || existingSession.userId,
            },
          });
        } else {
          await prisma.chatSession.create({
            data: {
              id: sessionId || undefined,
              userId: userId || null,
              messages: messages as any,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Could not sync chat session to database:", dbErr);
    }

    const lastMessage = messages[messages.length - 1]?.content || "";
    const keywords = extractSearchKeywords(lastMessage);

    let dbContext = "Walang partikular na ordinansang tumugma sa database.";

    try {
      const allOrdinances = await prisma.ordinance.findMany({
        where: { status: "APPROVED" },
        select: {
          id: true,
          slug: true,
          resolutionNumber: true,
          title: true,
          category: true,
          type: true,
          description: true,
          content: true,
          articles: true,
          penalties: true,
          tags: true,
          barangay: { select: { name: true } },
        },
      });

      if (keywords.length > 0 && allOrdinances.length > 0) {
        const scored = allOrdinances.map((ord) => {
          let score = 0;
          const titleLower = (ord.title || "").toLowerCase();
          const descLower = (ord.description || "").toLowerCase();
          const contentLower = (ord.content || "").toLowerCase();
          const articlesLower = (ord.articles || "").toLowerCase();
          const penaltiesLower = (ord.penalties || "").toLowerCase();
          const catLower = (ord.category || "").toLowerCase();
          const tagsLower = Array.isArray(ord.tags) ? ord.tags.join(" ").toLowerCase() : "";

          for (const kw of keywords) {
            if (titleLower.includes(kw)) score += 10;
            if (tagsLower.includes(kw)) score += 8;
            if (catLower.includes(kw)) score += 6;
            if (descLower.includes(kw)) score += 4;
            if (articlesLower.includes(kw)) score += 3;
            if (penaltiesLower.includes(kw)) score += 3;
            if (contentLower.includes(kw)) score += 2;
          }

          return { ord, score };
        });

        const topMatches = scored
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);

        if (topMatches.length > 0) {
          dbContext =
            "MGA OPISYAL NA ORDINANSA MULA SA DATABASE NG CABANATUAN:\n" +
            topMatches
              .map((t) => {
                const o = t.ord;
                return `- Res. No. ${o.resolutionNumber} (${o.type === "CITY" ? "City Ordinance" : `Brgy. ${o.barangay?.name || "Barangay"}`}): ${o.title}\n  Buod: ${o.description || "Wala"}\n  Mga Probisyon/Artikulo: ${o.articles?.slice(0, 400) || o.content?.slice(0, 300) || "Nakatala sa opisyal na dokumento"}\n  Multa/Penalties: ${o.penalties?.slice(0, 300) || "Nakatala sa ordinansa"}`;
              })
              .join("\n\n");
        }
      }
    } catch (searchErr) {
      console.warn("Could not fetch ordinance context from DB:", searchErr);
    }

    const systemInstruction = `Ikaw ang "Cabanatuan Ordinance AI" — ang opisyal na information assistant ng Cabanatuan City Ordinance Portal.

PANGUNAHING PATAKARAN SA PAGSAGOT (MAIKLI, DIREKTA, AT HINDI MALIGOY):
1. MAGING MAIKLI AT DIREKTA SA PUNTO:
   - Sagutin agad ang katanungan sa unang 1 hanggang 2 pangungusap.
   - Limitahan ang kabuuang tugon sa 2 hanggang 3 maiikling talata o malinaw na bullet points lamang.
   - HUWAG maglagay ng mahahabang disclaimer sa unahan.
   - HUWAG magtala ng mga hindi tinanong na paksa (huwag mag-suggest ng "Para sa mga katanungan tungkol sa trapiko, solid waste...").

2. KUNG MAY TUGMANG ORDINANSA SA IBINIGAY NA DATABASE CONTEXT:
   - Ibigay agad ang tiyak na impormasyon (hal. oras ng curfew, saklaw na edad, mga multa, at eksepsiyon).
   - I-cite ang opisyal na Resolution Number, Barangay/City, at Pamagat ng ordinansa mula sa database.
   - Sabihin na ang impormasyong ito ay nakatala sa opisyal na database ng Cabanatuan City Ordinance Portal.

3. KUNG WALANG TUGMANG ORDINANSA SA DATABASE:
   - Sabihin nang tapat at maikli (1-2 pangungusap) na wala pa sa kasalukuyang database ang partikular na ordinansa, at magbigay ng maikling pangkalahatang gabay kung mayroon kang alam.
   - Tapusin sa maikling linya: "*Paalala: Para sa opisyal na kopya, maaaring sumangguni sa City Secretariat o sa inyong Barangay Hall.*"

4. FORMAT:
   - Gumamit ng **bold** para sa oras, edad, multa, at Resolution Number.
   - Panatilihing malinis at madaling basahin sa mobile screen.
   - Tandaan: ikaw ay nagbibigay ng impormasyon mula sa mga ordinansa, hindi legal advice.

MGA ORDINANSA SA DATABASE:
${dbContext}`;

    // Context Windowing: limit to the last 10 messages to conserve token usage
    const windowedMessages = messages.slice(-10);

    // Convert chat messages to Gemini content format
    const contents = windowedMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3, // Low temp for accurate ordinance/civic responses
      },
    });

    const replyText =
      response.text || "Paumanhin, hindi ako nakabuo ng sagot sa ngayon.";

    if (process.env.NODE_ENV !== "production") {
      console.log(`⏱️ [/api/chat] Responded in ${(performance.now() - startTime).toFixed(1)}ms`);
    }

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json(
      {
        error:
          "Nagkaroon ng aberya sa server. Mangyaring subukang muli mamaya.",
      },
      { status: 500 }
    );
  }
}
