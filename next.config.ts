import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.0.105"],
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }], afterFiles: [], fallback: [] };
  },
  async headers() {
    return ["/", "/index.html"].map(source => ({ source, headers: [{ key: "X-KenyalangKu-Company", value: "enabled" }] }));
  },
};

export default nextConfig;
