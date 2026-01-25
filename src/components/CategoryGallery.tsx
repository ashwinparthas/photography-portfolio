"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { withBasePath } from "@/lib/basePath";
import { responsiveSrc, responsiveSrcSet } from "@/lib/responsiveImage";

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
  const [isHd, setIsHd] = useState(false);

  const preloadImage = (src: string) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = responsiveSrc(src);
  };

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
        setIsHd(false);
        setLightbox((current) =>
          current
            ? { index: (current.index + 1) % images.length }
            : current
        );
      }
      if (event.key === "ArrowLeft") {
        setIsHd(false);
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

  useEffect(() => {
    if (!lightbox) return;
    const nextIndex = (lightbox.index + 1) % images.length;
    const prevIndex = (lightbox.index - 1 + images.length) % images.length;
    preloadImage(images[nextIndex].src);
    preloadImage(images[prevIndex].src);
  }, [images, lightbox]);

  const goNext = () => {
    setIsHd(false);
    setLightbox((current) =>
      current ? { index: (current.index + 1) % images.length } : current
    );
  };

  const goPrev = () => {
    setIsHd(false);
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
      <p className="category-note">
        Click on Each Image to Toggle Between Fullscreen HD Resolution(s).
      </p>
      <div className="category-grid">
        {images.map((image, index) => (
          <article key={`${image.alt}-${index}`} className="category-tile">
            <img
              src={responsiveSrc(image.src)}
              srcSet={responsiveSrcSet(image.src)}
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
              alt={image.alt}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
            />
            <button
              type="button"
              aria-label={`Open ${image.alt}`}
              onClick={() => {
                setIsHd(false);
                setLightbox({ index });
              }}
            />
          </article>
        ))}
      </div>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <button
            className={`lightbox-hd${isHd ? " is-active" : ""}`}
            type="button"
            aria-pressed={isHd}
            onClick={() => setIsHd((current) => !current)}
          >
            HD
          </button>
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
            <img
              src={
                isHd
                  ? withBasePath(images[lightbox.index].src)
                  : responsiveSrc(images[lightbox.index].src)
              }
              srcSet={
                isHd ? undefined : responsiveSrcSet(images[lightbox.index].src)
              }
              sizes={isHd ? undefined : "(max-width: 900px) 96vw, 80vw"}
              alt={images[lightbox.index].alt}
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
      )}
    </main>
  );
}
