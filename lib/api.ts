import type { MatchesResponse, StartInterviewResponse, InterviewMessageResponse, SwipeDirection } from "../shared/types";
import { API_BASE_URL } from "../shared/constants";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  startInterview() {
    return requestJson<StartInterviewResponse>("/api/interview/start", { method: "POST" });
  },
  sendInterviewMessage(sessionId: string, message: string) {
    return requestJson<InterviewMessageResponse>("/api/interview/message", {
      method: "POST",
      body: JSON.stringify({ sessionId, message }),
    });
  },
  getMatches(sessionId: string) {
    return requestJson<MatchesResponse>(`/api/matches/${sessionId}`);
  },
  sendSwipe(sessionId: string, collegeId: string, direction: SwipeDirection) {
    return requestJson<MatchesResponse>("/api/feedback/swipe", {
      method: "POST",
      body: JSON.stringify({ sessionId, collegeId, direction }),
    });
  },
  getExportUrl(sessionId: string) {
    return `${API_BASE_URL}/api/matches/${sessionId}/export`;
  },
};
