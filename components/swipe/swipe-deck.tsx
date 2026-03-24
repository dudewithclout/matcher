"use client";

import { useMemo, useState } from "react";

import type { MatchResult } from "../../shared/types";
import { CollegeCard } from "./college-card";

interface SwipeDeckProps {
  matches: MatchResult[];
  onSwipe: (collegeId: string, direction: "left" | "right") => Promise<void>;
  onSelect: (match: MatchResult) => void;
}

export function SwipeDeck({ matches, onSwipe, onSelect }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const activeMatches = useMemo(() => matches.slice(index, index + 3), [index, matches]);

  const handleSwipe = async (direction: "left" | "right") => {
    const current = matches[index];
    if (!current) return;
    await onSwipe(current.college.id, direction);
    setIndex((value) => value + 1);
  };

  if (!matches.length || !activeMatches.length) {
    return <div className="empty-state">You’ve reviewed all current matches.</div>;
  }

  return (
    <div className="swipe-deck-shell">
      <div className="swipe-stack">
        {activeMatches
          .slice()
          .reverse()
          .map((match, stackIndex) => (
            <div
              key={match.college.id}
              className="stack-layer"
              style={{ transform: `translateY(${stackIndex * 10}px) scale(${1 - stackIndex * 0.04})` }}
            >
              <CollegeCard match={match} onOpen={() => onSelect(match)} />
            </div>
          ))}
      </div>

      <div className="swipe-actions">
        <button className="swipe-button swipe-left" onClick={() => handleSwipe("left")}>
          Skip
        </button>
        <button className="swipe-button swipe-right" onClick={() => handleSwipe("right")}>
          Interested
        </button>
      </div>
    </div>
  );
}
