import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  globPatterns: ["**/*.{js,css,woff2}"],
  globIgnores: ["**/node_modules/**/*", ".next/**/*"],
});

export default withSerwist({});
