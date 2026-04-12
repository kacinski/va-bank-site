"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type Photo = {
  id: number;
  filename: string;
  title: string | null;
  gameDate?: string | Date | null;
  createdAt: string | Date;
};

type PhotoSection = {
  key: string;
  title: string;
  photos: Photo[];
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function parseDateFromFilename(filename: string): Date | null {
  const match = filename.match(/^(\d{1,2})_(\d{1,2})_(\d{4})/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    return null;
  }

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function getSectionDate(photo: Photo) {
  if (photo.gameDate) {
    return new Date(photo.gameDate);
  }

  const filenameDate = parseDateFromFilename(photo.filename);
  if (filenameDate) {
    return filenameDate;
  }

  return new Date(photo.createdAt);
}

function getSectionKey(photo: Photo) {
  return new Date(getSectionDate(photo)).toISOString().slice(0, 10);
}

function formatSectionTitle(photo: Photo) {
  return dateFormatter.format(new Date(getSectionDate(photo)));
}

function buildSections(photos: Photo[]): PhotoSection[] {
  const sections = new Map<string, PhotoSection>();

  for (const photo of photos) {
    const key = getSectionKey(photo);
    const existingSection = sections.get(key);

    if (existingSection) {
      existingSection.photos.push(photo);
      continue;
    }

    sections.set(key, {
      key,
      title: formatSectionTitle(photo),
      photos: [photo],
    });
  }

  return Array.from(sections.values()).sort((a, b) => {
    if (a.key > b.key) return 1;
    if (a.key < b.key) return -1;
    return 0;
  });
}

function getSectionAnchor(sectionKey: string) {
  return `game-${sectionKey}`;
}

function getPhotoSrc(photoId: number) {
  return `/api/photos/${photoId}/file`;
}

export default function GalleryClient({ photos: initialPhotos }: { photos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const gameDateRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const photoSections = buildSections(photos);
  const fetchPhotos = () => {
    fetch("/api/photos")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Не удалось загрузить фотографии");
        }
        return res.json();
      })
      .then((photos) => setPhotos(photos))
      .catch(() => setUploadError("Ошибка загрузки фотографий"));
  };
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    if (res.ok) {
      fetchPhotos();
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (gameDateRef.current) gameDateRef.current.value = "";
    } else {
      setUploadError("Ошибка загрузки файла");
    }
  };
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const openModal = (idx: number) => setModalIdx(idx);
  const closeModal = () => setModalIdx(null);
  const showPrev = () => setModalIdx(modalIdx !== null ? (modalIdx + photos.length - 1) % photos.length : null);
  const showNext = () => setModalIdx(modalIdx !== null ? (modalIdx + 1) % photos.length : null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, []);

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

  if (!mounted) {
    return (
      <main className="relative flex min-h-screen w-full items-start justify-center px-3 py-6 sm:px-4 md:py-10">
        <div className="mx-auto w-full max-w-4xl bg-[#F4F1E1] px-4 py-8 text-[#2C2416] sm:px-6 md:border-[6px] md:border-double md:border-[#2C2416] md:px-10 md:py-12 lg:px-16">
          <div className="text-center font-serif text-lg">Загрузка архива...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen w-full items-start justify-center px-3 py-6 sm:px-4 md:py-10">
      {/* Modal Overlay */}
      {modalIdx !== null && photos[modalIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={closeModal}
        >
          <div className="relative max-w-5xl w-[98vw] md:w-[85vw] max-h-[98vh] flex flex-col items-center cursor-default"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={getPhotoSrc(photos[modalIdx].id)}
              alt={photos[modalIdx].title || photos[modalIdx].filename}
              className="rounded border-4 border-[#EAE5D9] object-contain max-h-[85vh] bg-[#EAE5D9]"
            />
            <div className="mt-4 font-serif text-lg text-[#F4F1E1] text-center bg-[#2C2416] px-4 py-2 rounded">
              {photos[modalIdx].title || photos[modalIdx].filename}
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
      <div className="mx-auto flex w-full max-w-6xl items-start md:gap-0">
        <nav className="sticky top-24 hidden w-32 shrink-0 flex-col pt-28 md:flex lg:w-40">
          <div className="mb-4 pl-3 font-heading text-sm uppercase tracking-[0.16em] text-[#6B5B3E]">
            Игры
          </div>
          <div className="flex flex-col gap-2">
            {photoSections.map((section) => (
              <a
                key={section.key}
                href={`#${getSectionAnchor(section.key)}`}
                className="relative -mr-px border-2 border-r-0 border-[#2C2416] bg-[#E7D9B8] px-3 py-3 font-serif text-sm leading-tight text-[#2C2416] shadow-[6px_6px_0px_rgba(44,36,22,0.10)] transition hover:bg-[#2C2416] hover:text-[#F4F1E1]"
              >
                <span className="block text-[10px] uppercase tracking-[0.16em] opacity-70">Игра</span>
                <span className="mt-1 block">{section.title}</span>
              </a>
            ))}
          </div>
        </nav>
        <div className="relative w-full bg-[#F4F1E1] px-4 py-8 text-[#2C2416] sm:px-6 md:border-[6px] md:border-double md:border-[#2C2416] md:px-10 md:py-12 lg:px-16">
        {/* Navigation */}
        <div className="mb-6 flex gap-4 items-center">
          <Link href="/" className="inline-block font-serif text-[#6B5B3E] text-base md:text-lg italic underline underline-offset-4 hover:text-imperial-burgundy transition select-none">
            ← Вернуться къ расписанію
          </Link>
          <span className="text-[#C2B59B] select-none">|</span>
          <Link href="/memes" className="inline-block font-serif text-[#6B5B3E] text-base md:text-lg italic underline underline-offset-4 hover:text-imperial-burgundy transition select-none">
            Мемы
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="my-2 text-2xl select-none">☙ ━━━━━ ❦ ━━━━━ ❧</div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-widest mb-2">Фотохроника Салона</h1>
          <div className="my-2 text-2xl select-none">☙ ━━━━━ ❦ ━━━━━ ❧</div>
        </div>
        {/* Upload Form */}
        <form className="mb-8 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center" onSubmit={handleUpload} encType="multipart/form-data">
          <input
            type="date"
            name="gameDate"
            required
            ref={gameDateRef}
            className="min-w-0 w-full rounded border px-2 py-1 sm:w-auto"
          />
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            ref={fileInputRef}
            className="min-w-0 w-full rounded border px-2 py-1 sm:w-auto"
          />
          <input
            type="text"
            name="title"
            placeholder="Подпись (необязательно)"
            className="min-w-0 w-full rounded border px-2 py-1 sm:w-auto sm:flex-1"
          />
          <button type="submit" disabled={uploading} className="rounded bg-[#222] px-4 py-2 text-white hover:bg-[#444] disabled:opacity-50 sm:w-auto">
            {uploading ? "Загрузка..." : "Загрузить фото"}
          </button>
        </form>
        {uploadError && <div className="text-red-600 mb-4">{uploadError}</div>}
        <nav className="sticky top-0 z-40 mb-8 -mx-4 border-y-2 border-[#2C2416] bg-[#EAE5D9]/95 px-4 py-3 backdrop-blur-sm md:hidden sm:-mx-6 sm:px-6">
          <div className="mb-3 font-heading text-lg tracking-wide">Переход к игре</div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {photoSections.map((section) => (
              <a
                key={section.key}
                href={`#${getSectionAnchor(section.key)}`}
                className="shrink-0 border border-[#2C2416] bg-[#F4F1E1] px-3 py-2 font-serif text-sm transition hover:bg-[#2C2416] hover:text-[#F4F1E1]"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>
        <div className="space-y-10">
          {photoSections.map((section) => (
            <section key={section.key} id={getSectionAnchor(section.key)} className="scroll-mt-40 md:scroll-mt-24">
              <div className="mb-5 border-b-2 border-[#2C2416] pb-2">
                <h2 className="font-heading text-2xl md:text-3xl tracking-wide">Игра от {section.title}</h2>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {section.photos.map((photo) => {
                  const photoIndex = photos.findIndex((candidate) => candidate.id === photo.id);
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => openModal(photoIndex)}
                      className="block w-full cursor-zoom-in border border-[#C2B59B] bg-[#EAE5D9] p-3 text-left rounded-none"
                      tabIndex={0}
                    >
                      <div className="mb-3 overflow-hidden rounded-none">
                        <img
                          src={getPhotoSrc(photo.id)}
                          alt={photo.title || photo.filename}
                          className="h-64 w-full object-cover border border-[#B6A88A]"
                        />
                      </div>
                      <div className="mt-2 text-center font-serif text-base text-[#2C2416]">
                        {photo.title || photo.filename}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
      </div>
    </main>
  );
}