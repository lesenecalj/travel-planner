import { Router, Request, Response } from "express";
import { z } from "zod";
import { TravelOrchestrator } from "../orchestrator/travel-orchestrator";

const router = Router();
const orchestrator = new TravelOrchestrator();

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
    const trip = await orchestrator.createTrip(parsed.data);
    res.json(trip);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
