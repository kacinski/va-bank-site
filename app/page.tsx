import { promises as fs } from "fs";
import path from "path";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// SVG mask for deckled edge
const DeckledMask = () => (
  <svg width="0" height="0">
    <defs>
      <mask id="deckle" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
        <rect x="0" y="0" width="1" height="1" fill="white" />
        <path d="M0,0 Q0.02,0.04 0.04,0 Q0.08,0.06 0.12,0 Q0.16,0.04 0.2,0 Q0.24,0.06 0.28,0 Q0.32,0.04 0.36,0 Q0.4,0.06 0.44,0 Q0.48,0.04 0.52,0 Q0.56,0.06 0.6,0 Q0.64,0.04 0.68,0 Q0.72,0.06 0.76,0 Q0.8,0.04 0.84,0 Q0.88,0.06 0.92,0 Q0.96,0.04 1,0 V1 Q0.96,0.96 0.92,1 Q0.88,0.94 0.84,1 Q0.8,0.96 0.76,1 Q0.72,0.94 0.68,1 Q0.64,0.96 0.6,1 Q0.56,0.94 0.52,1 Q0.48,0.96 0.44,1 Q0.4,0.94 0.36,1 Q0.32,0.96 0.28,1 Q0.24,0.94 0.2,1 Q0.16,0.96 0.12,1 Q0.08,0.94 0.04,1 Q0.02,0.96 0,1 Z" fill="black" />
      </mask>
    </defs>
  </svg>
);

async function getGamesData() {
  const filePath = path.join(process.cwd(), "data/games.json");
  const file = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(file);
  return {
    upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
    results: typeof data.results === "object" && data.results !== null ? data.results : {},
  };
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getRandomFactWithTranslation() {
  try {
    const res = await fetchWithTimeout(
      "https://uselessfacts.jsph.pl/random.json?language=en",
      {
        next: { revalidate: 900 },
      },
      1200
    );
    if (!res.ok) throw new Error("Failed to fetch fact");
    const data = await res.json() as { text?: string };
    const original = data.text || "Факт не найден.";
    let translated = "";
    try {
      const tr = await fetchWithTimeout(
        "https://libretranslate.de/translate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: original, source: "en", target: "ru", format: "text" }),
        },
        1200
      );
      if (tr.ok) {
        const trData = await tr.json() as { translatedText?: string };
        translated = trData.translatedText || "";
      }
    } catch {}
    return { original, translated };
  } catch {
    return { original: "Не удалось загрузить исторический факт.", translated: "" };
  }
}

