import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import tripRouter from "./routes/trip";
import { closeDb } from "./db/database";


const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/trips", tripRouter);

const server = app.listen(3001, () =>
  console.log("✅ Backend running on http://localhost:3001")
);

const shutdown = () => {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
