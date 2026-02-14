"use client";

import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/basePath";

type RevealedSquare = {
  x: number;
  y: number;
  id: string;
  timeoutId: ReturnType<typeof setTimeout>;
};

type WorksMaskCardProps = {
  title: string;
  image: string;
  className: string;
};

export default function WorksMaskCard({
  title,
  image,
  className
}: WorksMaskCardProps) {
  const [revealedSquares, setRevealedSquares] = useState<RevealedSquare[]>([]);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const cardRef = useRef<HTMLElement | null>(null);
  const isDrawingRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const lastRevealRef = useRef({ x: 0, y: 0 });
  const squareCounterRef = useRef(0);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const squareSize = 88;
  const revealDistance = 20;
  const disappearDelay = 1000;

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const updateSize = () => {
      setCardSize({
        width: node.clientWidth,
        height: node.clientHeight
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const removeSquareById = (squareId: string) => {
    setRevealedSquares((prev) => prev.filter((square) => square.id !== squareId));
  };

  const revealSquareAt = (x: number, y: number) => {
    if (cardSize.width <= 0 || cardSize.height <= 0) return;

    const centerX = x - squareSize / 2;
    const centerY = y - squareSize / 2;

    const squareLeft = centerX;
    const squareTop = centerY;
    const squareRight = centerX + squareSize;
    const squareBottom = centerY + squareSize;

    if (
      squareRight <= 0 ||
      squareLeft >= cardSize.width ||
      squareBottom <= 0 ||
      squareTop >= cardSize.height
    ) {
      return;
    }

    squareCounterRef.current += 1;
    const squareId = `work-square-${squareCounterRef.current}`;
    const timeoutId = setTimeout(() => {
      timersRef.current.delete(timeoutId);
      removeSquareById(squareId);
    }, disappearDelay);
    timersRef.current.add(timeoutId);

    setRevealedSquares((prev) => [
      ...prev,
      { x: centerX, y: centerY, id: squareId, timeoutId }
    ]);
  };

  const getLocalPosition = (
    event: React.PointerEvent<HTMLElement>
  ): { x: number; y: number; inside: boolean } => {
    const node = cardRef.current;
    if (!node) return { x: 0, y: 0, inside: false };
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
      x: Math.max(0, Math.min(x, rect.width)),
      y: Math.max(0, Math.min(y, rect.height)),
      inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const position = getLocalPosition(event);
    if (!position.inside) return;

    isDrawingRef.current = true;
    pointerRef.current = { x: position.x, y: position.y };
    lastRevealRef.current = { x: position.x, y: position.y };
    revealSquareAt(position.x, position.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const position = getLocalPosition(event);
    pointerRef.current = { x: position.x, y: position.y };

    if (!isDrawingRef.current || !position.inside) return;

    const distance = Math.hypot(
      position.x - lastRevealRef.current.x,
      position.y - lastRevealRef.current.y
    );
    if (distance >= revealDistance) {
      revealSquareAt(position.x, position.y);
      lastRevealRef.current = { x: position.x, y: position.y };
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    isDrawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerLeave = () => {
    isDrawingRef.current = false;
  };

  return (
    <article
      ref={cardRef}
      className={`artist-work-card ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <img
        className="artist-work-image"
        src={withBasePath(image)}
        alt={title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />

      <div className="artist-work-mask" aria-hidden="true">
        {revealedSquares.map((square) => {
          const bgX = -square.x;
          const bgY = -square.y;
          return (
            <div
              key={square.id}
              className="artist-work-square"
              style={{
                left: square.x,
                top: square.y,
                width: squareSize,
                height: squareSize,
                backgroundImage: `url('${withBasePath(image)}')`,
                backgroundPosition: `${bgX}px ${bgY}px`,
                backgroundSize: `${cardSize.width}px ${cardSize.height}px`
              }}
            />
          );
        })}
      </div>
    </article>
  );
}
