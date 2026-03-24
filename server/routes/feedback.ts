import { Router } from "express";

import { collegeRepository } from "../services/college-repository";
import { interviewSessionStore } from "../services/interview-session";
import { matcherService } from "../services/matcher";

const feedbackRouter = Router();

feedbackRouter.post("/swipe", (req, res) => {
  const { sessionId, collegeId, direction } = req.body as {
    sessionId?: string;
    collegeId?: string;
    direction?: "left" | "right";
  };

  if (!sessionId || !collegeId || !direction) {
    res.status(400).json({ error: "sessionId, collegeId, and direction are required." });
    return;
  }

  const session = interviewSessionStore.getSession(sessionId);
  if (!session) {
    res.status(404).json({ error: "Interview session not found." });
    return;
  }

  interviewSessionStore.recordSwipe(sessionId, collegeId, direction);

  const updatedSession = interviewSessionStore.getSession(sessionId)!;
  const result = matcherService.rankColleges(
    updatedSession.profile,
    collegeRepository.getAll(),
    updatedSession.recommendationWeights,
    updatedSession.swipeHistory,
  );

  updatedSession.recommendationWeights = result.weights;
  res.json({ session: updatedSession, matches: result.matches });
});

export { feedbackRouter };
