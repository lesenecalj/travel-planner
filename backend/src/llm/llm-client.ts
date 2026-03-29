import { ZodType } from "zod";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMClient {
  chatStructured<T>(messages: Message[], schema: ZodType<T>, jsonSchema: object): Promise<T>;
}

