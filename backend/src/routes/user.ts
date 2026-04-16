import { Router, Request, Response } from "express";
import { UserInputSchema, UserUpdateSchema } from "../types/user";
import { UserService } from "../services/user-service";
import { NotFoundError } from "../errors";

const router = Router();
const service = new UserService();

router.post("/", (req: Request, res: Response) => {
  const data = UserInputSchema.parse(req.body);
  res.status(201).json(service.createUser(data));
});

router.get("/", (_req: Request, res: Response) => {
  res.json(service.listUsers());
});

router.get("/:id", (req: Request, res: Response) => {
  const user = service.getUser(req.params.id as string);
  if (!user) throw new NotFoundError("User not found");
  res.json(user);
});

router.patch("/:id", (req: Request, res: Response) => {
  const data = UserUpdateSchema.parse(req.body);
  res.json(service.updateUser(req.params.id as string, data));
});

router.delete("/:id", (req: Request, res: Response) => {
  const deleted = service.deleteUser(req.params.id as string);
  if (!deleted) throw new NotFoundError("User not found");
  res.json(deleted);
});

export default router;
