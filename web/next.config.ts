import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

export default withSerwist({
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.openfoodfacts.org",
      },
    ],
  },
});
