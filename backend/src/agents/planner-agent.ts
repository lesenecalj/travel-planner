import { TripInput, TripPlan, TripPlanSchema, TripPlanJsonSchema } from "../types/trip";
import { LLMClient, Message } from "../llm/clients/llm-client";
import { createLLMClient } from "../llm";
import { PLANNER_SYSTEM_PROMPT } from "./planner.system";

const MAX_RETRIES = 1;

export class PlannerAgent {
  private llm: LLMClient;

  constructor(llm: LLMClient = createLLMClient()) {
    this.llm = llm;
  }

  async run(input: TripInput): Promise<TripPlan> {
    const messages: Message[] = [
      { role: "system", content: PLANNER_SYSTEM_PROMPT },
      { role: "user", content: this.buildPrompt(input) },
    ];

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const start = Date.now();
      try {
        const plan = await this.llm.chatStructured(messages, TripPlanSchema, TripPlanJsonSchema);
        console.log(`[PlannerAgent] success in ${Date.now() - start}ms (attempt ${attempt + 1})`);
        return plan;
      } catch (e) {
        lastError = e as Error;
        console.warn(`[PlannerAgent] attempt ${attempt + 1} failed after ${Date.now() - start}ms: ${lastError.message}`);
        if (attempt < MAX_RETRIES) {
          messages.push(
            { role: "assistant", content: "" },
            { role: "user", content: `Your previous response was invalid. Error: ${lastError.message}. Please try again and return only valid JSON.` }
          );
        }
      }
    }

    throw lastError;
  }

  private buildPrompt(input: TripInput): string {
    return `Generate a detailed trip plan for the following trip:
- Destination: ${input.destination}
- Duration: ${input.durationWeeks} week(s)
- Pace: ${input.pace}
- Interests: ${input.interests.join(", ")}`;
  }
}