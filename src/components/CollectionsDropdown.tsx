"use client";

import Link from "next/link";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);
  const menuId = `collections-menu-${links
    .map((item) => item.label.toLowerCase().replace(/\s+/g, "-"))
    .join("-")}`;

  return (
    <div className={`${className ?? ""} artist-collections${open ? " is-open" : ""}`.trim()}>
      <button
        type="button"
        className="artist-collections-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
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
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
