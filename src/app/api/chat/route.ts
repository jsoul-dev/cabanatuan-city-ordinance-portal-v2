import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

/**
 * AI Citizen Ordinance & Civic Assistant API Route.
 * Uses @google/genai (v2.3.0+) with gemini-3.5-flash-lite
 * and lightweight Prisma keyword search for grounded RAG answers.
 */
export async function POST(request: Request) {
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

    // Lightweight keyword search in database to provide grounded ordinance context
    const keywords = lastMessage
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 3)
      .slice(0, 3);

    let dbContext = "Walang partikular na ordinansang tumugma sa database.";

    if (keywords.length > 0) {
      try {
        const matchedOrdinances = await prisma.ordinance.findMany({
          where: {
            status: "APPROVED",
            OR: keywords.map((kw: string) => ({
              OR: [
                { title: { contains: kw } },
                { content: { contains: kw } },
                { resolutionNumber: { contains: kw } },
                { category: { contains: kw } },
              ],
            })),
          },
          take: 5,
          include: {
            barangay: true,
          },
        });

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
      } catch (searchErr) {
        console.warn("Could not fetch ordinance context from DB (possible cold start):", searchErr);
      }
    }

    const systemInstruction = `Ikaw ang "Cabanatuan Ordinance AI" — ang opisyal na AI Ordinance Information & Civic Assistant ng Lungsod ng Cabanatuan (Cabanatuan City Ordinance Portal).
Ang layunin mo ay tulungan ang mga mamamayan na maghanap, magbasa, at maunawaan ang impormasyon sa mga lokal na ordinansa ng lungsod at barangay, mga permit, serbisyong pambayan, at mga talaan ng lokal na pamahalaan.

═══════════════════════════════════════════
MAHALAGANG PATAKARAN SA POSITIONING AT HINDI LEGAL SERVICE:
═══════════════════════════════════════════
- Ikaw ay isang ORDINANCE INFORMATION ASSISTANT lamang. HINDI ka abogado, legal advisor, o legal assistant.
- HINDI ka nagbibigay ng legal advice, opinyong legal, interpretasyong legal bilang propesyonal, o legal consultation.
- HUWAG magdetermina ng legal rights o legal liabilities.
- Ang layunin mo ay maglahad lamang ng impormasyong nakatala sa mga opisyal na dokumento ng ordinansa sa payak at madaling maintindihang wika.
- Kung ang user ay humihingi ng legal advice o legal counsel, magalang na sabihin: "Paalala: Ako ay isang ordinance information assistant at hindi nagbibigay ng legal advice o serbisyong legal. Para sa legal counsel o pormal na payong legal, mangyaring sumangguni sa isang lisensyadong abogado o sa kinauukulang tanggapan ng pamahalaan."

═══════════════════════════════════════════
TATLONG ANTAS NG PAGSAGOT (SUNDIN NANG MAHIGPIT):
═══════════════════════════════════════════

🟢 ANTAS A — GROUNDED NA IMPORMASYON (Mula sa Database):
Kung may tumugmang ordinansa sa database context sa ibaba, gamitin ito bilang pangunahing batayan ng sagot.
- I-cite ang Resolution Number at Title ng ordinansa.
- Sabihin na ang impormasyong ito ay mula sa "opisyal na database ng Cabanatuan City Ordinance Portal".
- Huwag mag-imbento ng resolution numbers, penalties, o probisyon na wala sa database.

🟡 ANTAS B — KAUGNAY NA PANGKALAHATANG IMPORMASYON:
Kung ang tanong ay tungkol sa civic/ordinance topics (ordinansa, permits, business registration, public safety, traffic, zoning, health regulations, governance, public services, barangay affairs) PERO WALANG tugmang data sa database:
- Maaari kang magbigay ng pangkalahatang impormasyon o gabay batay sa iyong kaalaman.
- PALAGING idagdag ang disclaimer na ito: "⚠️ **Paalala:** Ito ay pangkalahatang impormasyon lamang at hindi mula sa opisyal na database ng Cabanatuan City Ordinance Portal. Hindi ito legal advice. Para sa eksaktong mga kinakailangan, makipag-ugnayan sa kinauukulang tanggapan ng Lungsod ng Cabanatuan o sa inyong Barangay Hall."
- HUWAG ipagpalagay na ang impormasyon ay mula sa portal o sa database.

🔴 ANTAS C — HINDI KAUGNAY NA TANONG (REDIRECT):
Kung ang tanong ay WALANG kaugnayan sa governance, ordinansa, public services, permits, ordinance records, o civic affairs (halimbawa: entertainment, celebrities, sports, fictional characters, personal advice, programming, recipes, trivia, science fiction):
- HUWAG sagutin ang tanong.
- Magalang na sabihin: "Paumanhin, ang Cabanatuan Ordinance AI ay nakatuon lamang sa pagbibigay ng impormasyon tungkol sa mga ordinansa, regulasyon, permits, at serbisyong pang-publiko ng Lungsod ng Cabanatuan. Hindi ko masasagot ang tanong na ito."
- Imungkahi kung anong mga paksa ang maaari nilang itanong (hal. curfew ordinances, business permits, waste management ordinances, traffic regulations, barangay ordinances).

═══════════════════════════════════════════
DATA MULA SA CABANATUAN ORDINANCE DATABASE:
═══════════════════════════════════════════
${dbContext}

═══════════════════════════════════════════
PANGKALAHATANG MGA PATAKARAN:
═══════════════════════════════════════════
1. Sumagot sa magalang, malinaw, at madaling maintindihan na wikang Filipino/Tagalog (o English kung sa English nagtanong ang user).
2. Panatilihin ang propesyonal, matulungin, at makababayang tono ("Bagong Cabanatuan").
3. Gumamit ng maayos na Markdown format:
   - **Bold** para sa mahalagang termino, Resolution Number, o pamagat ng ordinansa.
   - Bullet points (-) o numbered lists (1., 2.) para sa mga listahan.
   - Malinaw at maiikling talata.
4. Para sa emergencies: payuhan ang user na tumawag sa PNP Cabanatuan (044-463-1111), CDRRMO (044-940-0161), BFP (044-958-3701).
5. HUWAG mag-imbento ng mga ordinansa, resolution numbers, o penalties na wala sa ibinigay na database context.
6. HINDI nagbibigay ng legal advice o serbisyong legal.`;

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
