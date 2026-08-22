import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function main() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    // Simulating slicing that results in a model message first
    const windowedMessages = [
      { role: "assistant", content: "I am an assistant." },
      { role: "user", content: "Hello" }
    ];
    
    const contents = windowedMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    console.log("Calling Gemini API with model first...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction: "You are a helpful assistant.",
        temperature: 0.3,
      },
    });
    
    console.log(response.text);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
