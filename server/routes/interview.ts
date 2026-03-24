import { Router } from "express";

import { interviewSessionStore } from "../services/interview-session";
import { claudeService } from "../services/claude";
import { profileExtractorService } from "../services/profile-extractor";

const interviewRouter = Router();

interviewRouter.post("/start", async (_req, res, next) => {
  try {
    const session = interviewSessionStore.createSession();
    const openingPrompt = await claudeService.streamInterviewReply(session, () => undefined);
    interviewSessionStore.addTurn(session.id, "assistant", openingPrompt);
    const updatedSession = interviewSessionStore.getSession(session.id);

    res.json({
      session: updatedSession,
      openingPrompt,
    });
  } catch (error) {
    next(error);
  }
});

interviewRouter.post("/message", async (req, res, next) => {
  try {
    const { sessionId, message } = req.body as { sessionId?: string; message?: string };
    if (!sessionId || !message?.trim()) {
      res.status(400).json({ error: "sessionId and message are required." });
      return;
    }

    interviewSessionStore.addTurn(sessionId, "user", message.trim());
    const currentSession = interviewSessionStore.getSession(sessionId);
    if (!currentSession) {
      res.status(404).json({ error: "Interview session not found." });
      return;
    }

    const extracted = await profileExtractorService.updateSessionProfile(currentSession);
    const updatedSession = interviewSessionStore.updateProfile(
      sessionId,
      extracted.profile,
      extracted.coverage,
      extracted.interviewComplete,
    );

    const text = await claudeService.streamInterviewReply(updatedSession, () => undefined);
    const finalSession = interviewSessionStore.addTurn(sessionId, "assistant", text);

    res.json({ session: finalSession, text });
  } catch (error) {
    next(error);
  }
});

interviewRouter.get("/:sessionId", (req, res) => {
  const session = interviewSessionStore.getSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: "Interview session not found." });
    return;
  }

  res.json({ session });
});

export { interviewRouter };
