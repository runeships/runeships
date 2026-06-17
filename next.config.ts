import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production source maps so client-side React errors show the
  // actual component + line number instead of minified noise like
  // 'at D (1255-...js:1:102803)'. Tradeoff: slightly larger
  // deployment artifact and source maps are publicly fetchable
  // (which only reveals already-public client code).
  productionBrowserSourceMaps: true,
};

export default nextConfig;
