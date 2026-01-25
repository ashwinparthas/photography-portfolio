const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBasePath = (path: string) => {
  if (!path) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!BASE_PATH) {
    return normalizedPath;
  }

  if (
    normalizedPath === BASE_PATH ||
    normalizedPath.startsWith(`${BASE_PATH}/`)
  ) {
    return normalizedPath;
  }

  return `${BASE_PATH}${normalizedPath}`;
};
