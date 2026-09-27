import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // playwright-core reads browsers.json/package.json via a runtime-computed
  // path.join(), and @sparticuz/chromium's actual browser binary
  // (bin/*.br) is only ever referenced by a computed path too — neither is
  // visible to the automatic file tracer, so both get dropped from the
  // deployed function bundle unless forced in.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/playwright-core/**", "./node_modules/@sparticuz/chromium/**"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
