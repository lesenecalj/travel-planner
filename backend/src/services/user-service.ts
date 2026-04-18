import bcrypt from "bcryptjs";
import { UserDto, UserRecord, UserInput, UserUpdateInput } from "../types/user";
import { UserRepository } from "../repositories/user-repository";
import { NotFoundError, ConflictError } from "../errors";

const BCRYPT_ROUNDS = 12;

function toUserDto({ passwordHash: _, ...dto }: UserRecord): UserDto {
  return dto;
}

export class UserService {
  private repo: UserRepository;

  constructor(repo: UserRepository = new UserRepository()) {
    this.repo = repo;
  }

  async createUser(input: UserInput): Promise<UserDto> {
    const existing = this.repo.findByEmail(input.email);
    if (existing) throw new ConflictError(`Email already in use: ${input.email}`);
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const { password: _, ...rest } = input;
    return toUserDto(this.repo.create({ ...rest, passwordHash }));
  }

  updateUser(id: string, updates: UserUpdateInput): UserDto {
    const existing = this.repo.findById(id);
    if (!existing) throw new NotFoundError(`User not found: ${id}`);

    if (updates.email && updates.email !== existing.email) {
      const conflict = this.repo.findByEmail(updates.email);
      if (conflict) throw new ConflictError(`Email already in use: ${updates.email}`);
    }

    return toUserDto(this.repo.update(id, updates));
  }

  getUser(id: string): UserDto | null {
    const record = this.repo.findById(id);
    return record ? toUserDto(record) : null;
  }

  listUsers(): UserDto[] {
    return this.repo.list().map(toUserDto);
  }

  deleteUser(id: string): UserDto | null {
    const record = this.repo.delete(id);
    return record ? toUserDto(record) : null;
  }
}

