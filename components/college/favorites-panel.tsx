"use client";

import type { MatchResult } from "../../shared/types";

interface FavoritesPanelProps {
  matches: MatchResult[];
  favoriteIds: string[];
}

export function FavoritesPanel({ matches, favoriteIds }: FavoritesPanelProps) {
  const favorites = matches.filter((match) => favoriteIds.includes(match.college.id));

  return (
    <section className="side-panel">
      <h3>Favorites</h3>
      {!favorites.length ? (
        <p>Swipe right or save schools from the detail sheet to build your shortlist.</p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((match) => (
            <li key={match.college.id}>
              <strong>{match.college.name}</strong>
              <span>{Math.round(match.score * 100)}% match</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
