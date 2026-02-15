"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type CollectionLink = {
  label: string;
  href: string;
};

type CollectionsDropdownProps = {
  className?: string;
  links: readonly CollectionLink[];
};

export default function CollectionsDropdown({
  className,
  links
}: CollectionsDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());
  const menuId = `collections-menu-${links
    .map((item) => item.label.toLowerCase().replace(/\s+/g, "-"))
    .join("-")}`;

  const prefetchRoute = useCallback(
    (href: string) => {
      if (prefetchedRoutesRef.current.has(href)) return;
      prefetchedRoutesRef.current.add(href);
      router.prefetch(href);
    },
    [router]
  );

  const prefetchAllRoutes = useCallback(() => {
    links.forEach((item) => prefetchRoute(item.href));
  }, [links, prefetchRoute]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let idleId = 0;
    let timeoutId: number | null = null;
    const onIdle =
      "requestIdleCallback" in window
        ? (window as Window & { requestIdleCallback: (cb: () => void) => number })
            .requestIdleCallback(() => prefetchAllRoutes())
        : 0;

    if (onIdle) {
      idleId = onIdle;
    } else {
      timeoutId = window.setTimeout(() => prefetchAllRoutes(), 220);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) {
        (
          window as Window & { cancelIdleCallback: (id: number) => void }
        ).cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [prefetchAllRoutes]);

  return (
    <div className={`${className ?? ""} artist-collections${open ? " is-open" : ""}`.trim()}>
      <button
        type="button"
        className="artist-collections-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={prefetchAllRoutes}
        onFocus={prefetchAllRoutes}
        onTouchStart={prefetchAllRoutes}
      >
        Collections
      </button>
      <div className="artist-collections-panel">
        <nav id={menuId} className="artist-collections-menu" aria-label="Collections">
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="artist-collections-link"
              onClick={() => setOpen(false)}
              onMouseEnter={() => prefetchRoute(item.href)}
              onFocus={() => prefetchRoute(item.href)}
              onTouchStart={() => prefetchRoute(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
