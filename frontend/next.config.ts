import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.punchng.com" },
      { protocol: "https", hostname: "**.vanguardngr.com" },
      { protocol: "https", hostname: "**.premiumtimesng.com" },
      { protocol: "https", hostname: "**.dailypost.ng" },
      { protocol: "https", hostname: "**.pmnewsnigeria.com" },
      { protocol: "https", hostname: "i0.wp.com" },
      { protocol: "https", hostname: "i1.wp.com" },
      { protocol: "https", hostname: "i2.wp.com" },
    ],
  },
};

export default nextConfig;
