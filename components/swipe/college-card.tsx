"use client";

import type { MatchResult } from "../../shared/types";

interface CollegeCardProps {
  match: MatchResult;
  onOpen: () => void;
}

export function CollegeCard({ match, onOpen }: CollegeCardProps) {
  return (
    <article className="college-card" onClick={onOpen}>
      <div className="college-card-image" style={{ backgroundImage: `linear-gradient(180deg, rgba(9,12,22,0.1), rgba(9,12,22,0.9)), url(${match.college.imageUrl})` }}>
        <div className="college-card-top">
          <span className="match-score">{Math.round(match.score * 100)}% Match</span>
          <span className="admission-pill">{match.admissionBucket}</span>
        </div>
        <div className="college-card-bottom">
          <h2>{match.college.name}</h2>
          <p>{match.college.vibeSummary}</p>
        </div>
      </div>
      <div className="college-card-meta">
        <span>{match.college.state}</span>
        <span>{match.college.size}</span>
        <span>${match.college.estimatedCost.toLocaleString()}</span>
      </div>
    </article>
  );
}
