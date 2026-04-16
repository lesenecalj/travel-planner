import { ZodType } from "zod";
import { BaseLLMClient, Message } from "./llm-client";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";

export class GroqClient extends BaseLLMClient {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(model: string) {
    super();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY environment variable is required");
    this.apiKey = apiKey;
    this.model = model;
  }

  async chatStructured<T>(messages: Message[], schema: ZodType<T>, jsonSchema: object): Promise<T> {
    const text = await this.callApi({
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      response_format: {
        type: "json_schema",
        json_schema: { name: "response", schema: jsonSchema, strict: false },
      },
      max_tokens: this.maxTokens,
      temperature: this.temperature,
    });
    try {
      return schema.parse(JSON.parse(text));
    } catch {
      throw new Error(`Groq returned invalid JSON: ${text}`);
    }
  }

  protected async callApi(body: unknown): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error(`Unexpected Groq response shape: ${JSON.stringify(data)}`);
      return text;
    } catch (e) {
      if ((e as Error).name === "AbortError") throw new Error(`Groq request timed out after ${this.timeoutMs}ms`);
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }
}
