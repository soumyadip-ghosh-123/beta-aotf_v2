/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["unproductive-superuniversally-lizbeth.ngrok-free.dev"],

  // Performance optimizations
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // wildcard: allows all domains
      },
    ],
    formats: ["image/webp", "image/avif"],
  },

  // API body size limit (default is 1MB; explicit for clarity)
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb",
    },
  },

  // Security headers
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          // HSTS: force HTTPS for 1 year (only in production)
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
          // Content-Security-Policy: mitigate XSS
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Clerk serves its runtime from subdomains like *.clerk.accounts.dev.
              // Keep dev unsafe-eval for Next HMR while allowing Clerk script origins.
              isProd
                ? "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.dev https://hcaptcha.com https://*.hcaptcha.com https://challenges.cloudflare.com https://checkout.razorpay.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.dev https://hcaptcha.com https://*.hcaptcha.com https://challenges.cloudflare.com https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline'", // HeroUI uses inline styles
              "img-src 'self' data: https: blob:", // allow remote images
              "font-src 'self' data:",
              "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://api.clerk.com https://clerk-telemetry.com https://hcaptcha.com https://*.hcaptcha.com https://challenges.cloudflare.com https://lumberjack.razorpay.com https://api.razorpay.com https:",
              "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev https://hcaptcha.com https://*.hcaptcha.com https://challenges.cloudflare.com https://api.razorpay.com https://checkout.razorpay.com",
              "frame-ancestors 'none'", // equivalent to X-Frame-Options DENY
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
