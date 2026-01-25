"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ImageItem = {
  src: string;
  alt: string;
};

type LightboxState = {
  index: number;
};

type CategoryGalleryProps = {
  images: ImageItem[];
  currentCategory: "Landscape" | "Nature" | "Street";
};

const CATEGORY_ITEMS: { label: CategoryGalleryProps["currentCategory"]; href: string }[] = [
  { label: "Landscape", href: "/landscape" },
  { label: "Nature", href: "/nature" },
  { label: "Street", href: "/street" }
];

export default function CategoryGallery({
  images,
  currentCategory
}: CategoryGalleryProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);

  const switchItems = useMemo(
    () => CATEGORY_ITEMS.filter((item) => item.label !== currentCategory),
    [currentCategory]
  );

  useEffect(() => {
    if (!lightbox) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
      }
      if (event.key === "ArrowRight") {
        setLightbox((current) =>
          current
            ? { index: (current.index + 1) % images.length }
            : current
        );
      }
      if (event.key === "ArrowLeft") {
        setLightbox((current) =>
          current
            ? { index: (current.index - 1 + images.length) % images.length }
            : current
        );
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [images.length, lightbox]);

  const goNext = () => {
    setLightbox((current) =>
      current ? { index: (current.index + 1) % images.length } : current
    );
  };

  const goPrev = () => {
    setLightbox((current) =>
      current
        ? { index: (current.index - 1 + images.length) % images.length }
        : current
    );
  };

  return (
    <main className="category-shell">
      <header className="category-header">
        <div className="category-header-spacer" />
        <Link href="/" className="category-name">
          Ashwin Parthasarathy
        </Link>
        <div className="category-switch">
          <button
            type="button"
            className="category-switch-button"
            aria-expanded={switchOpen}
            onClick={() => setSwitchOpen((open) => !open)}
          >
            {currentCategory}
          </button>
          {switchOpen && (
            <nav className="category-switch-menu" aria-label="Other categories">
              {switchItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="category-switch-link"
                  onClick={() => setSwitchOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <div className="category-grid">
        {images.map((image, index) => (
          <article key={`${image.alt}-${index}`} className="category-tile">
            <img src={image.src} alt={image.alt} loading="eager" decoding="async" />
            <button
              type="button"
              aria-label={`Open ${image.alt}`}
              onClick={() => setLightbox({ index })}
            />
          </article>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button
            className="lightbox-close"
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
          >
            ✕
          </button>
          <button
            className="lightbox-button prev"
            type="button"
            aria-label="Previous"
            onClick={goPrev}
          >
            ←
          </button>
          <button
            className="lightbox-button next"
            type="button"
            aria-label="Next"
            onClick={goNext}
          >
            →
          </button>
          <figure>
            <img src={images[lightbox.index].src} alt={images[lightbox.index].alt} />
          </figure>
        </div>
      )}
    </main>
  );
}
