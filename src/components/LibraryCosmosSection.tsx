"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { PatternCanvas } from "@/components/halftone/PatternCanvas";
import { ALL_ALBUMS } from "@/lib/photoData";
import { responsiveSrc, responsiveSrcSet } from "@/lib/responsiveImage";
import { withBasePath } from "@/lib/basePath";

type DynamicAlbumCard = {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type DynamicLibraryLayout = {
  canvasWidth: number;
  canvasHeight: number;
  cards: DynamicAlbumCard[];
};

type LibraryConnection = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DragInfo = {
  offset: {
    x: number;
    y: number;
  };
};

type LibraryCosmosSectionProps = {
  sectionId?: string;
  className?: string;
};

const HALFTONE_EFFECTS = [
  "noise",
  "wave",
  "spiral",
  "orbit",
  "multiverse_collapse"
] as const;

type HalftoneEffect = (typeof HALFTONE_EFFECTS)[number];

const HALFTONE_DENSITY = 35;
const HALFTONE_SIZE = 35;
const HALFTONE_INTENSITY = 65;
const HALFTONE_SPEED = 1.2;
const ABSOLUTE_MIN_ZOOM = 0.22;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.2;
const DRAG_POSITION_UPDATE_INTERVAL_MS = 50;
const OVERVIEW_MODE_ZOOM_BUFFER = 0.06;

const TEMPLATE_CANVAS_WIDTH = 2400;
const TEMPLATE_CANVAS_HEIGHT = 1800;
const NODE_EXTRA_WIDTH = 16;
const NODE_EXTRA_HEIGHT = 40;

const TEMPLATE_LAYOUT: Omit<DynamicAlbumCard, "index">[] = [
  { x: 312, y: 132, width: 320.218, height: 254.694 },
  { x: 1289, y: 132, width: 320, height: 392.982 },
  { x: 1832, y: 388, width: 339.873, height: 339 },
  { x: 122, y: 709, width: 380, height: 290.909 },
  { x: 1175, y: 758, width: 359.606, height: 250 },
  { x: 709, y: 868, width: 349.345, height: 265 },
  { x: 1796, y: 883, width: 359.702, height: 279.323 },
  { x: 1030, y: 1230, width: 289.438, height: 324.627 },
  { x: 1518, y: 1272, width: 350.726, height: 239.937 },
  { x: 743, y: 343, width: 324.648, height: 266 },
  { x: 292, y: 1277, width: 330, height: 266.859 },
  { x: 1900, y: 70, width: 350, height: 280 }
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const buildEdgeFromCards = (
  fromCard: DynamicAlbumCard,
  toCard: DynamicAlbumCard,
  id: string
): LibraryConnection | null => {
  const fromWidth = fromCard.width + NODE_EXTRA_WIDTH;
  const toWidth = toCard.width + NODE_EXTRA_WIDTH;
  const fromHeight = fromCard.height + NODE_EXTRA_HEIGHT;
  const toHeight = toCard.height + NODE_EXTRA_HEIGHT;

  const fromCenterX = fromCard.x + fromWidth / 2;
  const fromCenterY = fromCard.y + fromHeight / 2;
  const toCenterX = toCard.x + toWidth / 2;
  const toCenterY = toCard.y + toHeight / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return null;

  const ux = dx / distance;
  const uy = dy / distance;
  const safeAbsX = Math.max(0.0001, Math.abs(ux));
  const safeAbsY = Math.max(0.0001, Math.abs(uy));

  const startOffset = Math.min(fromWidth / 2 / safeAbsX, fromHeight / 2 / safeAbsY);
  const endOffset = Math.min(toWidth / 2 / safeAbsX, toHeight / 2 / safeAbsY);

  return {
    id,
    x1: fromCenterX + ux * startOffset,
    y1: fromCenterY + uy * startOffset,
    x2: toCenterX - ux * endOffset,
    y2: toCenterY - uy * endOffset
  };
};

const buildDynamicLibraryLayout = (count: number): DynamicLibraryLayout => {
  if (count <= 0) {
    return {
      canvasWidth: TEMPLATE_CANVAS_WIDTH,
      canvasHeight: TEMPLATE_CANVAS_HEIGHT,
      cards: []
    };
  }

  const cardsPerBlock = TEMPLATE_LAYOUT.length;
  const blockCount = Math.max(1, Math.ceil(count / cardsPerBlock));
  const blocksPerRow = Math.max(1, Math.ceil(Math.sqrt(blockCount)));
  const blockRows = Math.ceil(blockCount / blocksPerRow);
  const canvasWidth = TEMPLATE_CANVAS_WIDTH * blocksPerRow;
  const canvasHeight = TEMPLATE_CANVAS_HEIGHT * blockRows;
  const cards: DynamicAlbumCard[] = [];

  for (let index = 0; index < count; index += 1) {
    const blockIndex = Math.floor(index / cardsPerBlock);
    const slot = TEMPLATE_LAYOUT[index % cardsPerBlock];
    const blockColumn = blockIndex % blocksPerRow;
    const blockRow = Math.floor(blockIndex / blocksPerRow);

    cards.push({
      index,
      x: slot.x + blockColumn * TEMPLATE_CANVAS_WIDTH,
      y: slot.y + blockRow * TEMPLATE_CANVAS_HEIGHT,
      width: slot.width,
      height: slot.height
    });
  }

  return {
    canvasWidth,
    canvasHeight,
    cards
  };
};

export default function LibraryCosmosSection({
  sectionId,
  className
}: LibraryCosmosSectionProps) {
  const albums = useMemo(() => ALL_ALBUMS, []);
  const layout = useMemo(
    () => buildDynamicLibraryLayout(albums.length),
    [albums.length]
  );
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const markerId = "library-cosmos-marker";
  const [viewport, setViewport] = useState({ width: 760, height: 900 });
  const [canvasPosition, setCanvasPosition] = useState({
    x: 500,
    y: 400
  });
  const canvasX = useMotionValue(0);
  const canvasY = useMotionValue(0);
  const [lightbox, setLightbox] = useState<{ index: number } | null>(null);
  const [isHd, setIsHd] = useState(false);
  const [halftoneEffect, setHalftoneEffect] = useState<HalftoneEffect | null>(
    null
  );
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorHoveringNode, setCursorHoveringNode] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const lastDragPositionUpdateRef = useRef(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isOverviewOptimized, setIsOverviewOptimized] = useState(false);
  const [overviewLoadCount, setOverviewLoadCount] = useState(0);
  const overviewPreloadStartedRef = useRef(false);
  const fitToViewportZoom = useMemo(() => {
    const fitByWidth = viewport.width / layout.canvasWidth;
    const fitByHeight = viewport.height / layout.canvasHeight;
    return Math.min(fitByWidth, fitByHeight);
  }, [layout.canvasHeight, layout.canvasWidth, viewport.height, viewport.width]);
  const minZoomLevel = useMemo(
    () => clamp(Number((fitToViewportZoom * 0.98).toFixed(2)), ABSOLUTE_MIN_ZOOM, 1),
    [fitToViewportZoom]
  );
  const isZoomedOutOverview = zoomLevel <= minZoomLevel + OVERVIEW_MODE_ZOOM_BUFFER;
  const overviewSources = useMemo(
    () => Array.from(new Set(albums.map((album) => responsiveSrc(album.src)))),
    [albums]
  );
  const showOverviewLoader =
    isZoomedOutOverview && !isOverviewOptimized && overviewSources.length > 0;
  const useCompactNodes = isZoomedOutOverview;
  const shouldRenderNodeImages = !showOverviewLoader;
  const overviewLoadProgress =
    overviewSources.length > 0
      ? Math.min(100, Math.round((overviewLoadCount / overviewSources.length) * 100))
      : 0;
  const connectionVisibilityScale = clamp(1 / Math.max(zoomLevel, 0.0001), 1, 3.2);
  const connectionStrokeWidth = Number((2.4 * connectionVisibilityScale).toFixed(2));
  const connectionMarkerWidth = Number((10 * connectionVisibilityScale).toFixed(2));
  const connectionMarkerHeight = Number((10 * connectionVisibilityScale).toFixed(2));
  const maxOffsetX = Math.max(0, layout.canvasWidth * zoomLevel - viewport.width);
  const maxOffsetY = Math.max(0, layout.canvasHeight * zoomLevel - viewport.height);

  useEffect(() => {
    if (!isZoomedOutOverview || isOverviewOptimized || overviewPreloadStartedRef.current) {
      return;
    }

    if (overviewSources.length === 0) return;

    overviewPreloadStartedRef.current = true;
    let cancelled = false;
    let loadedCount = 0;

    const markLoaded = () => {
      if (cancelled) return;
      loadedCount += 1;
      setOverviewLoadCount(loadedCount);
      if (loadedCount >= overviewSources.length) {
        setIsOverviewOptimized(true);
      }
    };

    overviewSources.forEach((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.onload = markLoaded;
      image.onerror = markLoaded;
      image.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, [isOverviewOptimized, isZoomedOutOverview, overviewSources]);

  useEffect(() => {
    setHalftoneEffect(
      HALFTONE_EFFECTS[Math.floor(Math.random() * HALFTONE_EFFECTS.length)]
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: fine)");
    const onChange = () => {
      setHasFinePointer(media.matches);
    };
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    setCursorVisible(false);
    setCursorHoveringNode(false);
  }, [lightbox]);

  const updateViewportPosition = useCallback(
    (
      offsetX: number,
      offsetY: number,
      zoom = zoomLevel,
      limitX = maxOffsetX,
      limitY = maxOffsetY
    ) => {
      const visibleX = clamp(-offsetX, 0, limitX);
      const visibleY = clamp(-offsetY, 0, limitY);
      const nextCanvasPosition = {
        x: visibleX / zoom + viewport.width / (2 * zoom),
        y: visibleY / zoom + viewport.height / (2 * zoom)
      };
      setCanvasPosition((current) => {
        if (
          Math.abs(current.x - nextCanvasPosition.x) < 0.1 &&
          Math.abs(current.y - nextCanvasPosition.y) < 0.1
        ) {
          return current;
        }
        return nextCanvasPosition;
      });
    },
    [maxOffsetX, maxOffsetY, viewport.height, viewport.width, zoomLevel]
  );

  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, _info: DragInfo) => {
      const now = performance.now();
      if (now - lastDragPositionUpdateRef.current < DRAG_POSITION_UPDATE_INTERVAL_MS) {
        return;
      }
      lastDragPositionUpdateRef.current = now;
      updateViewportPosition(canvasX.get(), canvasY.get());
    },
    [canvasX, canvasY, updateViewportPosition]
  );
  const handleDragStart = useCallback(() => {
    setIsDraggingCanvas(true);
    setCursorHoveringNode(false);
  }, []);
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, _info: DragInfo) => {
      lastDragPositionUpdateRef.current = 0;
      updateViewportPosition(canvasX.get(), canvasY.get());
      setIsDraggingCanvas(false);
    },
    [canvasX, canvasY, updateViewportPosition]
  );

  const applyZoom = useCallback(
    (nextZoom: number) => {
      const normalizedZoom = clamp(nextZoom, minZoomLevel, MAX_ZOOM);
      if (Math.abs(normalizedZoom - zoomLevel) < 0.0001) return;
      const currentOffsetX = canvasX.get();
      const currentOffsetY = canvasY.get();
      const visibleX = clamp(-currentOffsetX, 0, maxOffsetX);
      const visibleY = clamp(-currentOffsetY, 0, maxOffsetY);
      const centerX = visibleX / zoomLevel + viewport.width / (2 * zoomLevel);
      const centerY = visibleY / zoomLevel + viewport.height / (2 * zoomLevel);

      const nextMaxOffsetX = Math.max(
        0,
        layout.canvasWidth * normalizedZoom - viewport.width
      );
      const nextMaxOffsetY = Math.max(
        0,
        layout.canvasHeight * normalizedZoom - viewport.height
      );

      const nextVisibleX = centerX * normalizedZoom - viewport.width / 2;
      const nextVisibleY = centerY * normalizedZoom - viewport.height / 2;
      const nextOffsetX = -clamp(nextVisibleX, 0, nextMaxOffsetX);
      const nextOffsetY = -clamp(nextVisibleY, 0, nextMaxOffsetY);

      canvasX.set(nextOffsetX);
      canvasY.set(nextOffsetY);
      setZoomLevel(normalizedZoom);
      updateViewportPosition(
        nextOffsetX,
        nextOffsetY,
        normalizedZoom,
        nextMaxOffsetX,
        nextMaxOffsetY
      );
    },
    [
      canvasX,
      canvasY,
      layout.canvasHeight,
      layout.canvasWidth,
      maxOffsetX,
      maxOffsetY,
      minZoomLevel,
      updateViewportPosition,
      viewport.height,
      viewport.width,
      zoomLevel
    ]
  );

  const canZoomIn = zoomLevel < MAX_ZOOM - 0.0001;
  const canZoomOut = zoomLevel > minZoomLevel + 0.0001;

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
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightbox]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const measure = () => {
      setViewport({
        width: element.clientWidth,
        height: element.clientHeight
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    canvasX.set(0);
    canvasY.set(0);
    setCanvasPosition({
      x: viewport.width / 2,
      y: viewport.height / 2
    });
  }, [canvasX, canvasY, viewport.height, viewport.width]);

  useEffect(() => {
    const nextX = clamp(canvasX.get(), -maxOffsetX, 0);
    const nextY = clamp(canvasY.get(), -maxOffsetY, 0);
    if (nextX !== canvasX.get()) {
      canvasX.set(nextX);
    }
    if (nextY !== canvasY.get()) {
      canvasY.set(nextY);
    }
    updateViewportPosition(nextX, nextY);
  }, [canvasX, canvasY, maxOffsetX, maxOffsetY, updateViewportPosition]);

  const dragConstraints = useMemo(
    () => ({
      left: -maxOffsetX,
      right: 0,
      top: -maxOffsetY,
      bottom: 0
    }),
    [maxOffsetX, maxOffsetY]
  );
  const connections = useMemo(() => {
    const result: LibraryConnection[] = [];
    const cardsPerBlock = TEMPLATE_LAYOUT.length;
    const branchPairs: Array<[number, number]> = [
      [0, 3],
      [1, 4],
      [2, 6],
      [5, 7],
      [8, 10]
    ];

    for (let blockStart = 0; blockStart < layout.cards.length; blockStart += cardsPerBlock) {
      const blockEnd = Math.min(blockStart + cardsPerBlock, layout.cards.length);

      for (let index = blockStart; index < blockEnd - 1; index += 1) {
        const edge = buildEdgeFromCards(
          layout.cards[index],
          layout.cards[index + 1],
          `chain-${index}-${index + 1}`
        );
        if (edge) result.push(edge);
      }

      branchPairs.forEach(([from, to]) => {
        const fromIndex = blockStart + from;
        const toIndex = blockStart + to;
        if (fromIndex >= blockEnd || toIndex >= blockEnd) return;
        const edge = buildEdgeFromCards(
          layout.cards[fromIndex],
          layout.cards[toIndex],
          `branch-${fromIndex}-${toIndex}`
        );
        if (edge) result.push(edge);
      });
    }

    return result;
  }, [layout.cards]);

  const sectionClassName = `${
    className ? `library-cosmos ${className}` : "library-cosmos"
  }`;

  return (
    <>
      <section id={sectionId} className={sectionClassName}>
        <div className="library-cosmos-frame">
          <div className="library-halftone-backdrop" aria-hidden="true">
            {halftoneEffect ? (
              <PatternCanvas
                patternType="dots"
                density={HALFTONE_DENSITY}
                size={HALFTONE_SIZE}
                intensity={HALFTONE_INTENSITY}
                speed={HALFTONE_SPEED}
                colorMode="mono"
                backgroundColor="#fafafa"
                foregroundColor="#c93a3a"
                gradientColor="#c93a3a"
                isAnimated={true}
                mouseInteractive={true}
                morphing={false}
                dotShape="circle"
                animationEffect={halftoneEffect}
              />
            ) : null}
          </div>
          <div className="library-canvas-stage">
            <div
              className={`library-viewport-shell${
                hasFinePointer ? " library-cursor-zone" : ""
              }`}
              ref={viewportRef}
              onMouseMove={(event) => {
                if (!hasFinePointer) return;
                cursorX.set(event.clientX);
                cursorY.set(event.clientY);
              }}
              onMouseEnter={(event) => {
                if (!hasFinePointer) return;
                cursorX.set(event.clientX);
                cursorY.set(event.clientY);
                setCursorVisible(true);
              }}
              onMouseLeave={() => {
                setCursorVisible(false);
                setCursorHoveringNode(false);
              }}
            >
              <motion.div
                className="library-dynamic-canvas"
                drag
                dragConstraints={dragConstraints}
                dragElastic={0.1}
                dragMomentum={false}
                initial={{ x: 0, y: 0 }}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{
                  x: canvasX,
                  y: canvasY,
                  scale: zoomLevel,
                  width: layout.canvasWidth,
                  height: layout.canvasHeight,
                  minWidth: layout.canvasWidth,
                  minHeight: layout.canvasHeight
                }}
              >
                {!showOverviewLoader ? (
                  <svg
                    className="library-connection-graph"
                    width={layout.canvasWidth}
                    height={layout.canvasHeight}
                    viewBox={`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`}
                    aria-hidden="true"
                  >
                    <defs>
                      <marker
                        id={markerId}
                        viewBox="0 0 8.5 8.5"
                        markerWidth={connectionMarkerWidth}
                        markerHeight={connectionMarkerHeight}
                        refX="7.5"
                        refY="4.25"
                        orient="auto"
                        markerUnits="userSpaceOnUse"
                      >
                        <path
                          d="M0,0 L8.5,4.25 L0,8.5 z"
                          fill="rgba(255, 255, 255, 0.98)"
                        />
                      </marker>
                    </defs>
                    {connections.map((edge) => (
                      <line
                        key={edge.id}
                        className="library-connection-edge"
                        style={{ strokeWidth: connectionStrokeWidth }}
                        x1={edge.x1}
                        y1={edge.y1}
                        x2={edge.x2}
                        y2={edge.y2}
                        markerEnd={`url(#${markerId})`}
                      />
                    ))}
                  </svg>
                ) : null}
                {layout.cards.map((card, order) => {
                  const album = albums[card.index];
                  return (
                    <motion.button
                      key={`${album.title}-${card.index}`}
                      type="button"
                      className={`library-node${useCompactNodes ? " library-node-compact" : ""}`}
                      style={{
                        left: `${card.x}px`,
                        top: `${card.y}px`,
                        width: `${card.width + 16}px`
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: Math.min(0.35, order * 0.012)
                      }}
                      whileHover={
                        useCompactNodes
                          ? undefined
                          : {
                              scale: 1.02,
                              transition: {
                                duration: 0.2,
                                type: "spring",
                                stiffness: 400
                              }
                            }
                      }
                      whileTap={useCompactNodes ? undefined : { scale: 0.98 }}
                      onPointerDown={(event) => {
                        if (!useCompactNodes) {
                          event.stopPropagation();
                        }
                      }}
                      onMouseEnter={() => setCursorHoveringNode(true)}
                      onMouseLeave={() => setCursorHoveringNode(false)}
                      onClick={() => {
                        if (showOverviewLoader || isDraggingCanvas) return;
                        setIsHd(false);
                        setLightbox({ index: card.index });
                      }}
                      aria-label={`Open ${album.title}`}
                    >
                      <div
                        className="library-node-image"
                        style={{
                          aspectRatio: `${card.width} / ${card.height}`
                        }}
                      >
                        {shouldRenderNodeImages ? (
                          <img
                            src={responsiveSrc(album.src)}
                            srcSet={responsiveSrcSet(album.src)}
                            sizes={`${Math.ceil(card.width)}px`}
                            alt={album.title}
                            loading={useCompactNodes ? "eager" : order < 10 ? "eager" : "lazy"}
                            decoding="async"
                          />
                        ) : (
                          <div className="library-node-image-placeholder" aria-hidden="true" />
                        )}
                      </div>
                      {!useCompactNodes ? (
                        <span className="library-node-title">
                          <span className="library-node-dot" aria-hidden="true" />
                          {album.title}
                        </span>
                      ) : null}
                    </motion.button>
                  );
                })}
              </motion.div>

            </div>

            {showOverviewLoader ? (
              <div
                className="library-overview-loader library-overlay-box"
                role="status"
                aria-live="polite"
                aria-label={`Image loading ${overviewLoadProgress}%`}
              >
                <span className="library-overview-wheel" aria-hidden="true" />
                <span className="library-overview-progress">{overviewLoadProgress}%</span>
              </div>
            ) : null}

            <div className="library-instruction library-overlay-box" aria-hidden="true">
              <span>Click &amp; Drag</span>
            </div>

            <div className="library-position library-overlay-box" aria-hidden="true">
              <span>x: {Math.round(canvasPosition.x)}</span>
              <span>y: {Math.round(canvasPosition.y)}</span>
            </div>

            <div className="library-zoom-controls">
              <button
                type="button"
                className="library-zoom-button"
                onMouseDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  applyZoom(Number((zoomLevel + ZOOM_STEP).toFixed(2)))
                }
                disabled={!canZoomIn}
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                className="library-zoom-button"
                onMouseDown={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  applyZoom(Number((zoomLevel - ZOOM_STEP).toFixed(2)))
                }
                disabled={!canZoomOut}
                aria-label="Zoom out"
              >
                −
              </button>
            </div>
          </div>
        </div>
      </section>

      {hasFinePointer && cursorVisible && !lightbox ? (
        <motion.div
          className="library-custom-cursor"
          style={{
            left: cursorX,
            top: cursorY
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {cursorHoveringNode ? (
              <motion.div
                key="hover"
                className="library-custom-cursor-hover"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span>Click to Enlarge</span>
                <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M4.5 3L7.5 6L4.5 9"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                className="library-custom-cursor-default"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : null}

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
          <figure>
            <img
              src={
                isHd
                  ? withBasePath(albums[lightbox.index].src)
                  : responsiveSrc(albums[lightbox.index].src)
              }
              srcSet={isHd ? undefined : responsiveSrcSet(albums[lightbox.index].src)}
              sizes={isHd ? undefined : "(max-width: 900px) 96vw, 80vw"}
              alt={albums[lightbox.index].title}
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
      )}
    </>
  );
}
