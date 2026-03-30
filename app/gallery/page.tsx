
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function GalleryPage() {
  const albums = [
    { img: "/images/galary/1_03_2026-103.jpg", caption: "1 марта 2026 — Игра, кадр 103" },
    { img: "/images/galary/1_03_2026-106.jpg", caption: "1 марта 2026 — Игра, кадр 106" },
    { img: "/images/galary/1_03_2026-269.jpg", caption: "1 марта 2026 — Игра, кадр 269" },
    { img: "/images/galary/1_03_2026-270.jpg", caption: "1 марта 2026 — Игра, кадр 270" },
    { img: "/images/galary/1_03_2026-313.jpg", caption: "1 марта 2026 — Игра, кадр 313" },
    { img: "/images/galary/1_03_2026-317.jpg", caption: "1 марта 2026 — Игра, кадр 317" },
    { img: "/images/galary/1_03_2026-394.jpg", caption: "1 марта 2026 — Игра, кадр 394" },
    { img: "/images/galary/1_03_2026-395.jpg", caption: "1 марта 2026 — Игра, кадр 395" },
    { img: "/images/galary/1_03_2026-457.jpg", caption: "1 марта 2026 — Игра, кадр 457" },
    { img: "/images/galary/1_03_2026-458.jpg", caption: "1 марта 2026 — Игра, кадр 458" },
    { img: "/images/galary/1_03_2026-459.jpg", caption: "1 марта 2026 — Игра, кадр 459" },
    { img: "/images/galary/1_03_2026-460.jpg", caption: "1 марта 2026 — Игра, кадр 460" },
    { img: "/images/galary/1_03_2026-461.jpg", caption: "1 марта 2026 — Игра, кадр 461" },
    { img: "/images/galary/1_03_2026-462.jpg", caption: "1 марта 2026 — Игра, кадр 462" },
    { img: "/images/galary/1_03_2026-463.jpg", caption: "1 марта 2026 — Игра, кадр 463" },
    { img: "/images/galary/1_03_2026-565.jpg", caption: "1 марта 2026 — Игра, кадр 565" },
    { img: "/images/galary/1_03_2026-566.jpg", caption: "1 марта 2026 — Игра, кадр 566" },
    { img: "/images/galary/1_03_2026-567.jpg", caption: "1 марта 2026 — Игра, кадр 567" },
    { img: "/images/galary/1_03_2026-568.jpg", caption: "1 марта 2026 — Игра, кадр 568" },
    { img: "/images/galary/1_03_2026-669.jpg", caption: "1 марта 2026 — Игра, кадр 669" },
    { img: "/images/galary/1_03_2026-673.jpg", caption: "1 марта 2026 — Игра, кадр 673" },
    { img: "/images/galary/1_03_2026-723.jpg", caption: "1 марта 2026 — Игра, кадр 723" },
    { img: "/images/galary/1_03_2026-782.jpg", caption: "1 марта 2026 — Игра, кадр 782" },
    { img: "/images/galary/1_03_2026-800.jpg", caption: "1 марта 2026 — Игра, кадр 800" },
    { img: "/images/galary/1_03_2026-812.jpg", caption: "1 марта 2026 — Игра, кадр 812" },
    { img: "/images/galary/1_03_2026-871.jpg", caption: "1 марта 2026 — Игра, кадр 871" },
    { img: "/images/galary/1_03_2026-873.jpg", caption: "1 марта 2026 — Игра, кадр 873" },
    { img: "/images/galary/1_03_2026-874.jpg", caption: "1 марта 2026 — Игра, кадр 874" },
    { img: "/images/galary/1_03_2026-89.jpg", caption: "1 марта 2026 — Игра, кадр 89" },
    { img: "/images/galary/1_03_2026-90.jpg", caption: "1 марта 2026 — Игра, кадр 90" },
    { img: "/images/galary/1_03_2026-914.jpg", caption: "1 марта 2026 — Игра, кадр 914" },
    { img: "/images/galary/1_03_2026-915.jpg", caption: "1 марта 2026 — Игра, кадр 915" },
    { img: "/images/galary/1_03_2026-916.jpg", caption: "1 марта 2026 — Игра, кадр 916" },
    { img: "/images/galary/1_03_2026-92.jpg", caption: "1 марта 2026 — Игра, кадр 92" },
    { img: "/images/galary/1_03_2026-928.jpg", caption: "1 марта 2026 — Игра, кадр 928" },
    { img: "/images/galary/1_03_2026-93.jpg", caption: "1 марта 2026 — Игра, кадр 93" },
    { img: "/images/galary/1_03_2026-94.jpg", caption: "1 марта 2026 — Игра, кадр 94" },
    { img: "/images/galary/1_03_2026-95.jpg", caption: "1 марта 2026 — Игра, кадр 95" },
    { img: "/images/galary/1_03_2026-96.jpg", caption: "1 марта 2026 — Игра, кадр 96" },
    { img: "/images/galary/1_03_2026-98.jpg", caption: "1 марта 2026 — Игра, кадр 98" },


  ];
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const openModal = (idx: number) => setModalIdx(idx);
  const closeModal = () => setModalIdx(null);
  const showPrev = () => setModalIdx(modalIdx !== null ? (modalIdx + albums.length - 1) % albums.length : null);
  const showNext = () => setModalIdx(modalIdx !== null ? (modalIdx + 1) % albums.length : null);

  // Keyboard navigation for modal
  useEffect(() => {
    if (modalIdx === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        showPrev();
      } else if (e.key === "ArrowRight") {
        showNext();
      } else if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalIdx]);

  return (
    <main className="min-h-screen w-full flex justify-center items-start relative">
      {/* Modal Overlay */}
      {modalIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={closeModal}
        >
          <div className="relative max-w-5xl w-[98vw] md:w-[85vw] max-h-[98vh] flex flex-col items-center cursor-default"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={albums[modalIdx].img}
              alt={albums[modalIdx].caption}
              className="rounded shadow-2xl border-4 border-[#EAE5D9] object-contain max-h-[85vh] bg-[#EAE5D9]"
              style={{ filter: 'sepia(40%) grayscale(20%)' }}
            />
            <div className="mt-4 font-serif text-lg text-[#F4F1E1] text-center drop-shadow-lg bg-[#2C2416]/80 px-4 py-2 rounded">
              {albums[modalIdx].caption}
            </div>
            {/* Prev/Next navigation */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[#F4F1E1] text-4xl font-bold bg-[#2C2416]/80 rounded-full px-4 py-2 hover:bg-[#2C2416] transition"
              onClick={e => { e.stopPropagation(); showPrev(); }}
              aria-label="Предыдущее фото"
              style={{ zIndex: 10 }}
            >
              ‹
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F4F1E1] text-4xl font-bold bg-[#2C2416]/80 rounded-full px-4 py-2 hover:bg-[#2C2416] transition"
              onClick={e => { e.stopPropagation(); showNext(); }}
              aria-label="Следующее фото"
              style={{ zIndex: 10 }}
            >
              ›
            </button>
            <button
              className="absolute top-2 right-2 text-[#F4F1E1] text-3xl font-bold bg-[#2C2416]/80 rounded-full px-3 py-1 hover:bg-[#2C2416] transition"
              onClick={e => { e.stopPropagation(); closeModal(); }}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto bg-[#F4F1E1] text-[#2C2416] border-[6px] border-double border-[#2C2416] p-10 md:p-16 shadow-[20px_20px_0px_rgba(44,36,22,0.15)] rounded-none">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/" className="inline-block font-serif text-[#6B5B3E] text-base md:text-lg italic underline underline-offset-4 hover:text-imperial-burgundy transition select-none">
            ← Вернуться къ расписанію
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="my-2 text-2xl select-none">☙ ━━━━━ ❦ ━━━━━ ❧</div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-widest mb-2">Фотохроника Салона</h1>
          <div className="my-2 text-2xl select-none">☙ ━━━━━ ❦ ━━━━━ ❧</div>
        </div>
        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {albums.map((album, idx) => (
            <button
              key={album.img}
              type="button"
              onClick={() => openModal(idx)}
              className="block bg-[#EAE5D9] p-3 shadow-md border border-[#C2B59B] rounded-none hover:shadow-lg transition w-full text-left cursor-zoom-in"
              tabIndex={0}
            >
              <div className="overflow-hidden rounded-none mb-3">
                <img
                  src={album.img}
                  alt={album.caption}
                  className="w-full h-64 object-cover filter sepia-[.5] grayscale-[.3] border border-[#B6A88A] shadow-inner"
                  style={{ filter: 'sepia(50%) grayscale(30%)' }}
                />
              </div>
              <div className="font-serif text-base text-[#2C2416] text-center mt-2">
                {album.caption}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
