import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

async function makeIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#080814"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.38}" fill="none" stroke="#FF6B35" stroke-width="${size * 0.06}"/>
      <polygon points="${size * 0.5},${size * 0.22} ${size * 0.72},${size * 0.62} ${size * 0.28},${size * 0.62}" fill="#FFD60A"/>
    </svg>
  `;
  await sharp(Buffer.from(svg)).png().toFile(join(publicDir, `icon-${size}.png`));
  console.log(`Wrote icon-${size}.png`);
}

await makeIcon(192);
await makeIcon(512);
