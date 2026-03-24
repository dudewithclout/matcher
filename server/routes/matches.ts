import { Router } from "express";

import { collegeRepository } from "../services/college-repository";
import { interviewSessionStore } from "../services/interview-session";
import { matcherService } from "../services/matcher";
import { pdfExportService } from "../services/pdf-export";

const matchesRouter = Router();

matchesRouter.get("/:sessionId", (req, res) => {
  const session = interviewSessionStore.getSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: "Interview session not found." });
    return;
  }

  const result = matcherService.rankColleges(
    session.profile,
    collegeRepository.getAll(),
    session.recommendationWeights,
    session.swipeHistory,
  );

  session.recommendationWeights = result.weights;
  res.json({ session, matches: result.matches });
});

matchesRouter.get("/:sessionId/export", async (req, res, next) => {
  try {
    const session = interviewSessionStore.getSession(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: "Interview session not found." });
      return;
    }

    const result = matcherService.rankColleges(
      session.profile,
      collegeRepository.getAll(),
      session.recommendationWeights,
      session.swipeHistory,
    );

    const pdfBuffer = await pdfExportService.export(session.profile, result.matches);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="college-matcher-${session.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

export { matchesRouter };
