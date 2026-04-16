import { StoredUser, UserInput, UserUpdateInput } from "../types/user";
import { UserRepository } from "../repositories/user-repository";
import { NotFoundError, ConflictError } from "../errors";

export class UserService {
  private repo: UserRepository;

  constructor(repo: UserRepository = new UserRepository()) {
    this.repo = repo;
  }

  createUser(input: UserInput): StoredUser {
    const existing = this.repo.findByEmail(input.email);
    if (existing) throw new ConflictError(`Email already in use: ${input.email}`);
    return this.repo.create(input);
  }

  updateUser(id: string, updates: UserUpdateInput): StoredUser {
    const existing = this.repo.findById(id);
    if (!existing) throw new NotFoundError(`User not found: ${id}`);

    if (updates.email && updates.email !== existing.email) {
      const conflict = this.repo.findByEmail(updates.email);
      if (conflict) throw new ConflictError(`Email already in use: ${updates.email}`);
    }

    return this.repo.update(id, updates);
  }

  getUser(id: string): StoredUser | null {
    return this.repo.findById(id);
  }

  listUsers(): StoredUser[] {
    return this.repo.list();
  }

  deleteUser(id: string): StoredUser | null {
    return this.repo.delete(id);
  }
}

