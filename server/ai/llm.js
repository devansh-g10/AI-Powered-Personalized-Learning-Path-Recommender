import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";

if (!process.env.MISTRAL_API_KEY) {
  throw new Error(
    "MISTRAL_API_KEY is not set in environment variables. Get your key at https://console.mistral.ai"
  );
}

/**
 * Shared ChatMistralAI instance.
 * Used for both structured output (roadmap generation) and free-form chat.
 */
const llm = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: process.env.MISTRAL_MODEL || "mistral-small-latest",
  temperature: 0.3, // Lower temperature for more deterministic, structured output
  maxRetries: 2,
});

export default llm;
