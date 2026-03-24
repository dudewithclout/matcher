import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { DEFAULT_PROFILE } from "../../shared/constants";
import { structuredProfileOutputSchema } from "../../shared/profile-schema";
import type { InterviewSession } from "../../shared/types";

const MODEL = "claude-opus-4-6";

const interviewerSystemPrompt = `You are a warm, insightful college counselor conducting a voice-first interview.
Your job is to sound like a real human advisor on a phone call.

Goals:
- Ask exactly one natural question at a time.
- Keep the conversation flowing naturally.
- Ask adaptive follow-up questions based on what the student just said.
- Gradually learn: majors, personality, ideal campus environment, size, location, budget, academic competitiveness, extracurriculars, social preferences, and career goals.
- Sound encouraging, concise, and conversational.
- Do not present yourself as a chatbot.
- Avoid bullet points, labels, or JSON.
- Usually respond in 2-5 sentences.
- If enough information has been gathered, warmly transition toward wrapping up the interview and preparing recommendations.`;

const extractorPrompt = `Extract and normalize the student's preferences from the running interview transcript.
Update the profile conservatively:
- keep existing information when still relevant
- only add details supported by the transcript
- do not hallucinate
- mark interviewComplete true only when most of these are meaningfully covered: academics, personality, environment, career, extracurriculars, budget, geography, competitiveness.
- summary should be a single short sentence about the student's current fit profile.`;

export class ClaudeService {
  private client: Anthropic | null;

  constructor() {
    this.client = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;
  }

  async streamInterviewReply(
    session: InterviewSession,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    if (!this.client) {
      const fallback = this.buildFallbackReply(session);
      onChunk(fallback);
      return fallback;
    }

    const transcript = session.transcript
      .slice(-12)
      .map((turn) => `${turn.role === "assistant" ? "Counselor" : "Student"}: ${turn.content}`)
      .join("\n");

    const stream = this.client.messages.stream({
      model: MODEL,
      max_tokens: 350,
      thinking: { type: "adaptive" },
      messages: [
        {
          role: "user",
          content: `Here is the recent interview transcript:\n${transcript}\n\nCurrent structured profile:\n${JSON.stringify(
            session.profile,
            null,
            2,
          )}\n\nCoverage map:\n${JSON.stringify(
            session.coverage,
            null,
            2,
          )}\n\nRespond as the counselor with the next thing you would say out loud.`,
        },
      ],
      system: interviewerSystemPrompt,
    });

    let text = "";

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        text += event.delta.text;
        onChunk(event.delta.text);
      }
    }

    return text.trim();
  }

  async extractProfile(session: InterviewSession) {
    if (!this.client) {
      return {
        profile: session.profile,
        coverage: session.coverage,
        interviewComplete: session.transcript.filter((turn) => turn.role === "user").length >= 6,
        summary: "A thoughtful student exploring fit, affordability, and campus vibe.",
      };
    }

    const transcript = session.transcript
      .map((turn) => `${turn.role === "assistant" ? "Counselor" : "Student"}: ${turn.content}`)
      .join("\n");

    const response = await this.client.messages.parse({
      model: MODEL,
      max_tokens: 900,
      thinking: { type: "adaptive" },
      system: extractorPrompt,
      messages: [
        {
          role: "user",
          content: `Existing profile:\n${JSON.stringify(session.profile ?? DEFAULT_PROFILE, null, 2)}\n\nExisting coverage:\n${JSON.stringify(
            session.coverage,
            null,
            2,
          )}\n\nFull transcript:\n${transcript}`,
        },
      ],
      output_config: {
        format: zodOutputFormat(structuredProfileOutputSchema),
      },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return {
        profile: session.profile,
        coverage: session.coverage,
        interviewComplete: session.interviewComplete,
        summary: "Profile extraction was unavailable, so the existing session data was kept.",
      };
    }

    return parsed;
  }

  private buildFallbackReply(session: InterviewSession) {
    const askedTurns = session.transcript.filter((turn) => turn.role === "user").length;
    if (askedTurns === 0) {
      return "Hey, I’m excited to help. To start, what kinds of subjects or majors are you most drawn to right now?";
    }
    if (!session.coverage.environment) {
      return "That gives me a strong academic picture. What kind of campus environment feels best for you — bigger city energy, a quieter suburban setting, or something more rural and close-knit?";
    }
    if (!session.coverage.budget) {
      return "Got it. And when you think about affordability, what kind of budget or price range feels realistic for you and your family?";
    }
    return "This is really helpful. Before I match you with schools, what kind of student life or community would make you feel most at home?";
  }
}

export const claudeService = new ClaudeService();
