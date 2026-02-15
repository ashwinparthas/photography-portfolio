"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import CollectionsDropdown from "@/components/CollectionsDropdown";
import SubpageFooter from "@/components/SubpageFooter";
import { responsiveSrc, responsiveSrcSet } from "@/lib/responsiveImage";
import { FEATURED_PHOTOS } from "@/lib/photoData";
import { withBasePath } from "@/lib/basePath";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ashwin.parthas",
  linkedin: "https://www.linkedin.com/in/ashwin-parthas/"
};

const CATEGORY_LINKS = [
  { label: "Landscape", href: "/landscape" },
  { label: "Nature", href: "/nature" },
  { label: "Street", href: "/street" }
];

const HOME_FOOTER_LINKS = [
  { label: "Library", href: "#library" },
  { label: "Jukebox", href: "#jukebox" }
];

const HOME_LOADER_SESSION_KEY = "home-loader-warm-v2";
const MOBILE_HERO_LOADER_RATIO = 0.8;
const MOBILE_HERO_LOADER_MIN_COUNT = 3;
const MOBILE_SCROLL_WHEEL_RENDER_COUNT = 3;
const getMobileHeroCriticalCount = () =>
  Math.min(
    FEATURED_PHOTOS.length,
    Math.max(
      MOBILE_HERO_LOADER_MIN_COUNT,
      Math.ceil(FEATURED_PHOTOS.length * MOBILE_HERO_LOADER_RATIO)
    )
  );

const LIBRARY_PLACEHOLDER_STYLE = {
  minHeight: "clamp(500px, 92svh, 1000px)"
} as const;

const JUKEBOX_PLACEHOLDER_STYLE = {
  minHeight: "clamp(540px, 92svh, 980px)"
} as const;

const FooterGradientShader = dynamic(
  () => import("@/components/FooterGradientShader"),
  { ssr: false }
);

const LibraryCosmosSection = dynamic(
  () => import("@/components/LibraryCosmosSection"),
  {
    ssr: false,
    loading: () => <div aria-hidden="true" style={LIBRARY_PLACEHOLDER_STYLE} />
  }
);

const VinylPlayerSection = dynamic(
  () => import("@/components/VinylPlayerSection"),
  {
    ssr: false,
    loading: () => <div aria-hidden="true" style={JUKEBOX_PLACEHOLDER_STYLE} />
  }
);

type HeroLightboxState = {
  index: number;
};

