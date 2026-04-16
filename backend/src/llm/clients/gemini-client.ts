import { ZodType } from "zod";
import { BaseLLMClient, Message } from "./llm-client";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export class GeminiClient extends BaseLLMClient {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(model = "gemini-2.0-flash") {
    super();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is required");
    this.apiKey = apiKey;
    this.model = model;
  }

  async chatStructured<T>(messages: Message[], schema: ZodType<T>, jsonSchema: object): Promise<T> {
    const system = messages.find((m) => m.role === "system");
    const text = await this.callApi({
      contents: messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      ...(system && { systemInstruction: { parts: [{ text: system.content }] } }),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        maxOutputTokens: this.maxTokens,
        temperature: this.temperature,
      },
    });
    try {
      return schema.parse(JSON.parse(text));
    } catch {
      throw new Error(`Gemini returned invalid JSON: ${text}`);
    }
  }

  protected async callApi(body: unknown): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(
        `${GEMINI_API_BASE}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );
      if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
      const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`Unexpected Gemini response shape: ${JSON.stringify(data)}`);
      return text;
    } catch (e) {
      if ((e as Error).name === "AbortError") throw new Error(`Gemini request timed out after ${this.timeoutMs}ms`);
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }
}
