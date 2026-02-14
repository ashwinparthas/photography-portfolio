"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SubpageHeader from "@/components/SubpageHeader";
import SubpageFooter from "@/components/SubpageFooter";
import { withBasePath } from "@/lib/basePath";
import { responsiveSrc, responsiveSrcSet } from "@/lib/responsiveImage";

type ImageItem = {
  src: string;
  alt: string;
};

type LightboxState = {
  index: number;
};

type RevealedSquare = {
  x: number;
  y: number;
  id: string;
  timeoutId: ReturnType<typeof setTimeout>;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CategoryGalleryProps = {
  images: ImageItem[];
  currentCategory: "Landscape" | "Nature" | "Street";
};

const SUBPAGE_FOOTER_LINKS = [{ label: "Reveal It", href: "#reveal" }];

const CURSOR_DOTS = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2;
  const radius = 16;
  return {
    cx: 24 + Math.cos(angle) * radius,
    cy: 24 + Math.sin(angle) * radius
  };
});

export default function CategoryGallery({
  images,
  currentCategory
}: CategoryGalleryProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [isHd, setIsHd] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [revealedSquares, setRevealedSquares] = useState<RevealedSquare[]>([]);
  const [imageBounds, setImageBounds] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
  const [drawLayer, setDrawLayer] = useState<Rect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const drawLayerRef = useRef<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const lastRevealPosition = useRef({ x: 0, y: 0 });
  const revealInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const squareCounter = useRef(0);
  const squareTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const lastTouchTimestampRef = useRef(0);

  const squareSize = 108;
  const revealDistance = 25;
  const disappearDelay = 1000;
  const [selectedPhotoSrc, setSelectedPhotoSrc] = useState(
    () => images[0]?.src ?? "/photos/Bridge.png"
  );
  const drawImage = useMemo(() => withBasePath(selectedPhotoSrc), [selectedPhotoSrc]);

  const preloadImage = (src: string) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.src = responsiveSrc(src);
  };

  useEffect(() => {
    squareTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    squareTimeoutsRef.current.clear();
    setSelectedPhotoSrc(
      images[Math.floor(Math.random() * images.length)]?.src ??
        "/photos/Bridge.png"
    );
    setRevealedSquares([]);
    squareCounter.current = 0;
  }, [currentCategory, images]);

  useEffect(() => {
    return () => {
      squareTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      squareTimeoutsRef.current.clear();
    };
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

  useEffect(() => {
    const updateImageBounds = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const horizontalInset = 0;
      const topInset = 0;
      const bottomInset = 0;
      setImageBounds({
        x: horizontalInset,
        y: topInset,
        width: Math.max(0, stage.clientWidth - horizontalInset * 2),
        height: Math.max(0, stage.clientHeight - topInset - bottomInset)
      });
    };

    updateImageBounds();
    window.addEventListener("resize", updateImageBounds);

    return () => {
      window.removeEventListener("resize", updateImageBounds);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setDimensions = (width: number, height: number) => {
      if (cancelled) return;
      setImageNaturalSize({
        width: Math.max(1, width),
        height: Math.max(1, height)
      });
    };

    const loadDimensions = async () => {
      try {
        if (typeof createImageBitmap === "function") {
          const response = await fetch(drawImage);
          if (!response.ok) {
            throw new Error("Failed to load image dimensions.");
          }
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob);
          setDimensions(bitmap.width, bitmap.height);
          bitmap.close();
          return;
        }
      } catch {
        // Fallback below handles environments without createImageBitmap.
      }

      const img = new Image();
      img.onload = () => {
        setDimensions(img.naturalWidth, img.naturalHeight);
      };
      img.src = drawImage;
    };

    void loadDimensions();

    return () => {
      cancelled = true;
    };
  }, [drawImage]);

  useEffect(() => {
    const fitScale = Math.min(
      imageBounds.width / imageNaturalSize.width,
      imageBounds.height / imageNaturalSize.height
    );

    if (!Number.isFinite(fitScale) || fitScale <= 0) {
      setDrawLayer({ x: imageBounds.x, y: imageBounds.y, width: 0, height: 0 });
      return;
    }

    const width = Math.round(imageNaturalSize.width * fitScale);
    const height = Math.round(imageNaturalSize.height * fitScale);
    const x = Math.round(imageBounds.x + (imageBounds.width - width) / 2);
    const y = Math.round(imageBounds.y + (imageBounds.height - height) / 2);

    setDrawLayer({
      x,
      y,
      width,
      height
    });
  }, [imageBounds, imageNaturalSize]);

  useEffect(() => {
    drawLayerRef.current = drawLayer;
  }, [drawLayer]);

  useEffect(() => {
    const removeSquareById = (squareId: string) => {
      setRevealedSquares((prev) =>
        prev.filter((square) => square.id !== squareId)
      );
    };

    const toStagePositionFromClient = (clientX: number, clientY: number) => {
      const stage = stageRef.current;
      if (!stage) return null;
      const rect = stage.getBoundingClientRect();
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const x = clientX - rect.left - stage.clientLeft;
      const y = clientY - rect.top - stage.clientTop;
      const inside = x >= 0 && x <= width && y >= 0 && y <= height;
      return {
        x: Math.max(0, Math.min(x, width)),
        y: Math.max(0, Math.min(y, height)),
        inside
      };
    };

    const toStagePosition = (event: MouseEvent) =>
      toStagePositionFromClient(event.clientX, event.clientY);

    const revealSquareAtPosition = (x: number, y: number) => {
      const centerX = x - squareSize / 2;
      const centerY = y - squareSize / 2;

      const imageLeft = drawLayerRef.current.x;
      const imageTop = drawLayerRef.current.y;
      const imageRight = drawLayerRef.current.x + drawLayerRef.current.width;
      const imageBottom = drawLayerRef.current.y + drawLayerRef.current.height;

      const squareLeft = centerX;
      const squareTop = centerY;
      const squareRight = centerX + squareSize;
      const squareBottom = centerY + squareSize;

      if (
        drawLayerRef.current.width <= 0 ||
        drawLayerRef.current.height <= 0 ||
        squareRight <= imageLeft ||
        squareLeft >= imageRight ||
        squareBottom <= imageTop ||
        squareTop >= imageBottom
      ) {
        return;
      }

      squareCounter.current += 1;
      const squareId = `square-${squareCounter.current}`;
      const timeoutId = setTimeout(() => {
        squareTimeoutsRef.current.delete(timeoutId);
        removeSquareById(squareId);
      }, disappearDelay);
      squareTimeoutsRef.current.add(timeoutId);

      setRevealedSquares((prev) => [
        ...prev,
        { x: centerX, y: centerY, id: squareId, timeoutId }
      ]);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const position = toStagePosition(event);
      if (!position) return;
      const newPosition = { x: position.x, y: position.y };
      setMousePosition(newPosition);
      mousePositionRef.current = newPosition;

      if (isMouseDownRef.current && position.inside) {
        const distance = Math.hypot(
          newPosition.x - lastRevealPosition.current.x,
          newPosition.y - lastRevealPosition.current.y
        );

        if (distance >= revealDistance) {
          revealSquareAtPosition(newPosition.x, newPosition.y);
          lastRevealPosition.current = newPosition;
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const position = toStagePosition(event);
      if (!position || !position.inside) return;
      isMouseDownRef.current = true;
      setMousePosition({ x: position.x, y: position.y });
      mousePositionRef.current = { x: position.x, y: position.y };
      revealSquareAtPosition(position.x, position.y);
      lastRevealPosition.current = { x: position.x, y: position.y };

      revealInterval.current = setInterval(() => {
        revealSquareAtPosition(mousePositionRef.current.x, mousePositionRef.current.y);
      }, 150);
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
      if (revealInterval.current) {
        clearInterval(revealInterval.current);
        revealInterval.current = null;
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (Date.now() - lastTouchTimestampRef.current < 420) {
        return;
      }
      const position = toStagePosition(event);
      if (!position || !position.inside || isMouseDownRef.current) {
        return;
      }
      revealSquareAtPosition(position.x, position.y);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      lastTouchTimestampRef.current = Date.now();
      const touch = event.touches[0];
      const position = toStagePositionFromClient(touch.clientX, touch.clientY);
      if (!position || !position.inside) return;

      event.preventDefault();
      isMouseDownRef.current = true;
      setMousePosition({ x: position.x, y: position.y });
      mousePositionRef.current = { x: position.x, y: position.y };
      revealSquareAtPosition(position.x, position.y);
      lastRevealPosition.current = { x: position.x, y: position.y };

      if (revealInterval.current) {
        clearInterval(revealInterval.current);
      }
      revealInterval.current = setInterval(() => {
        revealSquareAtPosition(mousePositionRef.current.x, mousePositionRef.current.y);
      }, 150);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      const touch = event.touches[0];
      const position = toStagePositionFromClient(touch.clientX, touch.clientY);
      if (!position) return;

      if (position.inside) {
        event.preventDefault();
      }
      const newPosition = { x: position.x, y: position.y };
      setMousePosition(newPosition);
      mousePositionRef.current = newPosition;

      if (isMouseDownRef.current && position.inside) {
        const distance = Math.hypot(
          newPosition.x - lastRevealPosition.current.x,
          newPosition.y - lastRevealPosition.current.y
        );

        if (distance >= revealDistance) {
          revealSquareAtPosition(newPosition.x, newPosition.y);
          lastRevealPosition.current = newPosition;
        }
      }
    };

    const handleTouchEnd = () => {
      isMouseDownRef.current = false;
      if (revealInterval.current) {
        clearInterval(revealInterval.current);
        revealInterval.current = null;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      if (revealInterval.current) {
        clearInterval(revealInterval.current);
        revealInterval.current = null;
      }
    };
  }, []);

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
    <div className="artist-subpage-shell category-shell">
      <main className="artist-subpage-main">
        <SubpageHeader pageLabel={currentCategory} />

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

        <div className="artist-header-rule category-gallery-rule" aria-hidden="true" />

        <section
          id="reveal"
          className="artist-library-intro artist-reveal-intro category-reveal-intro"
        >
          <h2 className="artist-library-title">Reveal It</h2>
        </section>

        <section
          className="category-brush-workbench category-workbench"
          aria-label={`${currentCategory} paintbrush reveal`}
        >
          <div className="category-brush-stage category-brush-page" ref={stageRef}>
            <p className="category-brush-instruction">Touch or click and drag to reveal the image.</p>

            {revealedSquares.map((square) => {
              return (
                <div
                  key={square.id}
                  className="category-brush-square"
                  style={{
                    left: square.x,
                    top: square.y,
                    width: squareSize,
                    height: squareSize
                  }}
                >
                  <img
                    src={drawImage}
                    alt=""
                    aria-hidden="true"
                    className="category-brush-square-image"
                    draggable={false}
                    style={{
                      left: drawLayer.x - square.x,
                      top: drawLayer.y - square.y,
                      width: drawLayer.width,
                      height: drawLayer.height
                    }}
                  />
                </div>
              );
            })}

            <div
              className="category-brush-cursor"
              style={{
                left: mousePosition.x - 24,
                top: mousePosition.y - 24
              }}
              aria-hidden="true"
            >
              <svg fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
                {CURSOR_DOTS.map((dot, index) => (
                  <circle
                    key={`dot-${index}`}
                    cx={dot.cx}
                    cy={dot.cy}
                    r="2.9"
                    fill="#7ad8ff"
                  />
                ))}
              </svg>
            </div>
          </div>
        </section>
      </main>
      <SubpageFooter links={SUBPAGE_FOOTER_LINKS} />

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
