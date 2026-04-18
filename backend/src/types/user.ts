import { z } from "zod";

export const UserInputSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

export const UserUpdateSchema = UserInputSchema.omit({ password: true }).partial();

export type UserInput = z.infer<typeof UserInputSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type CreateUserRecord = Omit<UserInput, "password"> & { passwordHash: string };

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt?: string;
};

export type UserDto = Omit<UserRecord, "passwordHash">;
