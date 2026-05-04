import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { TripInputSchema } from "../types/trip";
import { TripService } from "../services/trip-service";
import { ForbiddenError, NotFoundError } from "../errors";

const router = Router();
const service = new TripService();

const llmLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

router.post("/", llmLimiter, async (req: Request, res: Response) => {
  const input = TripInputSchema.parse(req.body);
  const trip = await service.createTrip(input, req.auth.sub);
  res.status(201).json(trip);
});

router.get("/", (req: Request, res: Response) => {
  res.json(service.listTripsByUser(req.auth.sub));
});

router.get("/:id", (req: Request, res: Response) => {
  const trip = service.getTrip(req.params.id as string);
  if (!trip) throw new NotFoundError("Trip not found");
  if (!trip.isPublic && trip.userId !== req.auth.sub) throw new ForbiddenError("Access denied");
  res.json(trip);
});

router.put("/:id", llmLimiter, async (req: Request, res: Response) => {
  const trip = service.getTrip(req.params.id as string);
  if (!trip) throw new NotFoundError("Trip not found");
  if (trip.userId !== req.auth.sub) throw new ForbiddenError("Access denied");
  const body = TripInputSchema.parse(req.body);
  const updated = await service.updateTrip(req.params.id as string, body);
  res.json(updated);
});

router.delete("/:id", (req: Request, res: Response) => {
  const trip = service.getTrip(req.params.id as string);
  if (!trip) throw new NotFoundError("Trip not found");
  if (trip.userId !== req.auth.sub) throw new ForbiddenError("Access denied");
  const deleted = service.deleteTrip(req.params.id as string);
  res.json(deleted);
});

export default router;
