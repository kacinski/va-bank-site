type LeaderboardRow = {
  rank: number;
  team: string;
  total: number;
  [key: string]: number | string | null;
};

function stripHtml(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "").trim();
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[]> {
  try {
    const res = await fetch("https://www.brain-games.club/leaderboard", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();

    // Count game columns from hrefs in thead
    const gameLinks = [
      ...html.matchAll(/href="\/events\/game-no-\d+"/g),
    ].length;

    const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/);
    if (!tbodyMatch) return [];

    const rowMatches =
      tbodyMatch[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? [];

    const rawRows = rowMatches
      .map((row) =>
        [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
          stripHtml(m[1])
        )
      )
      .filter((cells) => cells.length > 0);

    // Only include game columns that have at least one real value (not all "—")
    const activeIndices: number[] = [];
    for (let i = 0; i < gameLinks; i++) {
      const hasData = rawRows.some((row) => {
        const val = row[2 + i];
        return val !== undefined && val !== "—" && val !== "";
      });
      if (hasData) activeIndices.push(i);
    }

    return rawRows.map((cells) => {
      const team = cells[1] ?? "";
      const rank = parseInt(cells[cells.length - 1] ?? "0") || 0;
      const total = parseInt(cells[cells.length - 2] ?? "0") || 0;

      const gameScores: Record<string, number | null> = {};
      activeIndices.forEach((colIdx, i) => {
        const val = cells[2 + colIdx];
        gameScores[`game${i + 1}`] =
          !val || val === "—" ? null : parseInt(val);
      });

      return { rank, team, total, ...gameScores };
    });
  } catch {
    return [];
  }
}
