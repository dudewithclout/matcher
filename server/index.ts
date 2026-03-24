import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { feedbackRouter } from "./routes/feedback";
import { interviewRouter } from "./routes/interview";
import { matchesRouter } from "./routes/matches";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/interview", interviewRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/feedback", feedbackRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown server error";
  console.error(error);
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`College Matcher API listening on http://localhost:${port}`);
});
