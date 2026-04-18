import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtPayload = {
  sub: string;  // userId
  email: string;
};