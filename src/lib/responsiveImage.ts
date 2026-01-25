import { withBasePath } from "@/lib/basePath";

const RESPONSIVE_WIDTHS = [480, 960] as const;

const splitExt = (src: string) => {
  const lastSlash = src.lastIndexOf("/");
  const lastDot = src.lastIndexOf(".");
  if (lastDot <= lastSlash) {
    return { base: src, ext: "" };
  }
  return {
    base: src.slice(0, lastDot),
    ext: src.slice(lastDot)
  };
};

const withWidthSuffix = (src: string, width: number) => {
  const { base, ext } = splitExt(src);
  return `${base}-w${width}${ext}`;
};

export const responsiveSrc = (src: string, width = RESPONSIVE_WIDTHS[1]) =>
  withBasePath(withWidthSuffix(src, width));

export const responsiveSrcSet = (src: string) =>
  RESPONSIVE_WIDTHS.map(
    (width) => `${withBasePath(withWidthSuffix(src, width))} ${width}w`
  ).join(", ");
