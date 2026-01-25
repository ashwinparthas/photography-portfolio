"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Photo = {
  category: "Landscape" | "Nature" | "Street";
  src: string;
  featured: boolean;
};

const photos: Photo[] = [
  {
    category: "Landscape",
    src: "/photos/Bridge.png",
    featured: true
  },
  {
    category: "Nature",
    src: "/photos/Butterfly.png",
    featured: true
  },
  {
    category: "Landscape",
    src: "/photos/Dreamy_Subway.png",
    featured: true
  },
  {
    category: "Street",
    src: "/photos/SF_House.png",
    featured: true
  },
  {
    category: "Landscape",
    src: "/photos/Windmill.png",
    featured: true
  },
];

type LightboxState = {
  items: Photo[];
  index: number;
};

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ashwin.parthas",
  linkedin: "https://www.linkedin.com/in/ashwin-parthas/"
};

export default function Home() {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [panelFloating, setPanelFloating] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const scrollState = useRef({ target: 0, frame: 0 });

  const categoryLinks = useMemo(
    () => [
      { label: "Landscape", href: "/landscape" },
      { label: "Nature", href: "/nature" },
      { label: "Street", href: "/street" }
    ],
    []
  );

  const visiblePhotos = useMemo(() => photos, []);

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
            ? {
                ...current,
                index: (current.index + 1) % current.items.length
              }
            : current
        );
      }
      if (event.key === "ArrowLeft") {
        setLightbox((current) =>
          current
            ? {
                ...current,
                index:
                  (current.index - 1 + current.items.length) %
                  current.items.length
              }
            : current
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightbox]);

  useEffect(() => {
    const track = galleryRef.current;
    if (!track) {
      return;
    }

    scrollState.current.target = track.scrollLeft;

    const handleWheel = (event: WheelEvent) => {
      if (track.scrollWidth <= track.clientWidth) {
        return;
      }

      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;

      if (delta === 0) {
        return;
      }

      event.preventDefault();
      const scaled = delta * 0.7;
      scrollState.current.target += scaled;
      const maxScroll = track.scrollWidth - track.clientWidth;
      scrollState.current.target = Math.max(
        0,
        Math.min(scrollState.current.target, maxScroll)
      );

      setPanelFloating(scrollState.current.target > 12);

      if (scrollState.current.frame) {
        return;
      }

      const step = () => {
        const distance = scrollState.current.target - track.scrollLeft;
        track.scrollLeft += distance * 0.18;
        setPanelFloating(track.scrollLeft > 12);
        if (Math.abs(distance) > 0.5) {
          scrollState.current.frame = requestAnimationFrame(step);
        } else {
          scrollState.current.frame = 0;
        }
      };

      scrollState.current.frame = requestAnimationFrame(step);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    const handleScroll = () => {
      setPanelFloating(track.scrollLeft > 12);
    };
    handleScroll();
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      track.removeEventListener("scroll", handleScroll);
      if (scrollState.current.frame) {
        cancelAnimationFrame(scrollState.current.frame);
        scrollState.current.frame = 0;
      }
    };
  }, []);

  const openLightbox = (items: Photo[], index: number) => {
    setLightbox({ items, index });
  };

  const goNext = () => {
    setLightbox((current) =>
      current
        ? { ...current, index: (current.index + 1) % current.items.length }
        : current
    );
  };

  const goPrev = () => {
    setLightbox((current) =>
      current
        ? {
            ...current,
            index:
              (current.index - 1 + current.items.length) %
              current.items.length
          }
        : current
    );
  };

  return (
    <div className="site-shell">
      <main className="main-grid">
        <section className={`intro${panelFloating ? " is-floating" : ""}`}>
          <h1 className="intro-name">
            Ashwin Parthasarathy
          </h1>
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
          <p className="intro-footer">Beauty in the silence.</p>
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

        <section className="gallery">
          <div className="gallery-track" ref={galleryRef}>
            {visiblePhotos.map((photo, index) => (
              <article className="gallery-card">
                <img src={photo.src} loading="lazy" />
                <button
                  type="button"
                  onClick={() => openLightbox(visiblePhotos, index)}
                />
              </article>
            ))}
          </div>
          {visiblePhotos.length === 0 && (
            <p className="empty-state">No photos in this category yet.</p>
          )}
        </section>
      </main>

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
            <img
              src={lightbox.items[lightbox.index].src}
            />
            <span className="meta">
              {lightbox.items[lightbox.index].category}
            </span>
          </figure>
        </div>
      )}
    </div>
  );
}
