/**
 * Generates PWA icons from the BrandMark ring (same look as the in-app logo).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/icons");

const BG = "#f7f6f4";
/** sRGB hex — must match globals.css macros; Sharp/librsvg cannot rasterize oklch(). */
const RINGS = [
  { color: "#e8604d", key: "kcal" }, // oklch(0.66 0.18 16)
  { color: "#5282d9", key: "pro" }, // oklch(0.62 0.16 252)
  { color: "#c9bc3a", key: "car" }, // oklch(0.74 0.15 74)
  { color: "#9458c6", key: "fat" }, // oklch(0.58 0.18 295)
];

/** @param {number} size @param {{ maskable?: boolean }} opts */
function buildBrandMarkSvg(size, { maskable = false } = {}) {
  const pad = maskable ? size * 0.14 : size * 0.11;
  const draw = size - pad * 2;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = Math.max(7, draw * 0.062);
  const ringGap = Math.max(2.5, stroke * 0.28);
  const maxR = draw / 2 - stroke / 2 - 1;

  const arcsFixed = RINGS.map(({ color }, i) => {
    const r = maxR - i * (stroke + ringGap);
    const C = 2 * Math.PI * r;
    const seg = C / 4;
    const dashGap = Math.max(2, C * 0.012);
    const dash = seg - dashGap;
    return `
    <g transform="rotate(-90 ${cx} ${cy})">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" opacity="0.2" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${dash} ${C - dash + 1}" stroke-dashoffset="${-seg * i}" />
    </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <g transform="rotate(-45 ${cx} ${cy})">
    ${arcsFixed}
  </g>
</svg>`;
}

async function writePng(svg, path, size) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .flatten({ background: BG })
    .png()
    .toFile(path);
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const svg192 = buildBrandMarkSvg(192);
  const svg512 = buildBrandMarkSvg(512);
  const svg192Mask = buildBrandMarkSvg(192, { maskable: true });
  const svg512Mask = buildBrandMarkSvg(512, { maskable: true });

  writeFileSync(join(OUT, "icon-192.svg"), svg192);
  writeFileSync(join(OUT, "icon-512.svg"), svg512);
  writeFileSync(join(OUT, "icon-192-maskable.svg"), svg192Mask);
  writeFileSync(join(OUT, "icon-512-maskable.svg"), svg512Mask);

  await writePng(svg192, join(OUT, "icon-192.png"), 192);
  await writePng(svg512, join(OUT, "icon-512.png"), 512);
  await writePng(svg192Mask, join(OUT, "icon-192-maskable.png"), 192);
  await writePng(svg512Mask, join(OUT, "icon-512-maskable.png"), 512);
  await writePng(buildBrandMarkSvg(180), join(OUT, "apple-touch-icon.png"), 180);
  // iOS Safari also probes /apple-touch-icon.png at site root
  await writePng(
    buildBrandMarkSvg(180),
    join(__dirname, "../public/apple-touch-icon.png"),
    180
  );

  // Favicon
  await writePng(buildBrandMarkSvg(32), join(OUT, "favicon-32.png"), 32);

  console.log("PWA icons written to public/icons/ and public/apple-touch-icon.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
