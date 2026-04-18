import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { LoginSchema } from "../types/auth";
import { AuthService } from "../services/auth-service";
import { z } from "zod";

const router = Router();
const service = new AuthService();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

const RefreshSchema = z.object({ refreshToken: z.string().min(1) });

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  const input = LoginSchema.parse(req.body);
  const tokens = await service.login(input);
  res.json(tokens);
});

router.post("/refresh", authLimiter, (req: Request, res: Response) => {
  const { refreshToken } = RefreshSchema.parse(req.body);
  const tokens = service.refreshTokens(refreshToken);
  res.json(tokens);
});

export default router;
