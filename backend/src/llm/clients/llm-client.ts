import { ZodType } from "zod";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMClient {
  chatStructured<T>(messages: Message[], schema: ZodType<T>, jsonSchema: object): Promise<T>;
}

export interface LLMConfig {
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
}

export function readLLMConfig(): LLMConfig {
  return {
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS ?? "", 10) || 4096,
    temperature: parseFloat(process.env.LLM_TEMPERATURE ?? "") || 0.2,
    timeoutMs: parseInt(process.env.LLM_TIMEOUT_MS ?? "", 10) || 60_000,
  };
}

export abstract class BaseLLMClient implements LLMClient {
  abstract chatStructured<T>(messages: Message[], schema: ZodType<T>, jsonSchema: object): Promise<T>;
  protected abstract callApi(body: unknown): Promise<string>;
}

