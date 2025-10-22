import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = path.resolve('public/portfolio');
const TARGET_LONG_EDGE = 1200;
const QUALITY = 62;

async function optimize() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('No public/portfolio directory found.');
    return;
  }

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .sort();

  if (!files.length) {
    console.warn('No JPG or PNG images found in', SRC_DIR);
    return;
  }

  for (const file of files) {
    const src = path.join(SRC_DIR, file);
    const baseName = file.replace(/\.(jpe?g|png)$/i, '');
    const avifOut = path.join(SRC_DIR, `${baseName}.avif`);
    const webpOut = path.join(SRC_DIR, `${baseName}.webp`);

    try {
      const meta = await sharp(src, { failOn: 'none' }).metadata();
      const width = meta.width ?? 0;
      const height = meta.height ?? 0;
      const longEdge = Math.max(width, height);

      const resizeOptions = {};
      if (longEdge > TARGET_LONG_EDGE) {
        if (width >= height) {
          resizeOptions.width = TARGET_LONG_EDGE;
        } else {
          resizeOptions.height = TARGET_LONG_EDGE;
        }
      }

      const createPipeline = () => {
        const instance = sharp(src, { failOn: 'none' }).rotate();
        return Object.keys(resizeOptions).length ? instance.resize(resizeOptions) : instance;
      };

      await Promise.all([
        createPipeline()
          .avif({ quality: QUALITY })
          .toFile(avifOut),
        createPipeline()
          .webp({ quality: QUALITY })
          .toFile(webpOut),
      ]);

      console.log('Optimized:', file, '→', path.basename(avifOut), 'and', path.basename(webpOut));
    } catch (error) {
      console.error('Failed to optimize', file, error);
    }
  }

  console.log('Done.');
}

optimize();
