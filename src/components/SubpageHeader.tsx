"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import CollectionsDropdown from "@/components/CollectionsDropdown";

const CATEGORY_LINKS = [
  { label: "Landscape", href: "/landscape" },
  { label: "Nature", href: "/nature" },
  { label: "Street", href: "/street" }
] as const;

const FooterGradientShader = dynamic(
  () => import("@/components/FooterGradientShader"),
  { ssr: false }
);

type SubpageHeaderProps = {
  pageLabel: string;
  overlay?: boolean;
};

export default function SubpageHeader({
  pageLabel,
  overlay = false
}: SubpageHeaderProps) {
  const scrollFrameRef = useRef<number>(0);
  const interruptionCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
      interruptionCleanupRef.current?.();
      interruptionCleanupRef.current = null;
    };
  }, []);

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

  return (
    <div className={`artist-subpage-header-wrap${overlay ? " is-overlay" : ""}`}>
      <header className="artist-subpage-header artist-subpage-header-minimal">
        <div className="artist-header-gradient" aria-hidden="true">
          <FooterGradientShader />
        </div>
        <Link href="/" className="artist-wordmark artist-subpage-wordmark">
          Ashwin
          <br />
          Parthasarathy
        </Link>
        <CollectionsDropdown
          className="artist-nav artist-subpage-nav"
          links={CATEGORY_LINKS}
        />
        <a
          href="#reveal"
          className="artist-subpage-reveal-link"
          onClick={(event) => handleHashLinkClick(event, "#reveal")}
        >
          Reveal It
        </a>
        <p className="artist-subpage-current">{pageLabel}</p>
      </header>
      <div className="artist-header-rule artist-subpage-rule" />
    </div>
  );
}
