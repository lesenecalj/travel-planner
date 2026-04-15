import { LLMClient } from "./clients/llm-client";
import { OllamaClient } from "./clients/ollama-client";
import { GeminiClient } from "./clients/gemini-client";

export function createLLMClient(): LLMClient {
  const provider = process.env.LLM_PROVIDER ?? "ollama";
  const model = process.env.LLM_MODEL;

  switch (provider) {
    case "ollama":
      return new OllamaClient(model ?? "llama3.1");
    case "gemini":
      return new GeminiClient(model ?? "gemini-2.0-flash");
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
