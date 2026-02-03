import { withBasePath } from "@/lib/basePath";

const RESPONSIVE_SUFFIX = "w70";

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

const withQualitySuffix = (src: string) => {
  const { base, ext } = splitExt(src);
  return `${base}-${RESPONSIVE_SUFFIX}${ext}`;
};

export const responsiveSrc = (src: string) =>
  withBasePath(withQualitySuffix(src));

export const responsiveSrcSet = (src: string) =>
  `${responsiveSrc(src)} 1x`;
