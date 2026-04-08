import { LLMClient } from "./llm-client";
import { OllamaClient } from "./ollama-client";

export function createLLMClient(): LLMClient {
  const provider = process.env.LLM_PROVIDER ?? "ollama";
  const model = process.env.LLM_MODEL ?? "llama3.1";

  switch (provider) {
    case "ollama":
      return new OllamaClient(model);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
