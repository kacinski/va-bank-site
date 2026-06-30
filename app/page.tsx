import { promises as fs } from "fs";
import path from "path";
import { fetchLeaderboard } from "@/lib/leaderboard";

export const revalidate = 900;

async function getGamesData() {
  const filePath = path.join(process.cwd(), "data/games.json");
  const file = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(file);
  return {
    upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
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
      { next: { revalidate: 900 } },
      3000
    );
    if (!res.ok) throw new Error("Failed to fetch fact");
    const data = await res.json() as { text?: string };
    const original = data.text || "Факт не найден.";
    let translated = "";
    try {
      const tr = await fetchWithTimeout(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(original)}&langpair=en|ru`,
        {},
        3000
      );
      if (tr.ok) {
        const trData = await tr.json() as { responseData?: { translatedText?: string } };
        translated = trData.responseData?.translatedText || "";
      }
    } catch {}
    return { original, translated };
  } catch {
    return { original: "Не удалось загрузить исторический факт.", translated: "" };
  }
}

export default async function HomePage() {
  const [{ upcoming }, results, factObj] = await Promise.all([
    getGamesData(),
    fetchLeaderboard(),
    getRandomFactWithTranslation(),
  ]);

  const gameNumbers = results.length > 0
    ? Object.keys(results[0]).filter(k => k.startsWith("game"))
    : [];

  return (
    <>
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
                    upcoming.map((game: { number: number; dateTime: string; isoDate: string; location: string }) => {
                      const match = game.dateTime.match(/^(.*?)\s*\((.*?)\),\s*(\d{1,2}:\d{2})$/);
                      const date = match ? match[1] : game.dateTime;
                      const weekday = match ? match[2] : "";
                      const time = match ? match[3] : "";
                      const isPast = new Date(game.isoDate) < new Date();
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

          {/* Bookmark links */}
          <a
            href="/gallery"
            className="absolute right-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-b-lg bg-[#2C2416] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F4F1E1] shadow-md transition-all duration-300 select-none hover:pt-3 sm:px-4 sm:py-3 sm:text-xs md:right-12 md:top-0 md:text-sm"
            style={{ letterSpacing: '0.12em' }}
          >
            Архивъ Фотографій
          </a>
          <a
            href="/memes"
            className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] rounded-b-lg bg-[#2C2416] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#F4F1E1] shadow-md transition-all duration-300 select-none hover:pt-3 sm:px-4 sm:py-3 sm:text-xs md:left-12 md:top-0 md:text-sm"
            style={{ letterSpacing: '0.12em' }}
          >
            Мемы и Картинки
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
                  {results.length > 0 ? (
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
                  "{factObj.translated || factObj.original}"
                </blockquote>
                {factObj.translated && (
                  <p className="mt-3 text-[#2C2416]/50 text-sm italic">{factObj.original}</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
