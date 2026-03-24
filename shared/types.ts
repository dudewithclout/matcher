import { z } from "zod";

export type SchoolSize = "small" | "medium" | "large" | "unsure";
export type SchoolSetting = "urban" | "suburban" | "rural";
export type BudgetRange =
  | "under_20000"
  | "20000_40000"
  | "40000_60000"
  | "60000_plus"
  | "flexible"
  | "unsure";
export type AcademicStrength =
  | "developing"
  | "solid"
  | "strong"
  | "elite"
  | "unsure";
export type SwipeDirection = "left" | "right";

export interface StructuredProfile {
  intended_majors: string[];
  personality_traits: string[];
  preferred_school_size: SchoolSize;
  preferred_setting: SchoolSetting | "unsure";
  location_preferences: string[];
  budget_range: BudgetRange;
  academic_strength: AcademicStrength;
  career_goals: string[];
  social_preferences: string[];
  extracurriculars: string[];
}

export interface InterviewCoverage {
  academics: boolean;
  personality: boolean;
  environment: boolean;
  career: boolean;
  extracurriculars: boolean;
  budget: boolean;
  geography: boolean;
  competitiveness: boolean;
}

export interface TranscriptTurn {
  role: "assistant" | "user";
  content: string;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  transcript: TranscriptTurn[];
  profile: StructuredProfile;
  coverage: InterviewCoverage;
  interviewComplete: boolean;
  recommendationWeights: MatchWeights;
  swipeHistory: SwipeFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface College {
  id: string;
  name: string;
  state: string;
  region: string;
  setting: SchoolSetting;
  size: Exclude<SchoolSize, "unsure">;
  acceptanceRate: number;
  estimatedCost: number;
  strongMajors: string[];
  campusCulture: string[];
  socialVibe: string[];
  studentLife: string;
  pros: string[];
  cons: string[];
  insiderTips: string[];
  careerOutcomes: string[];
  imageUrl: string;
  vibeSummary: string;
  tourUrl: string;
}

export interface MatchWeights {
  academic: number;
  cultural: number;
  admissions: number;
  financial: number;
  geography: number;
}

export interface MatchBreakdown {
  academic: number;
  cultural: number;
  admissions: number;
  financial: number;
  geography: number;
}

export interface MatchResult {
  college: College;
  score: number;
  breakdown: MatchBreakdown;
  admissionBucket: "reach" | "match" | "safety";
  whyItFits: string[];
}

export interface SwipeFeedback {
  collegeId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export interface StartInterviewResponse {
  session: InterviewSession;
  openingPrompt: string;
}

export interface InterviewMessageResponse {
  session: InterviewSession;
  text: string;
}

export interface MatchesResponse {
  session: InterviewSession;
  matches: MatchResult[];
}

export const profileSchema = z.object({
  intended_majors: z.array(z.string()).default([]),
  personality_traits: z.array(z.string()).default([]),
  preferred_school_size: z.enum(["small", "medium", "large", "unsure"]).default("unsure"),
  preferred_setting: z.enum(["urban", "suburban", "rural", "unsure"]).default("unsure"),
  location_preferences: z.array(z.string()).default([]),
  budget_range: z
    .enum(["under_20000", "20000_40000", "40000_60000", "60000_plus", "flexible", "unsure"])
    .default("unsure"),
  academic_strength: z.enum(["developing", "solid", "strong", "elite", "unsure"]).default("unsure"),
  career_goals: z.array(z.string()).default([]),
  social_preferences: z.array(z.string()).default([]),
  extracurriculars: z.array(z.string()).default([]),
});

export const coverageSchema = z.object({
  academics: z.boolean().default(false),
  personality: z.boolean().default(false),
  environment: z.boolean().default(false),
  career: z.boolean().default(false),
  extracurriculars: z.boolean().default(false),
  budget: z.boolean().default(false),
  geography: z.boolean().default(false),
  competitiveness: z.boolean().default(false),
});
