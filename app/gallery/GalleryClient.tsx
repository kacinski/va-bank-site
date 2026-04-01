"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type Photo = { id: number; filename: string; title: string | null };

export default function GalleryClient({ photos: initialPhotos }: { photos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fetchPhotos = () => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then((photos) => setPhotos(photos));
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
    } else {
      setUploadError("Ошибка загрузки файла");
    }
  };
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const openModal = (idx: number) => setModalIdx(idx);
  const closeModal = () => setModalIdx(null);
  const showPrev = () => setModalIdx(modalIdx !== null ? (modalIdx + photos.length - 1) % photos.length : null);
  const showNext = () => setModalIdx(modalIdx !== null ? (modalIdx + 1) % photos.length : null);

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
      {modalIdx !== null && photos[modalIdx] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={closeModal}
        >
          <div className="relative max-w-5xl w-[98vw] md:w-[85vw] max-h-[98vh] flex flex-col items-center cursor-default"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={`/images/galary/${photos[modalIdx].filename}`}
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
      <div className="max-w-4xl mx-auto bg-[#F4F1E1] text-[#2C2416] border-[6px] border-double border-[#2C2416] p-10 md:p-16 rounded-none">
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
        {/* Upload Form */}
        <form className="mb-8 flex flex-col sm:flex-row gap-2 items-center" onSubmit={handleUpload} encType="multipart/form-data">
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            ref={fileInputRef}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            name="title"
            placeholder="Подпись (необязательно)"
            className="border px-2 py-1 rounded"
          />
          <button type="submit" disabled={uploading} className="bg-[#222] text-white px-4 py-2 rounded hover:bg-[#444] disabled:opacity-50">
            {uploading ? "Загрузка..." : "Загрузить фото"}
          </button>
        </form>
        {uploadError && <div className="text-red-600 mb-4">{uploadError}</div>}
        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openModal(idx)}
              className="block bg-[#EAE5D9] p-3 border border-[#C2B59B] rounded-none w-full text-left cursor-zoom-in"
              tabIndex={0}
            >
              <div className="overflow-hidden rounded-none mb-3">
                <img
                  src={`/images/galary/${photo.filename}`}
                  alt={photo.title || photo.filename}
                  className="w-full h-64 object-cover border border-[#B6A88A]"
                />
              </div>
              <div className="font-serif text-base text-[#2C2416] text-center mt-2">
                {photo.title || photo.filename}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}