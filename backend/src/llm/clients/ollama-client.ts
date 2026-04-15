import { ZodType } from "zod";
import { BaseLLMClient, Message } from "./llm-client";

export class OllamaClient extends BaseLLMClient {
  private readonly url: string;
  private readonly model: string;

  constructor(model = "llama3.1", url = process.env.OLLAMA_URL ?? "http://localhost:11434") {
    super();
    this.model = model;
    this.url = url;
  }

  async chatStructured<T>(messages: Message[], schema: ZodType<T>, jsonSchema: object): Promise<T> {
    const text = await this.callApi({
      model: this.model,
      messages,
      stream: false,
      format: jsonSchema,
      options: { num_predict: this.maxTokens, temperature: this.temperature },
    });
    try {
      return schema.parse(JSON.parse(text));
    } catch {
      throw new Error(`Ollama returned invalid JSON: ${text}`);
    }
  }

  protected async callApi(body: unknown): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.url}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
      const data = await res.json() as { message?: { content?: string } };
      const text = data?.message?.content;
      if (!text) throw new Error(`Unexpected Ollama response shape: ${JSON.stringify(data)}`);
      return text;
    } catch (e) {
      if ((e as Error).name === "AbortError") throw new Error(`Ollama request timed out after ${this.timeoutMs}ms`);
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }
}