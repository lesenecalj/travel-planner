import express from "express";
import cors from "cors";
import tripRouter from "./routes/trip";
import { closeDb } from "./db/database";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/trips", tripRouter);

const server = app.listen(3001, () =>
  console.log("✅ Backend running on http://localhost:3001")
);

process.on("SIGTERM", () => {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
});
