import { computeBreakdown, weightedScore } from "../../shared/match-scoring";
import type { College, MatchResult, MatchWeights, StructuredProfile, SwipeFeedback } from "../../shared/types";

const admissionBucket = (score: number): MatchResult["admissionBucket"] => {
  if (score >= 0.8) return "safety";
  if (score >= 0.58) return "match";
  return "reach";
};

const buildWhyItFits = (profile: StructuredProfile, college: College, score: number) => {
  const reasons: string[] = [];

  if (profile.intended_majors.length > 0) {
    const hit = profile.intended_majors.find((major) =>
      college.strongMajors.some((candidate) =>
        candidate.toLowerCase().includes(major.toLowerCase()) || major.toLowerCase().includes(candidate.toLowerCase()),
      ),
    );
    if (hit) {
      reasons.push(`Strong academic alignment for ${hit}.`);
    }
  }

  if (profile.preferred_setting !== "unsure" && profile.preferred_setting === college.setting) {
    reasons.push(`Matches your preference for a ${college.setting} campus setting.`);
  }

  if (profile.preferred_school_size !== "unsure" && profile.preferred_school_size === college.size) {
    reasons.push(`Fits your preferred ${college.size} school size.`);
  }

  if (profile.budget_range !== "unsure") {
    reasons.push(`Estimated cost is relatively compatible with your stated budget range.`);
  }

  if (!reasons.length) {
    reasons.push(`Strong overall fit based on your interests, environment preferences, and goals.`);
  }

  if (score > 0.8) {
    reasons.push(`This profile looks especially strong for you overall.`);
  }

  return reasons.slice(0, 3);
};

const rerankWeights = (weights: MatchWeights, swipeHistory: SwipeFeedback[], colleges: College[]) => {
  const updated = { ...weights };
  const rightSwipes = swipeHistory.filter((item) => item.direction === "right");
  const leftSwipes = swipeHistory.filter((item) => item.direction === "left");

  if (rightSwipes.length > leftSwipes.length) {
    updated.cultural = Math.min(0.35, updated.cultural + 0.04);
    updated.geography = Math.min(0.2, updated.geography + 0.02);
  }

  if (leftSwipes.length >= 3) {
    updated.admissions = Math.min(0.2, updated.admissions + 0.02);
    updated.financial = Math.min(0.22, updated.financial + 0.02);
  }

  const sum = Object.values(updated).reduce((total, value) => total + value, 0);
  if (sum !== 1) {
    (Object.keys(updated) as (keyof MatchWeights)[]).forEach((key) => {
      updated[key] = updated[key] / sum;
    });
  }

  return updated;
};

export class MatcherService {
  rankColleges(
    profile: StructuredProfile,
    colleges: College[],
    weights: MatchWeights,
    swipeHistory: SwipeFeedback[] = [],
  ): { matches: MatchResult[]; weights: MatchWeights } {
    const adjustedWeights = rerankWeights(weights, swipeHistory, colleges);

    const matches = colleges
      .map((college) => {
        const breakdown = computeBreakdown(profile, college);
        const score = weightedScore(breakdown, adjustedWeights);
        return {
          college,
          score,
          breakdown,
          admissionBucket: admissionBucket(breakdown.admissions),
          whyItFits: buildWhyItFits(profile, college, score),
        } satisfies MatchResult;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 24);

    return { matches, weights: adjustedWeights };
  }
}

export const matcherService = new MatcherService();
