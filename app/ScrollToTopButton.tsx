"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Наверх"
      title="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-12 right-4 z-50 border-2 border-[#2C2416] bg-[#F4F1E1] px-3 py-2 text-xl text-[#2C2416] shadow-[6px_6px_0px_rgba(44,36,22,0.18)] transition hover:-translate-y-0.5 hover:bg-[#2C2416] hover:text-[#F4F1E1] sm:bottom-14 sm:right-6"
    >
      ↑
    </button>
  );
}
