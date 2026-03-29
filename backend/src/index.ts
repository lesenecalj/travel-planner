import express from "express";
import cors from "cors";
import tripRouter from "./routes/trip";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use("/trip", tripRouter);

app.listen(3001, () =>
  console.log("✅ Backend running on http://localhost:3001")
);
