import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { TripInputSchema } from "../types/trip";
import { TripService, NotFoundError } from "../services/trip-service";

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

router.post("/", llmLimiter, async (req: Request, res: Response) => {
  const parsed = TripInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const trip = await service.createTrip(parsed.data);
    res.status(201).json(trip);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/", (_req: Request, res: Response) => {
  try {
    res.json(service.listTrips());
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/:id", (req: Request, res: Response) => {
  try {
    const trip = service.getTrip(req.params.id as string);
    if (!trip) { res.status(404).json({ error: "Trip not found" }); return; }
    res.json(trip);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.put("/:id", llmLimiter, async (req: Request, res: Response) => {
  const bodyParsed = TripUpdateSchema.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.flatten() }); return; }
  try {
    const updated = await service.updateTrip(req.params.id as string, bodyParsed.data);
    res.json(updated);
  } catch (e) {
    if (e instanceof NotFoundError) { res.status(404).json({ error: e.message }); return; }
    res.status(500).json({ error: (e as Error).message });
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  try {
    const deleted = service.deleteTrip(req.params.id as string);
    if (!deleted) { res.status(404).json({ error: "Trip not found" }); return; }
    res.json(deleted);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
