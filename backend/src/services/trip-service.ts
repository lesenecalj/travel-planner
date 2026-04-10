import { PlannerAgent } from "../agents/planner-agent";
import { TripInput, TripInputSchema, StoredTrip } from "../types/trip";
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

  async updateTrip(id: string, overrides: Partial<TripInput>): Promise<StoredTrip> {
    const existing = this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Trip not found: ${id}`);
    const merged = TripInputSchema.parse({ ...existing.input, ...overrides });
    const plan = await this.planner.run(merged);
    return this.repo.update(id, merged, plan);
  }

  getTrip(id: string): StoredTrip | null {
    return this.repo.findById(id);
  }

  listTrips(): StoredTrip[] {
    return this.repo.list();
  }

  deleteTrip(id: string): StoredTrip | null {
    return this.repo.delete(id);
  }
}

export class NotFoundError extends Error {}
