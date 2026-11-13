/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build autonome pour l'image Docker (voir frontend/Dockerfile)
  output: "standalone",
};

export default nextConfig;
