/**
 * scripts/crop-logo.ts
 *
 * One-time crop of public/brand/runeships-source.png into three brand
 * assets + a 32x32 favicon. Run with:
 *
 *   npx tsx scripts/crop-logo.ts
 *
 * The source is white-on-white artwork; we strip the white background
 * to transparent so each lockup sits cleanly on whatever section bg
 * (cream, parchment, ink) it lands on. The favicon is then re-composited
 * onto a cream square so it reads in a browser tab.
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

// Bounds tuned for the 1254×1254 white-bg artwork.
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
    // Bumped yEnd from 0.62 → 0.68 to keep the wordmark descenders.
    name: "stacked",
    outPath: "public/brand/runeships-stacked.png",
    xStart: 0.17,
    xEnd: 0.83,
    yStart: 0.06,
    yEnd: 0.68,
  },
  {
    name: "horizontal",
    outPath: "public/brand/runeships-horizontal.png",
    xStart: 0.18,
    xEnd: 0.82,
    yStart: 0.74,
    yEnd: 0.95,
  },
];

/**
 * Replace pure-white background with transparency. Soft thresholding
 * keeps anti-aliased edges of the dark / oxblood ink from going chalky.
 *
 * Logic per pixel (from min channel value):
 *   min ≥ 245 → fully transparent (background)
 *   220–245  → linear alpha fade (anti-aliased edge)
 *   < 220    → fully opaque (ink)
 */
function stripWhite(data: Buffer): Buffer {
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const min = Math.min(out[i], out[i + 1], out[i + 2]);
    if (min >= 245) {
      out[i + 3] = 0;
    } else if (min >= 220) {
      out[i + 3] = Math.round(255 * (245 - min) / 25);
    }
    // else: keep original alpha (255 after ensureAlpha)
  }
  return out;
}

async function cropAndKey(
  source: string,
  extract: { left: number; top: number; width: number; height: number },
  outPath: string,
) {
  const { data, info } = await sharp(source)
    .extract(extract)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const transparentBuf = stripWhite(data);

  await sharp(transparentBuf, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  return await sharp(outPath).metadata();
}

async function main() {
  const meta = await sharp(SOURCE).metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) {
    throw new Error(`Could not read dimensions from ${SOURCE}`);
  }

  console.log(`Source: ${SOURCE}`);
  console.log(`  ${width} × ${height} (${meta.format})\n`);

  for (const region of REGIONS) {
    const left = Math.round(region.xStart * width);
    const top = Math.round(region.yStart * height);
    const right = Math.round(region.xEnd * width);
    const bottom = Math.round(region.yEnd * height);
    const w = right - left;
    const h = bottom - top;

    const outMeta = await cropAndKey(
      SOURCE,
      { left, top, width: w, height: h },
      region.outPath,
    );
    console.log(
      `${region.name.padEnd(12)} → ${region.outPath.padEnd(42)} (${outMeta.width} × ${outMeta.height}, transparent)`,
    );
  }

  // Favicon: 32×32 cream-bg square with the transparent glyph centered.
  const faviconOut = "public/favicon.ico";
  await sharp("public/brand/runeships-glyph.png")
    .resize(32, 32, {
      fit: "contain",
      background: { r: 250, g: 250, b: 247, alpha: 0 },
    })
    .flatten({ background: { r: 250, g: 250, b: 247 } })
    .png({ compressionLevel: 9 })
    .toFile(faviconOut);

  const faviconMeta = await sharp(faviconOut).metadata();
  console.log(
    `${"favicon".padEnd(12)} → ${faviconOut.padEnd(42)} (${faviconMeta.width} × ${faviconMeta.height}, cream-bg)`,
  );

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
