const { withSentryConfig } = require("@sentry/nextjs");

const securityHeaders = [
  { key: "X-Frame-Options",           value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(self), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Google Translate requires unsafe-inline for the init callback script
      "script-src 'self' 'unsafe-inline' translate.google.com translate.googleapis.com *.sentry.io cdn.paddle.com www.paypal.com www.paypalobjects.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "img-src 'self' data: blob: *.supabase.co translate.googleapis.com *.gstatic.com www.paypalobjects.com *.paypal.com",
      "connect-src 'self' *.supabase.co translate.googleapis.com api.anthropic.com *.sentry.io sandbox.paddle.com *.paypal.com",
      "frame-src translate.googleapis.com sandbox.paddle.com *.paypal.com",
      "font-src 'self' fonts.gstatic.com",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
