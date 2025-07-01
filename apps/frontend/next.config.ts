/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ajout pour forcer la variable d'environnement
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      "pk_test_51RZKIDD1hakSg7lb2uNbmk98UOGNruJD2vrF1N2Fbh55sct3eBeZhfF0bagGHzol8MkbMAr4SaMvFsarJRt6ZiQx00UjcDqCoN",
  },
  experimental: {
    // topLevelAwait: true, // Option dépréciée
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
