import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";

let llmInstance = null;

export function getLLM() {
  if (!llmInstance) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      console.warn("⚠️  MISTRAL_API_KEY is not configured in .env. AI generation will use structured fallbacks.");
    }
    llmInstance = new ChatMistralAI({
      apiKey: apiKey || "dummy-key",
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      temperature: 0.3,
      maxRetries: 2,
    });
  }
  return llmInstance;
}

const llm = getLLM();
export default llm;