export default async function HomePage() {
  const [{ upcoming, results }, factObj] = await Promise.all([
    getGamesData(),
    getRandomFactWithTranslation()
  ]);

  // If results is an array (new format), extract game numbers dynamically
  const gameNumbers = Array.isArray(results) && results.length > 0
    ? Object.keys(results[0]).filter(k => k.startsWith("game"))
    : [];

  // URL to your muted, sepia-toned, cluttered newspaper background image
  const backgroundUrl = "/cluttered-newspapers.jpg";

  return (
    <>
      {/* Muted, sepia, blurred, cluttered newspaper background */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 w-full h-full"
        style={{
          backgroundImage: `url('${backgroundUrl}')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          filter: 'sepia(0.7) brightness(0.85) blur(1px)',
          opacity: 1,
        }}
      />
      {/* Paper grain overlay for all layers */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          opacity: 0.18,
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' fill=\'none\'><filter id=\'n\' x=\'0\' y=\'0\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>')",
          backgroundSize: '220px 220px',
          mixBlendMode: 'multiply',
        }}
      />
      <main className="relative flex min-h-screen w-full items-start justify-center px-3 py-6 sm:px-4 md:py-10">
        <div className="relative mx-auto w-full max-w-4xl overflow-hidden bg-[#F4F1E1] px-4 py-8 text-[#2C2416] shadow-[15px_15px_0px_rgba(44,36,22,0.15)] sm:px-6 md:border-[6px] md:border-double md:border-[#2C2416] md:px-10 md:py-12 lg:px-16">
          {/* Decorative Header */}
          <section className="text-center mb-8">
            {/* --- NEW GRID HEADER --- */}
            {(() => {
              // Tsarist-style months
              const months = [
                "января", "февраля", "марта", "апрѣля", "мая", "іюнѧ", "іюля", "августа", "сентября", "октября", "ноября", "декабря"
              ];
              const now = new Date();
              const day = now.getDate();
              const month = months[now.getMonth()];
              const year = now.getFullYear();
              const datelineCity = `Кішиневъ`;
              const datelineDate = `${day} ${month} ${year} г.`;
              return (
                <div className="mb-2 grid w-full grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr] md:gap-4">
                  {/* Left: Logo */}
                  <div className="flex justify-center md:justify-start">
                    <img
                      src="/images/bessarabskie-vedomosti.png"
                      alt="Бессарабскія Вѣдомости"
                      className="mx-auto h-24 w-auto max-w-full object-contain sm:h-28 md:mx-0 md:h-32 md:max-w-xs"
                    />
                  </div>
                  {/* Center: Title */}
                  <div className="flex justify-center">
                    <h1 className="text-center font-heading text-3xl font-bold tracking-[0.14em] text-balance sm:text-4xl md:text-5xl md:whitespace-nowrap">
                      Ва Банк<span className="text-imperial-gold text-6xl align-middle">Ъ</span>
                    </h1>
                  </div>
                  {/* Right: Dynamic Date */}
                  <div className="flex flex-col items-center justify-end leading-tight md:items-end">
                    <span className="select-none font-serif text-sm text-[#2C2416]/90 md:text-base">
                      {datelineCity}
                    </span>
                    <span className="select-none font-serif text-sm text-[#2C2416]/90 md:text-base">
                      {datelineDate}
                    </span>
                  </div>
                </div>
              );
            })()}
            <div className="my-2 text-2xl select-none">
              ☙ ━━━━━ ❦ ━━━━━ ❧
            </div>
            <p className="mt-2 text-xl italic">
              Имперский интеллектуальный салонъ
            </p>
            <div className="my-2 text-2xl select-none">
              ☙ ━━━━━ ❦ ━━━━━ ❧
            </div>
          </section>

          {/* Upcoming Games Table */}
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-heading text-2xl">Ближайшие игры</h2>
              <span className="flex-1" />
            </div>
            <div className="overflow-x-auto border-y-4 border-[#2C2416] rounded-none">
              <table className="w-full border-collapse rounded-none">
                <thead>
                  <tr>
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4">№</th>
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4">Дата</th>
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4">День</th>
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4">Время</th>
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4">Место</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.length > 0 ? (
                    upcoming.map((game: { number: number; dateTime: string; location: string }, idx: number) => {
                      const match = game.dateTime.match(/^(.*?)\s*\((.*?)\),\s*(\d{1,2}:\d{2})$/);
                      const date = match ? match[1] : game.dateTime;
                      const weekday = match ? match[2] : "";
                      const time = match ? match[3] : "";
                      // Strike through the first 4 games (already played, including 18 April)
                      const isPast = idx < 4;
                      const tdClass = "border-b border-dashed border-[#2C2416]/40 py-3" + (isPast ? " line-through text-[#A9A9A9]" : "");
                      return (
                        <tr key={game.number} className="rounded-none">
                          <td className={tdClass}>{game.number}</td>
                          <td className={tdClass}>{date}</td>
                          <td className={tdClass}>{weekday}</td>
                          <td className={tdClass}>{time}</td>
                          <td className={tdClass}>{game.location}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="rounded-none">
                      <td colSpan={5} className="text-center border-b border-dashed border-[#2C2416]/40 py-3">Нет предстоящих игр.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Vintage Bookmark Gallery Link */}
          <a
            href="/gallery"
            className="absolute right-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-b-lg bg-[#2C2416] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F4F1E1] shadow-md transition-all duration-300 select-none hover:pt-3 sm:px-4 sm:py-3 sm:text-xs md:right-12 md:top-0 md:text-sm"
            style={{ letterSpacing: '0.12em' }}
          >
            Архивъ Фотографій
          </a>
          <div className="my-8 text-2xl text-center select-none">
            ☙ ━━━━━ ❦ ━━━━━ ❧
          </div>

          {/* Results Table */}
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-heading text-2xl">Результаты прошедших игръ</h2>
              <span className="flex-1" />
            </div>
            <div className="overflow-x-auto border-y-4 border-[#2C2416] rounded-none">
              <table className="w-full border-collapse rounded-none">
                <thead>
                  <tr>
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4 text-center">Место</th>
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4 text-left pl-6">Команда</th>
                    {gameNumbers.map((num, idx) => (
                      <th
                        key={num}
                        className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4 text-center"
                      >
                        Игра {idx + 1}
                      </th>
                    ))}
                    <th className="uppercase tracking-widest text-xs font-bold border-b-2 border-[#2C2416] text-[#2C2416] py-4 text-center">Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(results) && results.length > 0 ? (
                    results.map((row) => {
                      const isVaBank = row.team.trim().toLowerCase().includes("ва-банк");
                      return (
                        <tr key={row.team} className={isVaBank ? "bg-[#F9E9A9]/80" : ""}>
                          <td className="font-heading font-bold border-b border-dashed border-[#2C2416]/40 py-3 text-center">{row.rank}</td>
                          <td className={"font-heading font-bold border-b border-dashed border-[#2C2416]/40 py-3 text-left pl-6" + (isVaBank ? " text-imperial-burgundy" : "")}>{row.team}</td>
                          {gameNumbers.map((num) => (
                            <td className="border-b border-dashed border-[#2C2416]/40 py-3 text-center" key={num}>
                              {row[num] !== null && row[num] !== undefined ? row[num] : "—"}
                            </td>
                          ))}
                          <td className="font-bold border-b border-dashed border-[#2C2416]/40 py-3 text-center">
                            {row.total !== null && row.total !== undefined ? row.total : "—"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={gameNumbers.length + 3} className="text-center border-b border-dashed border-[#2C2416]/40 py-3">Нет данных.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="my-8 text-2xl text-center select-none">
            ☙ ━━━━━ ❦ ━━━━━ ❧
          </div>

          {/* Fact Widget */}
          <section className="flex justify-center">
            <div className="max-w-xl w-full border-[6px] border-double border-[#2C2416] bg-[#F4F1E1] shadow-[15px_15px_0px_rgba(44,36,22,0.15)] p-6 md:p-8 rounded-none">
              <div className="pb-2">
                <div className="font-heading text-[#2C2416] text-xl font-bold">Исторический фактъ</div>
              </div>
              <div>
                <blockquote className="italic text-lg leading-relaxed">
                  “{factObj.original}”
                </blockquote>
                {factObj.translated && (
                  <p className="mt-2 text-[#2C2416]/80 text-base">{factObj.translated}</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
