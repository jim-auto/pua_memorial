import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { request } from 'playwright';

const outDir = path.join(process.cwd(), 'public', 'assets', 'visual-novel');

const baseStyle = [
  'modern Japanese visual novel game art',
  'polished 2D illustration',
  'semi-realistic anime style',
  'cinematic nighttime lighting',
  'clean composition',
  'expressive natural adult characters',
  'no readable text',
  'no brand logos',
  'no watermark',
].join(', ');

const sharedScene = [
  'night street near Shibuya Tokyo after light rain',
  'wet pavement with neon reflections',
  'crosswalk lines and storefront glow',
  'soft city haze',
  'young adult Japanese man on the left in a casual dark jacket holding a smartphone',
  'young adult Japanese woman on the right in a cream coat holding a smartphone',
  'both full body, standing at a respectful conversation distance',
  'wide visual novel background scene with characters integrated',
  baseStyle,
].join(', ');

const assets = [
  {
    file: 'scene-neutral.png',
    seed: 41010,
    prompt: `${sharedScene}, neutral conversation mood, the woman is calm but guarded, the man is slightly nervous, balanced distance, moody teal amber rose and indigo lights`,
  },
  {
    file: 'scene-good.png',
    seed: 41011,
    prompt: `${sharedScene}, warm successful conversation mood, the woman has a small natural smile and relaxed posture, the man looks relieved, slightly warmer lighting, comfortable distance, moody teal amber rose and indigo lights`,
  },
  {
    file: 'scene-bad.png',
    seed: 41012,
    prompt: `${sharedScene}, cautious uncomfortable conversation mood, the woman is guarded and angled slightly away, the man keeps distance and looks tense, cooler lighting with subtle rose warning accent, moody teal amber rose and indigo lights`,
  },
];

const buildUrl = ({ prompt, seed }) => {
  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  url.searchParams.set('width', '1280');
  url.searchParams.set('height', '720');
  url.searchParams.set('model', 'flux');
  url.searchParams.set('nologo', 'true');
  url.searchParams.set('enhance', 'true');
  url.searchParams.set('seed', String(seed));
  return url.toString();
};

await mkdir(outDir, { recursive: true });

const client = await request.newContext({
  timeout: 240_000,
  userAgent: 'pua-memorial-asset-generator/1.0',
});

try {
  for (const asset of assets) {
    const url = buildUrl(asset);
    console.log(`Generating ${asset.file}`);

    const response = await client.get(url, {
      timeout: 240_000,
      headers: {
        Accept: 'image/png,image/jpeg,image/*;q=0.9,*/*;q=0.1',
      },
    });

    if (!response.ok()) {
      const body = await response.text().catch(() => '');
      throw new Error(`Generation failed for ${asset.file}: ${response.status()} ${response.statusText()} ${body.slice(0, 240)}`);
    }

    const contentType = response.headers()['content-type'] ?? '';
    const body = await response.body();

    if (!contentType.startsWith('image/') || body.length < 1024) {
      const bodyPreview = body.toString('utf8', 0, Math.min(body.length, 240));
      throw new Error(`Unexpected response for ${asset.file}: ${contentType} ${bodyPreview}`);
    }

    const outputPath = path.join(outDir, asset.file);
    await writeFile(outputPath, body);
    console.log(`Saved ${outputPath}`);
  }
} finally {
  await client.dispose();
}
