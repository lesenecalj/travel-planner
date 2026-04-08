import { Router, Request, Response } from "express";
import { z } from "zod";
import { TripService } from "../services/trip-service";

const router = Router();
const service = new TripService();

const TripInputSchema = z.object({
  destination: z.string().min(1),
  durationWeeks: z.number().int().min(1).max(8),
  pace: z.enum(["slow", "normal", "fast"]),
  interests: z.array(z.string()).min(1),
});

router.post("/", async (req: Request, res: Response) => {
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

router.put("/:id", async (req: Request, res: Response) => {
  const body = req.body as { label?: string } & Partial<z.infer<typeof TripInputSchema>>;
  const latest = service.getTrip(req.params.id as string);
  if (!latest) { res.status(404).json({ error: "Trip not found" }); return; }
  const parsed = TripInputSchema.safeParse({ ...latest.input, ...body });
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  try {
    const updated = await service.updateTrip(req.params.id as string, parsed.data, body.label);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});


export default router;