export default function Home() {
  const heroWheelRef = useRef<HTMLDivElement | null>(null);
  const libraryMountRef = useRef<HTMLDivElement | null>(null);
  const jukeboxMountRef = useRef<HTMLDivElement | null>(null);
  const scrollStateRef = useRef({
    target: 0,
    current: 0,
    frame: 0,
    lastTime: 0
  });
  const [heroLightbox, setHeroLightbox] = useState<HeroLightboxState | null>(
    null
  );
  const [isHd, setIsHd] = useState(false);
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [showLibrarySection, setShowLibrarySection] = useState(false);
  const [showJukeboxSection, setShowJukeboxSection] = useState(false);
  const loaderProgressRef = useRef(0);
  const loaderFillRef = useRef<HTMLDivElement | null>(null);
  const vinylReadyRef = useRef(false);
  const vinylReadyWaitersRef = useRef<Array<() => void>>([]);
  const heroImageRefsRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const heroLoadedIndexesRef = useRef<Set<number>>(new Set());
  const heroCriticalCountRef = useRef(1);
  const heroRenderReadyIndexesRef = useRef<Set<number>>(new Set());
  const heroRenderCriticalCountRef = useRef(0);
  const isTouchMobileDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 900px) and (hover: none) and (pointer: coarse)")
      .matches;
  const heroLoaderImageCount =
    FEATURED_PHOTOS.length > 0
      ? isTouchMobileDevice
        ? getMobileHeroCriticalCount()
        : 1
      : 0;

  const markHeroImageReady = useCallback((index: number) => {
    if (index >= heroCriticalCountRef.current) return;
    heroLoadedIndexesRef.current.add(index);
  }, []);

  const markHeroImageRendered = useCallback((index: number) => {
    if (index >= heroRenderCriticalCountRef.current) return;
    heroRenderReadyIndexesRef.current.add(index);
  }, []);

  const queueHeroImageRenderedFromNode = useCallback(
    (index: number, node: HTMLImageElement | null) => {
      if (!node) return;
      if (index >= heroRenderCriticalCountRef.current) return;
      if (!node.complete || node.naturalWidth <= 0) return;

      if (typeof node.decode === "function") {
        node
          .decode()
          .catch(() => {
            // decode() can fail in some browsers even when the image is usable.
          })
          .finally(() => {
            markHeroImageRendered(index);
          });
        return;
      }

      markHeroImageRendered(index);
    },
    [markHeroImageRendered]
  );

  const registerHeroImageRef = useCallback(
    (index: number, node: HTMLImageElement | null) => {
      if (!node) {
        heroImageRefsRef.current.delete(index);
        return;
      }
      heroImageRefsRef.current.set(index, node);
      if (
        index < heroCriticalCountRef.current &&
        node.complete &&
        node.naturalWidth > 0
      ) {
        markHeroImageReady(index);
      }
      if (
        index < heroRenderCriticalCountRef.current &&
        node.complete &&
        node.naturalWidth > 0
      ) {
        queueHeroImageRenderedFromNode(index, node);
      }
    },
    [markHeroImageReady, queueHeroImageRenderedFromNode]
  );

  const handleVinylReady = useCallback(() => {
    if (vinylReadyRef.current) return;
    vinylReadyRef.current = true;
    const waiters = vinylReadyWaitersRef.current;
    vinylReadyWaitersRef.current = [];
    waiters.forEach((resolve) => resolve());
  }, []);

  const preloadImage = (src: string) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = responsiveSrc(src);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let progressFrame = 0;
    let completionFrame = 0;
    let exitTimer: ReturnType<typeof setTimeout> | null = null;
    const loaderStartTime = performance.now();
    const isWarmSession = (() => {
      try {
        return sessionStorage.getItem(HOME_LOADER_SESSION_KEY) === "1";
      } catch {
        return false;
      }
    })();
    const isMobileLoader = window.matchMedia(
      "(max-width: 900px) and (hover: none) and (pointer: coarse)"
    ).matches;
    const mobileHeroCriticalCount = getMobileHeroCriticalCount();
    const criticalHeroImageCount =
      FEATURED_PHOTOS.length > 0
        ? isMobileLoader
          ? mobileHeroCriticalCount
          : 1
        : 0;
    const criticalRenderedHeroImageCount = isMobileLoader
      ? Math.min(FEATURED_PHOTOS.length, MOBILE_SCROLL_WHEEL_RENDER_COUNT)
      : 0;
    heroCriticalCountRef.current = criticalHeroImageCount;
    heroLoadedIndexesRef.current = new Set();
    heroRenderCriticalCountRef.current = criticalRenderedHeroImageCount;
    heroRenderReadyIndexesRef.current = new Set();
    heroImageRefsRef.current.forEach((node, index) => {
      if (
        index < heroCriticalCountRef.current &&
        node.complete &&
        node.naturalWidth > 0
      ) {
        heroLoadedIndexesRef.current.add(index);
      }
      if (
        index < heroRenderCriticalCountRef.current &&
        node.complete &&
        node.naturalWidth > 0
      ) {
        queueHeroImageRenderedFromNode(index, node);
      }
    });
    const steadyFillDurationMs = isWarmSession ? 1000 : 1900;

    const wait = (durationMs: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, durationMs);
      });

    const setProgress = (next: number) => {
      const clamped = Math.max(0, Math.min(100, next));
      loaderProgressRef.current = clamped;
      if (loaderFillRef.current) {
        loaderFillRef.current.style.transform = `scaleX(${clamped / 100})`;
      }
    };

    const preloadCriticalImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
        if (img.complete) {
          resolve();
        }
      });

    const waitForVinylReady = (timeoutMs: number) => {
      if (vinylReadyRef.current) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        let timeoutId = 0;
        const finalize = () => {
          window.clearTimeout(timeoutId);
          vinylReadyWaitersRef.current = vinylReadyWaitersRef.current.filter(
            (waiter) => waiter !== finalize
          );
          resolve();
        };
        timeoutId = window.setTimeout(finalize, timeoutMs);
        vinylReadyWaitersRef.current.push(finalize);
      });
    };

    const getHeroArtifactProgress = () => {
      const criticalCount = heroCriticalCountRef.current;
      if (criticalCount <= 0) return 1;
      return Math.min(1, heroLoadedIndexesRef.current.size / criticalCount);
    };

    const getHeroRenderProgress = () => {
      const criticalCount = heroRenderCriticalCountRef.current;
      if (criticalCount <= 0) return 1;
      return Math.min(1, heroRenderReadyIndexesRef.current.size / criticalCount);
    };

    const waitForHeroArtifacts = (timeoutMs: number) => {
      if (getHeroArtifactProgress() >= 1) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let frame = 0;
        let timeoutId = 0;

        const finalize = () => {
          if (frame) {
            window.cancelAnimationFrame(frame);
          }
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
          resolve();
        };

        const check = () => {
          if (cancelled || getHeroArtifactProgress() >= 1) {
            finalize();
            return;
          }
          frame = window.requestAnimationFrame(check);
        };

        timeoutId = window.setTimeout(finalize, timeoutMs);
        frame = window.requestAnimationFrame(check);
      });
    };

    const waitForHeroRenderedArtifacts = (timeoutMs: number) => {
      if (getHeroRenderProgress() >= 1) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let frame = 0;
        let timeoutId = 0;

        const finalize = () => {
          if (frame) {
            window.cancelAnimationFrame(frame);
          }
          if (timeoutId) {
            window.clearTimeout(timeoutId);
          }
          resolve();
        };

        const check = () => {
          if (cancelled || getHeroRenderProgress() >= 1) {
            finalize();
            return;
          }
          frame = window.requestAnimationFrame(check);
        };

        timeoutId = window.setTimeout(finalize, timeoutMs);
        frame = window.requestAnimationFrame(check);
      });
    };

    const runLoader = async () => {
      const animateSteadyFill = (now: number) => {
        if (cancelled) return;
        const elapsed = now - loaderStartTime;

        let target = 0;
        if (isMobileLoader) {
          const heroProgress = getHeroArtifactProgress();
          const renderedHeroProgress = getHeroRenderProgress();
          const vinylProgress = vinylReadyRef.current ? 1 : 0;
          const warmupProgress = Math.min(1, elapsed / (isWarmSession ? 900 : 1800));
          const artifactProgress =
            heroProgress * 0.56 +
            renderedHeroProgress * 0.16 +
            vinylProgress * 0.23 +
            warmupProgress * 0.05;
          target = 4 + artifactProgress * 90;
        } else {
          const progressRatio = Math.min(1, elapsed / steadyFillDurationMs);
          const eased = 1 - Math.pow(1 - progressRatio, 2.4);
          target = 6 + eased * 86;
        }

        if (target > loaderProgressRef.current) {
          setProgress(target);
        }
        progressFrame = requestAnimationFrame(animateSteadyFill);
      };

      progressFrame = requestAnimationFrame(animateSteadyFill);
      setShowJukeboxSection(true);

      const criticalHeroSources = FEATURED_PHOTOS.slice(
        0,
        heroCriticalCountRef.current
      ).map((photo) => responsiveSrc(photo.src));
      const criticalHeroLoadPromises = criticalHeroSources.map((src, index) =>
        preloadCriticalImage(src).then(() => {
          markHeroImageReady(index);
        })
      );

      if (criticalHeroLoadPromises.length > 0) {
        await Promise.race([
          criticalHeroLoadPromises[0],
          wait(isWarmSession ? 220 : 1000)
        ]);
      }

      if (cancelled) return;
      try {
        sessionStorage.setItem(HOME_LOADER_SESSION_KEY, "1");
      } catch {
        // Ignore storage failures in private/session-restricted environments.
      }

      const elapsed = performance.now() - loaderStartTime;
      const minimumLoaderTimeMs = isMobileLoader
        ? isWarmSession
          ? 1100
          : 1800
        : isWarmSession
          ? 1500
          : 2600;
      const artifactTimeoutMs = isMobileLoader
        ? isWarmSession
          ? 4000
          : 6500
        : isWarmSession
          ? 1600
          : 3000;
      const remainingMinimumDurationMs = Math.max(0, minimumLoaderTimeMs - elapsed);
      await Promise.all([
        remainingMinimumDurationMs > 0
          ? wait(remainingMinimumDurationMs)
          : Promise.resolve(),
        waitForHeroArtifacts(artifactTimeoutMs),
        waitForHeroRenderedArtifacts(artifactTimeoutMs),
        waitForVinylReady(artifactTimeoutMs)
      ]);

      if (cancelled) return;
      await wait(isWarmSession ? 120 : 220);
      if (cancelled) return;

      if (progressFrame) {
        cancelAnimationFrame(progressFrame);
        progressFrame = 0;
      }

      const completionFrom = loaderProgressRef.current;
      const completionDurationMs = isWarmSession ? 240 : 420;
      const exitDelayMs = isWarmSession ? 110 : 180;
      const completionStart = performance.now();
      const completeProgress = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - completionStart) / completionDurationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        const next = completionFrom + (100 - completionFrom) * eased;
        setProgress(next);
        if (t < 1) {
          completionFrame = requestAnimationFrame(completeProgress);
          return;
        }
        setProgress(100);
        setIsLoaderExiting(true);
      };

      completionFrame = requestAnimationFrame(completeProgress);

      exitTimer = setTimeout(() => {
        if (cancelled) return;
        setShowInitialLoader(false);
      }, completionDurationMs + exitDelayMs);
    };

    runLoader();

    return () => {
      cancelled = true;
      if (progressFrame) cancelAnimationFrame(progressFrame);
      if (completionFrame) cancelAnimationFrame(completionFrame);
      if (exitTimer) clearTimeout(exitTimer);
      const waiters = vinylReadyWaitersRef.current;
      vinylReadyWaitersRef.current = [];
      waiters.forEach((resolve) => resolve());
    };
  }, [markHeroImageReady, queueHeroImageRenderedFromNode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = window.setTimeout(() => {
      FEATURED_PHOTOS.slice(1).forEach((photo) => preloadImage(photo.src));
    }, 480);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.IntersectionObserver === "undefined") {
      const fallbackTimer = window.setTimeout(() => {
        setShowLibrarySection(true);
        setShowJukeboxSection(true);
      }, 0);
      return () => {
        window.clearTimeout(fallbackTimer);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === libraryMountRef.current) {
            setShowLibrarySection(true);
            observer.unobserve(entry.target);
            return;
          }
          if (entry.target === jukeboxMountRef.current) {
            setShowJukeboxSection(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "680px 0px" }
    );

    if (libraryMountRef.current) observer.observe(libraryMountRef.current);
    if (jukeboxMountRef.current) observer.observe(jukeboxMountRef.current);

    const libraryFallbackTimer = window.setTimeout(() => {
      setShowLibrarySection(true);
    }, 1500);
    const jukeboxFallbackTimer = window.setTimeout(() => {
      setShowJukeboxSection(true);
    }, 2600);

    return () => {
      observer.disconnect();
      window.clearTimeout(libraryFallbackTimer);
      window.clearTimeout(jukeboxFallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!showInitialLoader) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showInitialLoader]);

  useEffect(() => {
    const track = heroWheelRef.current;
    if (!track) return;

    scrollStateRef.current.target = track.scrollLeft;
    scrollStateRef.current.current = track.scrollLeft;
    scrollStateRef.current.lastTime = 0;

    const toPixelDelta = (event: WheelEvent) => {
      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;

      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return dominantDelta * 16;
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return dominantDelta * window.innerHeight;
      }

      return dominantDelta;
    };

    const animate = (time: number) => {
      const state = scrollStateRef.current;
      const elapsed = state.lastTime ? time - state.lastTime : 16.7;
      state.lastTime = time;

      const smoothing = 1 - Math.exp(-elapsed / 120);
      state.current += (state.target - state.current) * smoothing;
      track.scrollLeft = state.current;

      if (Math.abs(state.target - state.current) > 0.35) {
        state.frame = requestAnimationFrame(animate);
        return;
      }

      track.scrollLeft = state.target;
      state.current = state.target;
      state.frame = 0;
      state.lastTime = 0;
    };

    const handleWheel = (event: WheelEvent) => {
      if (track.scrollWidth <= track.clientWidth) return;

      const maxScroll = track.scrollWidth - track.clientWidth;
      const delta = toPixelDelta(event);

      if (delta === 0) return;

      const state = scrollStateRef.current;
      const atStart = state.target <= 1 && track.scrollLeft <= 1;
      const atEnd =
        state.target >= maxScroll - 1 && track.scrollLeft >= maxScroll - 1;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

      event.preventDefault();

      state.target += delta * 0.84;
      state.target = Math.max(
        0,
        Math.min(state.target, maxScroll)
      );

      if (state.frame) return;
      state.current = track.scrollLeft;
      state.frame = requestAnimationFrame(animate);
    };

    const handleTrackScroll = () => {
      const state = scrollStateRef.current;
      if (state.frame) return;
      state.target = track.scrollLeft;
      state.current = track.scrollLeft;
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    track.addEventListener("scroll", handleTrackScroll, { passive: true });

    return () => {
      track.removeEventListener("wheel", handleWheel);
      track.removeEventListener("scroll", handleTrackScroll);
      const state = scrollStateRef.current;
      if (state.frame) cancelAnimationFrame(state.frame);
      state.frame = 0;
      state.lastTime = 0;
    };
  }, []);

  useEffect(() => {
    if (!heroLightbox) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHeroLightbox(null);
      }
      if (event.key === "ArrowRight") {
        setIsHd(false);
        setHeroLightbox((current) =>
          current
            ? { index: (current.index + 1) % FEATURED_PHOTOS.length }
            : current
        );
      }
      if (event.key === "ArrowLeft") {
        setIsHd(false);
        setHeroLightbox((current) =>
          current
            ? {
                index:
                  (current.index - 1 + FEATURED_PHOTOS.length) %
                  FEATURED_PHOTOS.length
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
  }, [heroLightbox]);

  useEffect(() => {
    if (!heroLightbox) return;
    const nextIndex = (heroLightbox.index + 1) % FEATURED_PHOTOS.length;
    const prevIndex =
      (heroLightbox.index - 1 + FEATURED_PHOTOS.length) %
      FEATURED_PHOTOS.length;
    preloadImage(FEATURED_PHOTOS[nextIndex].src);
    preloadImage(FEATURED_PHOTOS[prevIndex].src);
  }, [heroLightbox]);

  const goNext = () => {
    setIsHd(false);
    setHeroLightbox((current) =>
      current ? { index: (current.index + 1) % FEATURED_PHOTOS.length } : current
    );
  };

  const goPrev = () => {
    setIsHd(false);
    setHeroLightbox((current) =>
      current
        ? {
            index:
              (current.index - 1 + FEATURED_PHOTOS.length) %
              FEATURED_PHOTOS.length
          }
        : current
    );
  };

  return (
    <div className="artist-home-shell">
      <main className="artist-home-main">
        <section className="artist-landing" id="top">
          <header className="artist-header">
            <div className="artist-header-gradient" aria-hidden="true">
              <FooterGradientShader />
            </div>
            <h1 className="artist-wordmark">
              Ashwin
              <br />
              Parthasarathy
            </h1>
            <p className="artist-origin">
              2024 • Present
              <br />
              San Francisco, CA
            </p>
            <CollectionsDropdown className="artist-nav" links={CATEGORY_LINKS} />
            <div className="artist-language">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </header>
          <div className="artist-header-rule" />

          <section className="artist-hero" aria-labelledby="artist-hero-title">
            <h2 id="artist-hero-title">
              <span className="artist-hero-quote">
                "You don't take a photograph, you make it."
              </span>
              <span className="artist-hero-cite">- Ansel Adams</span>
            </h2>
            <div className="artist-hero-wheel" ref={heroWheelRef}>
              {FEATURED_PHOTOS.map((photo, index) => (
                <article key={`${photo.title}-${index}`} className="artist-wheel-card">
                  <img
                    src={responsiveSrc(photo.src)}
                    srcSet={responsiveSrcSet(photo.src)}
                    sizes="(max-width: 760px) 78vw, 58vw"
                    alt={photo.title}
                    loading={index < heroLoaderImageCount ? "eager" : "lazy"}
                    decoding="async"
                    ref={(node) => registerHeroImageRef(index, node)}
                    onLoad={() => {
                      markHeroImageReady(index);
                      queueHeroImageRenderedFromNode(
                        index,
                        heroImageRefsRef.current.get(index) ?? null
                      );
                    }}
                    onError={() => markHeroImageReady(index)}
                  />
                  <button
                    type="button"
                    aria-label={`Open ${photo.title}`}
                    onClick={() => {
                      setIsHd(false);
                      setHeroLightbox({ index });
                    }}
                  />
                </article>
              ))}
            </div>
          </section>

          <section className="artist-library-intro" id="library" aria-label="Library">
            <div className="artist-library-rule" aria-hidden="true" />
            <h2 className="artist-library-title">Library</h2>
          </section>

          <div ref={libraryMountRef} aria-hidden="true" />
          {showLibrarySection ? (
            <LibraryCosmosSection className="artist-landing-library" />
          ) : (
            <div aria-hidden="true" style={LIBRARY_PLACEHOLDER_STYLE} />
          )}

          <section className="artist-jukebox-intro" id="jukebox" aria-label="Jukebox">
            <div className="artist-library-vinyl-rule" aria-hidden="true" />
            <h2 className="artist-library-title">Jukebox</h2>
          </section>
          <div ref={jukeboxMountRef} aria-hidden="true" />
          {showJukeboxSection ? (
            <VinylPlayerSection onReady={handleVinylReady} />
          ) : (
            <div aria-hidden="true" style={JUKEBOX_PLACEHOLDER_STYLE} />
          )}
          <SubpageFooter links={HOME_FOOTER_LINKS} />
        </section>
      </main>

      {showInitialLoader ? (
        <div
          className={`home-loading-screen${
            isLoaderExiting ? " is-exiting" : ""
          }`}
          role="status"
          aria-live="polite"
          aria-label="Loading homepage"
        >
          <div className="home-loading-panel">
            <p className="home-loading-label">Loading</p>
            <div className="home-loading-bar" aria-hidden="true">
              <div
                ref={loaderFillRef}
                className="home-loading-bar-fill"
              />
            </div>
          </div>
        </div>
      ) : null}

      {heroLightbox && (
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
            onClick={() => setHeroLightbox(null)}
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
                  ? withBasePath(FEATURED_PHOTOS[heroLightbox.index].src)
                  : responsiveSrc(FEATURED_PHOTOS[heroLightbox.index].src)
              }
              srcSet={
                isHd
                  ? undefined
                  : responsiveSrcSet(FEATURED_PHOTOS[heroLightbox.index].src)
              }
              sizes={isHd ? undefined : "(max-width: 900px) 96vw, 80vw"}
              alt={FEATURED_PHOTOS[heroLightbox.index].title}
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
      )}
    </div>
  );
}
