"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GameCatalogEntry, GameReleaseStatus } from "@/lib/game-catalog";
import styles from "@/app/games/page.module.css";

type Filter = "all" | GameReleaseStatus;

export function GameLibrary({ games }: { games: readonly GameCatalogEntry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visibleGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return games.filter((game) => {
      const matchesStatus = filter === "all" || game.status === filter;
      const haystack = `${game.title} ${game.heading} ${game.description} ${game.genre} ${game.features.join(" ")}`.toLowerCase();
      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [filter, games, query]);

  return (
    <>
      <div className={styles.libraryControls} aria-label="Filter game library">
        <div className={styles.filterGroup} role="group" aria-label="Release status">
          {(["all", "playable", "preview"] as const).map((value) => (
            <button
              className={styles.filterButton}
              data-active={filter === value}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {value === "all" ? "All games" : value === "playable" ? "Playable now" : "Previews"}
            </button>
          ))}
        </div>
        <label className={styles.searchField}>
          <span className="visually-hidden">Search games</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search games or genres" type="search" />
        </label>
      </div>

      <p className={styles.resultCount} aria-live="polite">
        Showing {visibleGames.length} of {games.length} games
      </p>

      {visibleGames.length > 0 ? (
        <div className={styles.libraryGrid}>
          {visibleGames.map((game) => {
            const preview = game.status === "preview";
            return (
              <article className={styles.gameCard} key={game.slug}>
                <div className={`${styles.poster} ${game.posterStyle === "grid" ? styles.burnPoster : styles.budPoster}`}>
                  <div className={styles.posterTop}>
                    <span className={`${styles.status} ${preview ? styles.previewStatus : ""}`}>{preview ? "Development preview" : "Playable now"}</span>
                    <span className={styles.posterMeta}>{game.format}</span>
                  </div>
                  <div className={styles.posterTitle}>
                    <span>{game.strapline}</span>
                    <strong>{game.title}</strong>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3>{game.heading}</h3>
                  <p>{game.description}</p>
                  <div className={styles.tagRow} aria-label={`${game.title} features`}>
                    {game.features.map((feature) => <span className={styles.tag} key={feature}>{feature}</span>)}
                  </div>
                  <div className={styles.cardAction}>
                    <Link aria-label={game.actionAriaLabel} className={preview ? styles.secondaryAction : styles.primaryAction} href={`/games/${game.slug}`}>
                      {game.actionLabel}<span className={styles.actionArrow} aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No games match that search.</h3>
          <p>Clear the search or switch the release-status filter.</p>
          <button type="button" onClick={() => { setFilter("all"); setQuery(""); }}>Show every game</button>
        </div>
      )}
    </>
  );
}
