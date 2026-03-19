/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yazol-coffee-assets-2e7ee371.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
