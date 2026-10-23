import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * AI Citizen Ordinance & Civic Assistant API Route.
 * Uses @google/genai with gemini-3.5-flash-lite, local SQLite keyword RAG,
 * multi-tier abuse defense, streaming with mid-stream error handling, and JSON fallback.
 */

// ─── Rate Limiting & Abuse Defense In-Memory Store ───────────────────────────
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipRateLimits = new Map<string, RateLimitRecord>();
let globalDailyCount = 0;
let currentDay = new Date().toISOString().slice(0, 10);

// Periodically purge expired IP rate limit records (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, rec] of ipRateLimits.entries()) {
      if (now > rec.resetAt) {
        ipRateLimits.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Resolves the client IP address from request headers with origin verification.
 *
 * NOTE ON DIRECT RAILWAY ORIGIN SPOOFING:
 * If an attacker directly accesses the Railway public domain (*.up.railway.app),
 * they can forge any arbitrary 'cf-connecting-ip' header.
 *
 * To guarantee authenticity in production:
 * 1. Configure an origin verification secret via CLOUDFLARE_PROXY_SECRET.
 *    Cloudflare forwards this secret in 'x-cf-secret' (configured via Cloudflare Transform Rules).
 *    When CLOUDFLARE_PROXY_SECRET is set, 'cf-connecting-ip' is ONLY trusted if 'x-cf-secret' matches!
 * 2. Alternatively, the public *.up.railway.app domain is removed from Railway networking settings
 *    so only the custom Cloudflare proxied domain can route traffic to the container.
 */
function getClientIp(req: Request): string {
  const proxySecret = process.env.CLOUDFLARE_PROXY_SECRET;
  const cfIp = req.headers.get("cf-connecting-ip");

  if (cfIp) {
    if (proxySecret) {
      const incomingSecret = req.headers.get("x-cf-secret");
      if (incomingSecret === proxySecret) {
        return cfIp.trim();
      }
      // Untrusted direct hit attempting to spoof Cloudflare header
      console.warn("⚠️ [/api/chat] CF-Connecting-IP present without valid x-cf-secret; ignoring spoofable header.");
    } else {
      return cfIp.trim();
    }
  }

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

/**
 * Parses upstream errors to identify Gemini rate-limiting (429) or billing depletion (402).
 */
function parseGeminiError(err: unknown): { is429: boolean; is402: boolean } {
  const errObj = typeof err === "object" && err !== null ? (err as Record<string, unknown>) : {};
  const status = errObj.status ?? errObj.code;
  const message = err instanceof Error ? err.message : String(err ?? "");

  const is429 =
    status === 429 ||
    status === "RESOURCE_EXHAUSTED" ||
    message.includes("429") ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("Quota exceeded");

  const is402 =
    status === 402 ||
    status === "PAYMENT_REQUIRED" ||
    message.includes("402") ||
    message.includes("PAYMENT_REQUIRED") ||
    message.includes("billing") ||
    message.includes("prepaid credits");

  return { is429, is402 };
}

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

const MAX_MESSAGE_LENGTH = 1000;

export async function POST(request: Request) {
  const startTime = performance.now();
  const now = Date.now();
  const clientIp = getClientIp(request);

  // 1. Enforce Per-IP Rate Limiting (Default: 20 req/min to safely support Philippine CGNAT mobile users)
  const rateLimitPerMin = parseInt(process.env.CHAT_RATE_LIMIT_PER_MIN || "20", 10);
  const windowMs = 60 * 1000;
  let ipRecord = ipRateLimits.get(clientIp);

  if (!ipRecord || now > ipRecord.resetAt) {
    ipRecord = { count: 1, resetAt: now + windowMs };
    ipRateLimits.set(clientIp, ipRecord);
  } else {
    ipRecord.count++;
  }

  if (ipRecord.count > rateLimitPerMin) {
    const retryAfterSec = Math.max(1, Math.ceil((ipRecord.resetAt - now) / 1000));
    return NextResponse.json(
      {
        error: "Masyadong maraming kahilingan mula sa inyong koneksyon. Mangyaring maghintay bago magtanong muli. / Too many requests from your IP connection. Please wait before asking again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfterSec.toString(),
        },
      }
    );
  }

  // 2. Enforce Daily Limit (Default: 1,000 queries/day = max ~₱2,330/month at ₱0.0777/query)
  const dailyLimit = parseInt(process.env.CHAT_DAILY_LIMIT || "1000", 10);
  const today = new Date().toISOString().slice(0, 10);
  if (today !== currentDay) {
    currentDay = today;
    globalDailyCount = 0;
  }
  if (globalDailyCount >= dailyLimit) {
    return NextResponse.json(
      {
        error: "Naabot na ang pang-araw-araw na limitasyon ng AI chat sa buong portal (1,000 queries/day). Mangyaring bumalik bukas. / Daily portal AI limit reached. Please return tomorrow.",
      },
      { status: 503 }
    );
  }
  globalDailyCount++;

  try {
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Mangyaring magpadala ng tamang mensahe." },
        { status: 400 }
      );
    }

    const { messages, sessionId, userId, stream: wantsStream } = body;
    const lastMessage = messages[messages.length - 1]?.content || "";

    // 3. Prevent Token Bombs: Cap user message length to 1,000 characters
    if (typeof lastMessage !== "string" || lastMessage.length === 0) {
      return NextResponse.json(
        { error: "Hindi maaaring walang laman ang mensahe." },
        { status: 400 }
      );
    }

    if (lastMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          error: `Napakalaki ng mensahe (${lastMessage.length} titik). Mangyaring limitahan ang inyong katanungan sa ${MAX_MESSAGE_LENGTH} titik upang maiwasan ang labis na paggamit ng sistema.`,
        },
        { status: 400 }
      );
    }

    // 1 Session per device/user in Database
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
              messages: messages as unknown as Prisma.InputJsonValue,
              userId: userId || existingSession.userId,
            },
          });
        } else {
          await prisma.chatSession.create({
            data: {
              id: sessionId || undefined,
              userId: userId || null,
              messages: messages as unknown as Prisma.InputJsonValue,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("Could not sync chat session to database:", dbErr);
    }

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

        // Strictly cap to top 4 matches and excerpt characters to keep prompt tokens bounded under 1,800
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
   - HUWAG magtala ng mga hindi tinanong na paksa.

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

    const contents = windowedMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    // 4. STREAMING MODE with MID-STREAM ERROR HANDLING
    const isStreamRequested =
      wantsStream === true ||
      request.headers.get("accept") === "text/event-stream" ||
      request.headers.get("accept") === "text/plain";

    if (isStreamRequested) {
      const responseStream = await aiClient.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseStream) {
              if (chunk.text) {
                controller.enqueue(encoder.encode(chunk.text));
              }
            }
            controller.close();
          } catch (midStreamErr: unknown) {
            // MID-STREAM ERROR HANDLING:
            // Since HTTP 200 headers have already been transmitted, upstream exceptions
            // occurring mid-generation (e.g. rate limits or quota drops) cannot change the HTTP status code.
            // An in-band notification is injected directly into the response stream for graceful client rendering.
            const parsed = parseGeminiError(midStreamErr);
            const errNotice = parsed.is429
              ? "\n\n⚠️ *[Kasalukuyang naabot ang upstream rate limit habang binubuo ang sagot. Mangyaring maghintay ng ilang sandali.]*"
              : parsed.is402
              ? "\n\n⚠️ *[Pansamantalang naputol ang serbisyo ng AI assistant dahil sa billing quota limitation. Mangyaring sumangguni sa City Secretariat.]*"
              : "\n\n⚠️ *[Naputol ang koneksyon sa AI assistant habang bumubuo ng tugon. Mangyaring subukang muli.]*";
            controller.enqueue(encoder.encode(errNotice));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // 5. STANDARD JSON RESPONSE (for non-streaming frontend clients)
    const response = await aiClient.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        maxOutputTokens: 500,
      },
    });

    const replyText =
      response.text || "Paumanhin, hindi ako nakabuo ng sagot sa ngayon.";

    if (process.env.NODE_ENV !== "production") {
      console.log(`⏱️ [/api/chat] Responded in ${(performance.now() - startTime).toFixed(1)}ms`);
    }

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    const parsed = parseGeminiError(error);

    // Graceful Pre-Stream Error Handling
    if (parsed.is429) {
      console.warn("⚠️ [/api/chat] Upstream Gemini 429 rate limit reached.");
      return NextResponse.json(
        {
          error:
            "Kasalukuyang abala ang serbisyo ng AI assistant dahil sa mataas na bilang ng mga nagtatanong. Mangyaring maghintay ng ilang sandali at subukang muli. / The AI assistant is temporarily busy due to high demand. Please try again in a moment.",
        },
        {
          status: 503,
          headers: {
            "Retry-After": "15",
          },
        }
      );
    }

    if (parsed.is402) {
      console.error(
        "🚨 [BILLING ALERT] Prepaid credits depleted or billing issue encountered (HTTP 402). Top up credits at https://aistudio.google.com/docs/billing"
      );
      return NextResponse.json(
        {
          error:
            "Pansamantalang hindi magagamit ang AI assistant. Mangyaring sumangguni muna sa City Secretariat o subukang muli mamaya. / The AI assistant is temporarily unavailable. Please refer to the City Secretariat or try again later.",
        },
        { status: 503 }
      );
    }

    console.error("Chatbot API Error:", error);
    return NextResponse.json(
      {
        error:
          "Nagkaroon ng aberya sa server. Mangyaring subukang muli mamaya. / Server encountered an unexpected error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
