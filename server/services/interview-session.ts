import { v4 as uuidv4 } from "uuid";

import { DEFAULT_COVERAGE, DEFAULT_MATCH_WEIGHTS, DEFAULT_PROFILE } from "../../shared/constants";
import type { InterviewSession, StructuredProfile, TranscriptTurn } from "../../shared/types";

class InterviewSessionStore {
  private sessions = new Map<string, InterviewSession>();

  createSession() {
    const now = new Date().toISOString();
    const session: InterviewSession = {
      id: uuidv4(),
      transcript: [],
      profile: { ...DEFAULT_PROFILE },
      coverage: { ...DEFAULT_COVERAGE },
      interviewComplete: false,
      recommendationWeights: { ...DEFAULT_MATCH_WEIGHTS },
      swipeHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string) {
    return this.sessions.get(id) ?? null;
  }

  addTurn(id: string, role: TranscriptTurn["role"], content: string) {
    const session = this.requireSession(id);
    session.transcript.push({ role, content, createdAt: new Date().toISOString() });
    session.updatedAt = new Date().toISOString();
    return session;
  }

  updateProfile(id: string, profile: StructuredProfile, coverage: InterviewSession["coverage"], interviewComplete: boolean) {
    const session = this.requireSession(id);
    session.profile = profile;
    session.coverage = coverage;
    session.interviewComplete = interviewComplete;
    session.updatedAt = new Date().toISOString();
    return session;
  }

  recordSwipe(id: string, collegeId: string, direction: "left" | "right") {
    const session = this.requireSession(id);
    session.swipeHistory.push({ collegeId, direction, createdAt: new Date().toISOString() });
    session.updatedAt = new Date().toISOString();
    return session;
  }

  private requireSession(id: string) {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session not found: ${id}`);
    }
    return session;
  }
}

export const interviewSessionStore = new InterviewSessionStore();
