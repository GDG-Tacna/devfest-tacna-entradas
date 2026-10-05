import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los PNG/TTF se leen con fs al generar las imágenes; asegura que viajen al deploy.
  outputFileTracingIncludes: {
    "/entrada/**": ["./assets/**"],
  },
};

export default nextConfig;
