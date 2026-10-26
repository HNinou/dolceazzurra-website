// 1200x630 Open Graph image per live locale, cropped from the hero photo at build time.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { APIRoute } from 'astro';
import { liveCodes } from '../../lib/i18n';
import { photo } from '../../lib/photos';

export const getStaticPaths = () => liveCodes.map((locale) => ({ params: { locale } }));

export const GET: APIRoute = async () => {
  const src = path.join(process.cwd(), 'src', 'assets', 'photos', photo('01').file);
  const buf = await sharp(fs.readFileSync(src)).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/jpeg' } });
};
