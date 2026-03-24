"use client";

import type { MatchResult } from "../../shared/types";

interface ComparePanelProps {
  matches: MatchResult[];
  compareIds: string[];
}

export function ComparePanel({ matches, compareIds }: ComparePanelProps) {
  const compared = matches.filter((match) => compareIds.includes(match.college.id)).slice(0, 3);

  if (!compared.length) {
    return (
      <section className="side-panel">
        <h3>Compare</h3>
        <p>Select up to three schools to compare them side-by-side.</p>
      </section>
    );
  }

  return (
    <section className="side-panel">
      <h3>Compare</h3>
      <div className="compare-grid">
        {compared.map((match) => (
          <article className="compare-card" key={match.college.id}>
            <h4>{match.college.name}</h4>
            <p>{Math.round(match.score * 100)}% match</p>
            <p>{match.college.setting} · {match.college.size}</p>
            <p>${match.college.estimatedCost.toLocaleString()}</p>
            <p>{match.college.vibeSummary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
