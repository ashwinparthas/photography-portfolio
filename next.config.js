/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'export',
  // Use a plain object so GitHub's configure-pages step can parse/inject safely
  basePath: process.env.NODE_ENV === 'production' ? '/photography-portfolio' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/photography-portfolio' : '',
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/photography-portfolio' : ''
  }
};
