/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/pua_memorial',
  assetPrefix: '/pua_memorial/',
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
