import { GroqClient } from "./clients/groq-client";
import { LLMClient } from "./clients/llm-client";
import { OllamaClient } from "./clients/ollama-client";

export function createLLMClient(): LLMClient {
  const provider = process.env.LLM_PROVIDER ?? "ollama";
  const model = process.env.LLM_MODEL;
  
  if (!model) throw new Error("LLM_MODEL environment variable is required for LLM provider");

  switch (provider) {
    case "ollama":
      return new OllamaClient(model);
    case "groq":
      return new GroqClient(model);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
