"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type Meme = { id: number; filename: string; title: string | null };

export default function MemesClient({ memes: initialMemes }: { memes: Meme[] }) {
  const [memes, setMemes] = useState<Meme[]>(initialMemes);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Загрузить мемы на начальную загрузку страницы
  useEffect(() => {
    fetchMemes();
  }, []);

  // Получить свежий список мемов из API
  const fetchMemes = async () => {
    try {
      const res = await fetch("/api/memes");
      if (res.ok) {
        const allMemes = await res.json();
        setMemes(allMemes);
      }
    } catch (error) {
      console.error("Ошибка загрузки мемов:", error);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);
    setUploading(true);
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      setUploadError("Выберите хотя бы один файл");
      setUploading(false);
      return;
    }

    const formData = new FormData();
    const titleInput = (e.currentTarget.elements.namedItem("title") as HTMLInputElement | null)?.value || "";
    if (titleInput) {
      formData.append("title", titleInput);
    }

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    const res = await fetch("/api/upload-memes", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    if (res.ok) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchMemes();
    } else {
      setUploadError("Ошибка загрузки файлов");
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-start justify-center px-3 py-6 sm:px-4 md:py-10">
      <div className="mx-auto w-full max-w-4xl bg-[#F4F1E1] px-4 py-8 text-[#2C2416] sm:px-6 md:border-[6px] md:border-double md:border-[#2C2416] md:px-10 md:py-12 lg:px-16">
        <div className="mb-6 flex gap-4 items-center">
          <Link href="/" className="inline-block font-serif text-[#6B5B3E] text-base md:text-lg italic underline underline-offset-4 hover:text-imperial-burgundy transition select-none">
            ← Вернуться къ расписанію
          </Link>
          <span className="text-[#C2B59B] select-none">|</span>
          <Link href="/gallery" className="inline-block font-serif text-[#6B5B3E] text-base md:text-lg italic underline underline-offset-4 hover:text-imperial-burgundy transition select-none">
            Галерея
          </Link>
        </div>
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-widest mb-2">Мемы и смешные картинки</h1>
        </div>
        <form className="mb-8 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center" onSubmit={handleUpload} encType="multipart/form-data">
          <input
            type="file"
            name="files"
            accept="image/*"
            multiple
            required
            ref={fileInputRef}
            className="min-w-0 w-full rounded border px-2 py-1 sm:w-auto"
          />
          <input
            type="text"
            name="title"
            placeholder="Подпись для всех файлов (необязательно)"
            className="min-w-0 w-full rounded border px-2 py-1 sm:w-auto sm:flex-1"
          />
          <button type="submit" disabled={uploading} className="rounded bg-[#222] px-4 py-2 text-white hover:bg-[#444] disabled:opacity-50 sm:w-auto">
            {uploading ? "Загрузка..." : "Загрузить мемы"}
          </button>
        </form>
        {uploadError && <div className="text-red-600 mb-4">{uploadError}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {memes.map((meme) => (
            <div key={meme.id} className="bg-[#EAE5D9] p-3 border border-[#C2B59B] rounded-none w-full text-left relative">
              <div className="overflow-hidden rounded-none mb-3">
                <img
                  src={`/api/memes/${meme.id}/file`}
                  alt={meme.title || meme.filename}
                  className="w-full h-64 object-cover border border-[#B6A88A]"
                />
              </div>
              <div className="font-serif text-base text-[#2C2416] text-center mt-2">
                {meme.title || meme.filename}
              </div>
              <button
                className="absolute top-2 right-2 bg-red-600 text-white rounded px-2 py-1 text-xs hover:bg-red-800 transition"
                title="Удалить мем"
                onClick={async () => {
                  if (!confirm('Удалить этот мем?')) return;
                  const res = await fetch('/api/upload-memes', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: meme.id, filename: meme.filename }),
                  });
                  if (res.ok) {
                    setMemes((prev) => prev.filter((m) => m.id !== meme.id));
                  } else {
                    alert('Ошибка удаления');
                  }
                }}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
