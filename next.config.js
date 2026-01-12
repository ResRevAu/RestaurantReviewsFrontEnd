/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
    ],
    domains: [
      "images.pexels.com",
      "images.unsplash.com",
      "a0.muscache.com",
      "www.gstatic.com",
      "flagcdn.com",
      "restaurantreviewsfrontend.netlify.app"
    ],
  },
  output: 'export',
  trailingSlash: false,
  staticPageGenerationTimeout: 180,
  // Exclude API routes from static export
  // API routes in app/api are automatically skipped with output: 'export'
};

module.exports = nextConfig;
