import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { LoginSchema } from "../types/auth";
import { AuthService } from "../services/auth-service";
import { REFRESH_COOKIE_OPTIONS } from "../lib/cookie-options";
import { UnauthorizedError } from "../errors";

const router = Router();
const service = new AuthService();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

router.post("/login", authLimiter, async (req: Request, res: Response) => {
  const input = LoginSchema.parse(req.body);
  const { accessToken, refreshToken } = await service.login(input);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ accessToken });
});

router.post("/refresh", authLimiter, (req: Request, res: Response) => {
  const refreshToken: string | undefined = req.cookies?.refreshToken;
  if (!refreshToken) throw new UnauthorizedError("Missing refresh token");
  const { accessToken, refreshToken: newRefreshToken } = service.refreshTokens(refreshToken);
  res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ accessToken });
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", { path: "/auth" });
  res.status(204).send();
});

export default router;
