import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function main() {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    
    console.log("Calling Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: "Hello",
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
