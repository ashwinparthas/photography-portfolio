"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, type MouseEvent } from "react";

type FooterLink = {
  label: string;
  href: string;
};

type SubpageFooterProps = {
  links?: FooterLink[];
  splitAfter?: number;
};

export default function SubpageFooter({
  links = [],
  splitAfter = links.length
}: SubpageFooterProps) {
  const scrollFrameRef = useRef<number>(0);
  const interruptionCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
      interruptionCleanupRef.current?.();
      interruptionCleanupRef.current = null;
    };
  }, []);

  const handleTopClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    smoothScrollToPosition(0, "#top");
  };

  const stopActiveScroll = () => {
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = 0;
    }
    interruptionCleanupRef.current?.();
    interruptionCleanupRef.current = null;
  };

  const smoothScrollToPosition = (targetY: number, hash: string) => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
      window.history.pushState(null, "", hash);
      return;
    }

    stopActiveScroll();

    const startY = window.scrollY;
    const distance = targetY - startY;
    const distanceAbs = Math.abs(distance);

    if (distanceAbs < 1) {
      window.history.pushState(null, "", hash);
      return;
    }

    const durationMs = Math.min(3200, Math.max(1100, distanceAbs * 1.05));
    const startTime = performance.now();
    const easeInOutSine = (progress: number) =>
      -(Math.cos(Math.PI * progress) - 1) / 2;
    let interrupted = false;

    const stopOnInteraction = () => {
      interrupted = true;
      stopActiveScroll();
      removeInterruptionListeners();
    };

    const removeInterruptionListeners = () => {
      window.removeEventListener("wheel", stopOnInteraction);
      window.removeEventListener("touchstart", stopOnInteraction);
      window.removeEventListener("mousedown", stopOnInteraction);
      window.removeEventListener("keydown", stopOnInteraction);
      interruptionCleanupRef.current = null;
    };

    window.addEventListener("wheel", stopOnInteraction, { passive: true });
    window.addEventListener("touchstart", stopOnInteraction, { passive: true });
    window.addEventListener("mousedown", stopOnInteraction, { passive: true });
    window.addEventListener("keydown", stopOnInteraction);
    interruptionCleanupRef.current = removeInterruptionListeners;

    const animate = (currentTime: number) => {
      if (interrupted) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeInOutSine(progress);
      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        scrollFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      removeInterruptionListeners();
      scrollFrameRef.current = 0;
      window.history.pushState(null, "", hash);
    };

    scrollFrameRef.current = requestAnimationFrame(animate);
  };

  const handleHashLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    const targetId = href.replace(/^#/, "");
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;
    const targetY = targetElement.getBoundingClientRect().top + window.scrollY;
    smoothScrollToPosition(targetY, href);
  };

  const primaryLinks = useMemo(() => links.slice(0, splitAfter), [links, splitAfter]);
  const secondaryLinks = useMemo(() => links.slice(splitAfter), [links, splitAfter]);

  return (
    <footer className="artist-subpage-footer" aria-label="Subpage footer">
      <div className="artist-subpage-footer-inner">
        <div className="artist-header-rule artist-subpage-footer-rule" aria-hidden="true" />
        <div className="artist-subpage-footer-bar">
          <p className="artist-subpage-footer-name">Ashwin</p>
          <nav className="artist-subpage-link-stack" aria-label="Footer links">
            <div className="artist-subpage-link-group">
              <a href="#top" className="artist-subpage-aux-link" onClick={handleTopClick}>
                Header
              </a>
              {primaryLinks.map((item) =>
                item.href.startsWith("#") ? (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className="artist-subpage-aux-link"
                    onClick={(event) => handleHashLinkClick(event, item.href)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className="artist-subpage-aux-link"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </div>
            {secondaryLinks.length > 0 && (
              <div className="artist-subpage-link-group artist-subpage-link-group-spaced">
                {secondaryLinks.map((item) => (
                  <Link
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    className="artist-subpage-aux-link"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
