import { PlannerAgent } from "../agents/planner-agent";
import { TripInput, StoredTrip } from "../types/trip";
import { TripRepository } from "../repositories/trip-repository";

export class TripService {
  private planner = new PlannerAgent();
  private repo: TripRepository;

  constructor(repo: TripRepository = new TripRepository()) {
    this.repo = repo;
  }

  async createTrip(input: TripInput): Promise<StoredTrip> {
    const plan = await this.planner.run(input);
    return this.repo.create(input, plan);
  }

  async updateTrip(id: string, input: TripInput, label?: string): Promise<StoredTrip> {
    const plan = await this.planner.run(input);
    return this.repo.update(id, input, plan, label);
  }

  getTrip(id: string): StoredTrip | null {
    return this.repo.findById(id);
  }

  listTrips(): StoredTrip[] {
    return this.repo.list();
  }
}
