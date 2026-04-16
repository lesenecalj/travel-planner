import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { TripInputSchema } from "../types/trip";
import { TripService } from "../services/trip-service";
import { NotFoundError } from "../errors";

const router = Router();
const service = new TripService();

const llmLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const TripUpdateSchema = TripInputSchema.omit({ label: true }).partial();
const CreateTripBodySchema = TripInputSchema.extend({ userId: z.string().uuid() });
const ListTripsQuerySchema = z.object({ userId: z.string().uuid().optional() });

router.post("/", llmLimiter, async (req: Request, res: Response) => {
  const { userId, ...input } = CreateTripBodySchema.parse(req.body);
  const trip = await service.createTrip(input, userId);
  res.status(201).json(trip);
});

router.get("/", (req: Request, res: Response) => {
  const { userId } = ListTripsQuerySchema.parse(req.query);
  res.json(userId ? service.listTripsByUser(userId) : service.listTrips());
});

router.get("/:id", (req: Request, res: Response) => {
  const trip = service.getTrip(req.params.id as string);
  if (!trip) throw new NotFoundError("Trip not found");
  res.json(trip);
});

router.put("/:id", llmLimiter, async (req: Request, res: Response) => {
  const body = TripUpdateSchema.parse(req.body);
  const updated = await service.updateTrip(req.params.id as string, body);
  res.json(updated);
});

router.delete("/:id", (req: Request, res: Response) => {
  const deleted = service.deleteTrip(req.params.id as string);
  if (!deleted) throw new NotFoundError("Trip not found");
  res.json(deleted);
});

export default router;
