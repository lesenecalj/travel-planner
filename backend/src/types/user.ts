import { z } from "zod";

export const UserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export const UserUpdateSchema = UserInputSchema.partial();

export type UserInput = z.infer<typeof UserInputSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

export type StoredUser = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  email: string;
  name: string;
};
