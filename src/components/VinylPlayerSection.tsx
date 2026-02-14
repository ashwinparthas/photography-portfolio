"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import VinylPlayerApp from "@/components/vinyl/VinylPlayerApp";
import { withBasePath } from "@/lib/basePath";

export default function VinylPlayerSection() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    let cssLink = shadow.querySelector<HTMLLinkElement>('link[data-vinyl-css="true"]');
    if (!cssLink) {
      cssLink = document.createElement("link");
      cssLink.setAttribute("rel", "stylesheet");
      cssLink.setAttribute("href", withBasePath("/vinyl-player.css"));
      cssLink.setAttribute("data-vinyl-css", "true");
      shadow.appendChild(cssLink);
    }

    let portalMount = shadow.querySelector<HTMLDivElement>('div[data-vinyl-mount="true"]');
    if (!portalMount) {
      portalMount = document.createElement("div");
      portalMount.setAttribute("data-vinyl-mount", "true");
      portalMount.style.width = "100%";
      portalMount.style.height = "100%";
      shadow.appendChild(portalMount);
    }
    setMountNode(portalMount);

    return () => {
      setMountNode(null);
    };
  }, []);

  return (
    <section className="vinyl-entry" aria-label="Vinyl Player">
      <div ref={hostRef} className="vinyl-entry-frame" />
      {mountNode ? createPortal(<VinylPlayerApp />, mountNode) : null}
    </section>
  );
}
