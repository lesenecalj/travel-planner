import { PlannerAgent } from "../agents/planner-agent";
import { TripInput, TripInputSchema, TripRecord, TripDto } from "../types/trip";
import { TripRepository } from "../repositories/trip-repository";
import { NotFoundError } from "../errors";

function toTripDto(record: TripRecord): TripDto {
  return record;
}

export class TripService {
  private planner = new PlannerAgent();
  private repo: TripRepository;

  constructor(repo: TripRepository = new TripRepository()) {
    this.repo = repo;
  }

  async createTrip(input: TripInput, userId: string): Promise<TripDto> {
    const plan = await this.planner.run(input);
    return toTripDto(this.repo.create(input, plan, userId));
  }

  async updateTrip(id: string, overrides: Partial<TripInput>): Promise<TripDto> {
    const existing = this.repo.findById(id);
    if (!existing) throw new NotFoundError(`Trip not found: ${id}`);
    const merged = TripInputSchema.parse({ ...existing.input, ...overrides });
    const plan = await this.planner.run(merged);
    return toTripDto(this.repo.update(id, merged, plan));
  }

  getTrip(id: string): TripDto | null {
    const record = this.repo.findById(id);
    return record ? toTripDto(record) : null;
  }

  listTrips(): TripDto[] {
    return this.repo.list().map(toTripDto);
  }

  listTripsByUser(userId: string): TripDto[] {
    return this.repo.listByUser(userId).map(toTripDto);
  }

  deleteTrip(id: string): TripDto | null {
    const record = this.repo.delete(id);
    return record ? toTripDto(record) : null;
  }
}

