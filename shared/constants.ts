import type { MatchWeights, StructuredProfile } from "./types";

export const DEFAULT_PROFILE: StructuredProfile = {
  intended_majors: [],
  personality_traits: [],
  preferred_school_size: "unsure",
  preferred_setting: "unsure",
  location_preferences: [],
  budget_range: "unsure",
  academic_strength: "unsure",
  career_goals: [],
  social_preferences: [],
  extracurriculars: [],
};

export const DEFAULT_COVERAGE = {
  academics: false,
  personality: false,
  environment: false,
  career: false,
  extracurriculars: false,
  budget: false,
  geography: false,
  competitiveness: false,
};

export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  academic: 0.3,
  cultural: 0.25,
  admissions: 0.15,
  financial: 0.15,
  geography: 0.15,
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787";
