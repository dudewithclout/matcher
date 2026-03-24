"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ComparePanel } from "../../components/college/compare-panel";
import { CollegeDetailSheet } from "../../components/college/college-detail-sheet";
import { FavoritesPanel } from "../../components/college/favorites-panel";
import { SwipeDeck } from "../../components/swipe/swipe-deck";
import { api } from "../../lib/api";
import type { MatchResult } from "../../shared/types";

function ResultsContent() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selected, setSelected] = useState<MatchResult | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("Missing interview session. Start the interview first.");
      return;
    }

    api
      .getMatches(sessionId)
      .then((response) => {
        setMatches(response.matches);
        setSelected(response.matches[0] ?? null);
      })
      .catch((caughtError) => setError(caughtError instanceof Error ? caughtError.message : "Failed to load matches."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const topSummary = useMemo(() => matches.slice(0, 3), [matches]);

  const handleSwipe = async (collegeId: string, direction: "left" | "right") => {
    if (!sessionId) return;
    const response = await api.sendSwipe(sessionId, collegeId, direction);
    setMatches(response.matches);
    if (direction === "right") {
      setFavoriteIds((current) => (current.includes(collegeId) ? current : [...current, collegeId]));
    }
  };

  const toggleFavorite = (collegeId: string) => {
    setFavoriteIds((current) =>
      current.includes(collegeId) ? current.filter((item) => item !== collegeId) : [...current, collegeId],
    );
  };

  const toggleCompare = (collegeId: string) => {
    setCompareIds((current) => {
      if (current.includes(collegeId)) {
        return current.filter((item) => item !== collegeId);
      }
      return [...current, collegeId].slice(-3);
    });
  };

  if (loading) {
    return <main className="results-shell"><p>Loading your matches...</p></main>;
  }

  if (error) {
    return <main className="results-shell"><p className="warning">{error}</p></main>;
  }

  return (
    <main className="results-shell">
      <section className="results-hero">
        <div>
          <p className="eyebrow">Top college matches</p>
          <h1>Swipe through your best-fit schools</h1>
          <p className="subtle">
            Your recommendations update as you like or skip schools, so the deck gets smarter in real time.
          </p>
        </div>
        {sessionId && (
          <a className="secondary-button" href={api.getExportUrl(sessionId)} target="_blank" rel="noreferrer">
            Export PDF
          </a>
        )}
      </section>

      <section className="top-summary-grid">
        {topSummary.map((match) => (
          <article key={match.college.id} className="summary-card">
            <span className="match-score">{Math.round(match.score * 100)}%</span>
            <h2>{match.college.name}</h2>
            <p>{match.college.vibeSummary}</p>
          </article>
        ))}
      </section>

      <section className="results-grid">
        <SwipeDeck matches={matches} onSwipe={handleSwipe} onSelect={setSelected} />
        <div className="results-sidebars">
          <FavoritesPanel matches={matches} favoriteIds={favoriteIds} />
          <ComparePanel matches={matches} compareIds={compareIds} />
        </div>
      </section>

      <CollegeDetailSheet
        match={selected}
        onClose={() => setSelected(null)}
        onToggleFavorite={toggleFavorite}
        isFavorite={selected ? favoriteIds.includes(selected.college.id) : false}
        onToggleCompare={toggleCompare}
        inCompare={selected ? compareIds.includes(selected.college.id) : false}
      />
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<main className="results-shell"><p>Loading your matches...</p></main>}>
      <ResultsContent />
    </Suspense>
  );
}
