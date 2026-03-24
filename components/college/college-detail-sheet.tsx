"use client";

import type { MatchResult } from "../../shared/types";

interface CollegeDetailSheetProps {
  match: MatchResult | null;
  onClose: () => void;
  onToggleFavorite: (collegeId: string) => void;
  isFavorite: boolean;
  onToggleCompare: (collegeId: string) => void;
  inCompare: boolean;
}

export function CollegeDetailSheet({
  match,
  onClose,
  onToggleFavorite,
  isFavorite,
  onToggleCompare,
  inCompare,
}: CollegeDetailSheetProps) {
  if (!match) return null;

  return (
    <aside className="detail-sheet">
      <button className="sheet-close" onClick={onClose}>
        Close
      </button>
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(7, 10, 20, 0.1), rgba(7, 10, 20, 0.9)), url(${match.college.imageUrl})` }}>
        <span className="match-score">{Math.round(match.score * 100)}% Match</span>
        <h2>{match.college.name}</h2>
        <p>{match.college.vibeSummary}</p>
      </div>

      <div className="detail-content">
        <div className="detail-actions">
          <button onClick={() => onToggleFavorite(match.college.id)}>{isFavorite ? "Remove Favorite" : "Save Favorite"}</button>
          <button onClick={() => onToggleCompare(match.college.id)}>{inCompare ? "Remove Compare" : "Add Compare"}</button>
        </div>

        <section>
          <h3>Why this school fits you</h3>
          <ul>
            {match.whyItFits.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Snapshot</h3>
          <p>{match.college.studentLife}</p>
          <div className="chip-row">
            {match.college.strongMajors.map((major) => (
              <span className="chip" key={major}>{major}</span>
            ))}
          </div>
        </section>

        <section>
          <h3>Pros</h3>
          <ul>
            {match.college.pros.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Cons</h3>
          <ul>
            {match.college.cons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Insider tips</h3>
          <ul>
            {match.college.insiderTips.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Campus tour</h3>
          <div className="video-frame">
            <iframe
              src={match.college.tourUrl}
              title={`${match.college.name} campus tour`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </aside>
  );
}
