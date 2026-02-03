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

const CATEGORY_LINKS = [
  { label: "Landscape", href: "/landscape" },
  { label: "Nature", href: "/nature" },
  { label: "Street", href: "/street" },
  { label: "Library", href: "/library" }
] as const;

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ashwin.parthas",
  linkedin: "https://www.linkedin.com/in/ashwin-parthas/"
};

export default function CategoryGallery({
  images,
  currentCategory
}: CategoryGalleryProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [panelFloating, setPanelFloating] = useState(false);
  const [isHd, setIsHd] = useState(false);

  const preloadImage = (src: string) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = responsiveSrc(src);
  };

  const categoryLinks = useMemo(() => CATEGORY_LINKS, []);

  useEffect(() => {
    const handleScroll = () => {
      setPanelFloating(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="site-shell category-shell">
      <main className="main-grid">
        <section className={`intro${panelFloating ? " is-floating" : ""}`}>
          <Link href="/" className="intro-name">
            Ashwin Parthasarathy
          </Link>
          <p className="intro-page-label">{currentCategory}</p>
          <div className="intro-categories">
            <button
              type="button"
              className="categories-toggle"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen((open) => !open)}
            >
              Collections
            </button>
            {categoriesOpen && (
              <nav className="categories-menu" aria-label="Categories">
                {categoryLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="categories-link"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="intro-socials">
            <a
              className="social-link"
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M16.75 3h-9.5A4.25 4.25 0 0 0 3 7.25v9.5A4.25 4.25 0 0 0 7.25 21h9.5A4.25 4.25 0 0 0 21 16.75v-9.5A4.25 4.25 0 0 0 16.75 3Zm2.75 13.75A2.75 2.75 0 0 1 16.75 19.5h-9.5A2.75 2.75 0 0 1 4.5 16.75v-9.5A2.75 2.75 0 0 1 7.25 4.5h9.5A2.75 2.75 0 0 1 19.5 7.25v9.5Z"
                />
                <path d="M12 7.25A4.75 4.75 0 1 0 16.75 12 4.75 4.75 0 0 0 12 7.25Zm0 8A3.25 3.25 0 1 1 15.25 12 3.26 3.26 0 0 1 12 15.25Z" />
                <circle cx="17.2" cy="6.8" r="1.1" />
              </svg>
            </a>
            <a
              className="social-link"
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.94 8.5H4.1V20h2.84V8.5Zm.28-3.6a1.63 1.63 0 1 0-1.63 1.64 1.63 1.63 0 0 0 1.63-1.64Z" />
                <path d="M19.9 13.22c0-3.24-1.72-4.75-4.02-4.75a3.48 3.48 0 0 0-3.13 1.73V8.5H9.99c.04 1.12 0 11.5 0 11.5h2.76v-6.43c0-.35.03-.7.12-.95a1.88 1.88 0 0 1 1.77-1.26c1.25 0 1.75.95 1.75 2.35V20h2.76Z" />
              </svg>
            </a>
          </div>
        </section>

        <section
          className="category-gallery"
          aria-label={`${currentCategory} gallery`}
        >
          <div className="category-grid">
            {images.map((image, index) => (
              <article key={`${image.alt}-${index}`} className="category-tile">
                <img
                  src={responsiveSrc(image.src)}
                  srcSet={responsiveSrcSet(image.src)}
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                  alt={image.alt}
                  loading={index < 1 ? "eager" : "lazy"}
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
          {images.length === 0 && (
            <p className="empty-state">No photos in this category yet.</p>
          )}
        </section>
      </main>

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
    </div>
  );
}
