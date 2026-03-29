import { PlannerAgent } from "../agents/planner-agent";
import { TripInput } from "../types/trip";

export class TravelOrchestrator {
  private planner = new PlannerAgent();

  async createTrip(input: TripInput) {
    return this.planner.run(input);
  }
}
