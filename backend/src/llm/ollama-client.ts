import { ZodType } from "zod";
import { LLMClient, Message } from "./llm-client";

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.2;

interface OllamaChatPayload {
    model: string;
    messages: Message[];
    stream: boolean;
    format?: object;
    options: {
        num_predict: number;
        temperature: number;
    };
}

export class OllamaClient implements LLMClient {
    private url: string;
    private model: string;
    private timeoutMs: number;
    private maxTokens: number;
    private temperature: number;

    constructor(model = "llama3.1", url = process.env.OLLAMA_URL ?? "http://localhost:11434") {
        this.model = model;
        this.url = url;
        this.timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS ?? "", 10) || DEFAULT_TIMEOUT_MS;
        this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS ?? "", 10) || DEFAULT_MAX_TOKENS;
        this.temperature = parseFloat(process.env.LLM_TEMPERATURE ?? "") || DEFAULT_TEMPERATURE;
    }

    async chatStructured<T>(messages: Message[], schema: ZodType<T>, jsonSchema: object): Promise<T> {
        const payload: OllamaChatPayload = {
            model: this.model,
            messages,
            stream: false,
            format: jsonSchema,
            options: { num_predict: this.maxTokens, temperature: this.temperature },
        };
        const data = await this.fetchOllama(payload);
        let parsed: unknown;
        try {
            parsed = JSON.parse(data.message.content);
        } catch {
            throw new Error(`LLM returned invalid JSON: ${data.message.content}`);
        }
        return schema.parse(parsed);
    }

    private async fetchOllama(payload: OllamaChatPayload): Promise<{ message: { content: string } }> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const res = await fetch(`${this.url}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            if (!res.ok) {
                throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
            }

            const data = await res.json() as { message?: { content?: string } };
            if (!data?.message?.content) {
                throw new Error(`Unexpected Ollama response shape: ${JSON.stringify(data)}`);
            }

            return data as { message: { content: string } };
        } catch (e) {
            if ((e as Error).name === "AbortError") {
                throw new Error(`Ollama request timed out after ${this.timeoutMs}ms`);
            }
            throw e;
        } finally {
            clearTimeout(timeout);
        }
    }
}