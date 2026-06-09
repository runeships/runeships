/**
 * scripts/crop-logo.ts
 *
 * One-time crop of public/brand/runeships-source.png into three brand
 * assets + a 32x32 favicon. Run with:
 *
 *   npx tsx scripts/crop-logo.ts
 *
 * Re-run any time the source PNG changes. Bounds are explicit fractions
 * of the source — adjust the constants below if the source artwork
 * changes proportions.
 */
import sharp from "sharp";

const SOURCE = "public/brand/runeships-source.png";

type Region = {
  name: string;
  outPath: string;
  /** Bounds as fractions of source width/height. */
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};

// Bounds tuned for the 1254×1254 ChatGPT-generated source.
// Glyph + stacked lockup share the same top-left corner; horizontal
// lockup sits below them with its own bounds.
const REGIONS: Region[] = [
  {
    name: "glyph",
    outPath: "public/brand/runeships-glyph.png",
    xStart: 0.31,
    xEnd: 0.69,
    yStart: 0.06,
    yEnd: 0.45,
  },
  {
    name: "stacked",
    outPath: "public/brand/runeships-stacked.png",
    xStart: 0.17,
    xEnd: 0.83,
    yStart: 0.06,
    yEnd: 0.62,
  },
  {
    name: "horizontal",
    outPath: "public/brand/runeships-horizontal.png",
    xStart: 0.18,
    xEnd: 0.82,
    yStart: 0.67,
    yEnd: 0.88,
  },
];

async function main() {
  const meta = await sharp(SOURCE).metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) {
    throw new Error(`Could not read dimensions from ${SOURCE}`);
  }

  console.log(`Source: ${SOURCE}`);
  console.log(
    `  ${width} × ${height} (${meta.format}, density ${meta.density ?? "?"} DPI)\n`,
  );

  for (const region of REGIONS) {
    const left = Math.round(region.xStart * width);
    const top = Math.round(region.yStart * height);
    const rightPx = Math.round(region.xEnd * width);
    const bottomPx = Math.round(region.yEnd * height);
    const w = rightPx - left;
    const h = bottomPx - top;

    await sharp(SOURCE)
      .extract({ left, top, width: w, height: h })
      .png({ compressionLevel: 9 })
      .toFile(region.outPath);

    const outMeta = await sharp(region.outPath).metadata();
    console.log(
      `${region.name.padEnd(12)} → ${region.outPath.padEnd(42)} (${outMeta.width} × ${outMeta.height})`,
    );
  }

  // Favicon: 32×32 from the glyph, cream background preserved.
  const faviconOut = "public/favicon.ico";
  await sharp("public/brand/runeships-glyph.png")
    .resize(32, 32, {
      fit: "contain",
      background: { r: 250, g: 250, b: 247, alpha: 1 },
    })
    .png({ compressionLevel: 9 })
    .toFile(faviconOut);

  const faviconMeta = await sharp(faviconOut).metadata();
  console.log(
    `${"favicon".padEnd(12)} → ${faviconOut.padEnd(42)} (${faviconMeta.width} × ${faviconMeta.height})`,
  );

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
