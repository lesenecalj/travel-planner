import { Router, Request, Response } from "express";
import { UserInputSchema, UserUpdateSchema } from "../types/user";
import { UserService } from "../services/user-service";
import { AuthService } from "../services/auth-service";
import { REFRESH_COOKIE_OPTIONS } from "../lib/cookie-options";
import { ForbiddenError, NotFoundError } from "../errors";
import { requireAuth } from "../middleware/require-auth";

const router = Router();
const service = new UserService();
const authService = new AuthService();

// public — registration
router.post("/", async (req: Request, res: Response) => {
  const data = UserInputSchema.parse(req.body);
  const user = await service.createUser(data);
  const { accessToken, refreshToken } = authService.generateTokens({ sub: user.id, email: user.email });
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({ accessToken });
});

router.get("/", requireAuth, (_req: Request, res: Response) => {
  res.json(service.listUsers());
});

router.get("/:id", requireAuth, (req: Request, res: Response) => {
  const user = service.getUser(req.params.id as string);
  if (!user) throw new NotFoundError("User not found");
  res.json(user);
});

router.patch("/:id", requireAuth, (req: Request, res: Response) => {
  if (req.auth.sub !== req.params.id) throw new ForbiddenError("Cannot modify another user's account");
  const data = UserUpdateSchema.parse(req.body);
  res.json(service.updateUser(req.params.id as string, data));
});

router.delete("/:id", requireAuth, (req: Request, res: Response) => {
  if (req.auth.sub !== req.params.id) throw new ForbiddenError("Cannot delete another user's account");
  const deleted = service.deleteUser(req.params.id as string);
  if (!deleted) throw new NotFoundError("User not found");
  res.json(deleted);
});

export default router;
