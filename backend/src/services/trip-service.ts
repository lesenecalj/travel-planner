import { PlannerAgent } from "../agents/planner-agent";
import { TripInput, TripInputSchema, StoredTrip } from "../types/trip";
import { TripRepository } from "../repositories/trip-repository";
import { NotFoundError } from "../errors";

export class TripService {
  private planner = new PlannerAgent();
  private repo: TripRepository;

  constructor(repo: TripRepository = new TripRepository()) {
    this.repo = repo;
  }

  async createTrip(input: TripInput, userId: string): Promise<StoredTrip> {
    const plan = await this.planner.run(input);
    return this.repo.create(input, plan, userId);
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

  listTripsByUser(userId: string): StoredTrip[] {
    return this.repo.listByUser(userId);
  }

  deleteTrip(id: string): StoredTrip | null {
    return this.repo.delete(id);
  }
}

