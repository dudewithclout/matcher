import type { College, MatchBreakdown, MatchWeights, StructuredProfile } from "./types";

const majorMatchScore = (profile: StructuredProfile, college: College) => {
  if (!profile.intended_majors.length) return 0.5;
  const normalizedMajors = college.strongMajors.map((major) => major.toLowerCase());
  const hits = profile.intended_majors.filter((major) =>
    normalizedMajors.some((candidate) => candidate.includes(major.toLowerCase()) || major.toLowerCase().includes(candidate)),
  );
  return Math.min(1, hits.length / Math.max(1, profile.intended_majors.length));
};

const sizeScore = (profile: StructuredProfile, college: College) => {
  if (profile.preferred_school_size === "unsure") return 0.5;
  return profile.preferred_school_size === college.size ? 1 : 0.35;
};

const settingScore = (profile: StructuredProfile, college: College) => {
  if (profile.preferred_setting === "unsure") return 0.5;
  return profile.preferred_setting === college.setting ? 1 : 0.3;
};

const locationScore = (profile: StructuredProfile, college: College) => {
  if (!profile.location_preferences.length) return 0.5;
  const needles = profile.location_preferences.map((value) => value.toLowerCase());
  const haystack = [college.state, college.region, college.setting].map((value) => value.toLowerCase());
  const matches = needles.filter((needle) => haystack.some((entry) => entry.includes(needle) || needle.includes(entry)));
  return Math.min(1, matches.length / Math.max(1, Math.min(needles.length, 2)));
};

const budgetScore = (profile: StructuredProfile, college: College) => {
  switch (profile.budget_range) {
    case "under_20000":
      return college.estimatedCost <= 20000 ? 1 : 0.2;
    case "20000_40000":
      return college.estimatedCost <= 40000 ? 1 : 0.45;
    case "40000_60000":
      return college.estimatedCost <= 60000 ? 1 : 0.65;
    case "60000_plus":
    case "flexible":
      return 0.9;
    default:
      return 0.5;
  }
};

const academicStrengthScore = (profile: StructuredProfile, college: College) => {
  const admitRate = college.acceptanceRate;
  switch (profile.academic_strength) {
    case "elite":
      return admitRate < 0.2 ? 0.9 : 0.75;
    case "strong":
      return admitRate <= 0.45 ? 0.85 : 0.7;
    case "solid":
      return admitRate <= 0.65 ? 0.85 : 0.65;
    case "developing":
      return admitRate >= 0.45 ? 0.9 : 0.4;
    default:
      return 0.6;
  }
};

export const computeBreakdown = (
  profile: StructuredProfile,
  college: College,
): MatchBreakdown => {
  const academic = (majorMatchScore(profile, college) * 0.7) + (academicStrengthScore(profile, college) * 0.3);
  const cultural = (sizeScore(profile, college) * 0.35) + (settingScore(profile, college) * 0.35) + 0.3;
  const admissions = academicStrengthScore(profile, college);
  const financial = budgetScore(profile, college);
  const geography = locationScore(profile, college);

  return { academic, cultural, admissions, financial, geography };
};

export const weightedScore = (breakdown: MatchBreakdown, weights: MatchWeights) =>
  (breakdown.academic * weights.academic) +
  (breakdown.cultural * weights.cultural) +
  (breakdown.admissions * weights.admissions) +
  (breakdown.financial * weights.financial) +
  (breakdown.geography * weights.geography);
