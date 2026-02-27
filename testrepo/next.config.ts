import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  rewrites: async () => {
    return [
      {
        source: '/api/flask/:path*',
        destination: '/backend/app.py',
      }
    ]
  }
};

export default nextConfig;
