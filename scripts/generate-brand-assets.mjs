/**
 * Builds Android launcher icons, splash drawables, and web favicon
 * from assets/brand/icon-master.jpg and splash-master.jpg.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const brandDir = path.join(root, 'assets', 'brand');
const iconMaster = path.join(brandDir, 'icon-master.jpg');
const splashMaster = path.join(brandDir, 'splash-master.jpg');
const androidRes = path.join(root, 'android', 'app', 'src', 'main', 'res');
const publicDir = path.join(root, 'public');

const ICON_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const SPLASH_PORT = {
  'drawable-port-mdpi': [320, 480],
  'drawable-port-hdpi': [480, 800],
  'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [960, 1600],
  'drawable-port-xxxhdpi': [1280, 1920],
};

const SPLASH_LAND = {
  'drawable-land-mdpi': [480, 320],
  'drawable-land-hdpi': [800, 480],
  'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960],
  'drawable-land-xxxhdpi': [1920, 1280],
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function writePng(pipeline, outPath) {
  ensureDir(path.dirname(outPath));
  await pipeline.png().toFile(outPath);
  console.log('wrote', path.relative(root, outPath));
}

async function main() {
  if (!fs.existsSync(iconMaster) || !fs.existsSync(splashMaster)) {
    throw new Error('Missing assets/brand/icon-master.jpg or splash-master.jpg');
  }

  // Square masters for icons / favicon
  const iconSq = await sharp(iconMaster)
    .resize(1024, 1024, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  await writePng(sharp(iconSq), path.join(brandDir, 'icon-1024.png'));
  ensureDir(publicDir);
  await writePng(sharp(iconSq).resize(180, 180), path.join(publicDir, 'apple-touch-icon.png'));
  await writePng(sharp(iconSq).resize(32, 32), path.join(publicDir, 'favicon-32.png'));
  await writePng(sharp(iconSq).resize(192, 192), path.join(publicDir, 'icon-192.png'));

  for (const [folder, size] of Object.entries(ICON_SIZES)) {
    const dir = path.join(androidRes, folder);
    const resized = sharp(iconSq).resize(size, size);
    await writePng(resized.clone(), path.join(dir, 'ic_launcher.png'));
    await writePng(resized.clone(), path.join(dir, 'ic_launcher_round.png'));
    await writePng(resized.clone(), path.join(dir, 'ic_launcher_foreground.png'));
  }

  // Portrait splash
  const splashBuf = await sharp(splashMaster).png().toBuffer();
  await writePng(
    sharp(splashBuf).resize(1080, 1920, { fit: 'cover', position: 'centre' }),
    path.join(brandDir, 'splash-portrait-1080x1920.png'),
  );

  for (const [folder, [w, h]] of Object.entries(SPLASH_PORT)) {
    await writePng(
      sharp(splashBuf).resize(w, h, { fit: 'cover', position: 'centre' }),
      path.join(androidRes, folder, 'splash.png'),
    );
  }

  for (const [folder, [w, h]] of Object.entries(SPLASH_LAND)) {
    await writePng(
      sharp(splashBuf).resize(w, h, { fit: 'cover', position: 'centre' }),
      path.join(androidRes, folder, 'splash.png'),
    );
  }

  await writePng(
    sharp(splashBuf).resize(480, 800, { fit: 'cover', position: 'centre' }),
    path.join(androidRes, 'drawable', 'splash.png'),
  );

  console.log('Brand assets generated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
