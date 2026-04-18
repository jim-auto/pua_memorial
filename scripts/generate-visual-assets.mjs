import { access, copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { request } from 'playwright';

const outDir = path.join(process.cwd(), 'public', 'assets', 'visual-novel');
const force = process.env.FORCE_ART === '1';

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

const locations = {
  shibuya: {
    seedBase: 41010,
    backdrop: 'night street near Shibuya Tokyo after light rain, wet pavement with neon reflections, crosswalk lines, storefront glow, soft city haze',
    woman: 'young adult Japanese woman on the right in a cream coat holding a smartphone',
    palette: 'moody teal amber rose and indigo lights',
  },
  kabukicho: {
    seedBase: 42010,
    backdrop: 'night entrance street in Kabukicho Tokyo after rain, dense red and magenta neon glow, narrow entertainment district street, reflective pavement, distant pedestrians as vague silhouettes only, no readable signs',
    woman: 'young adult Japanese woman on the right in a black coat with a small silver bag and sharp city styling, holding a smartphone',
    palette: 'deep black, red neon, magenta, cyan rim light',
  },
  ikebukuro: {
    seedBase: 43010,
    backdrop: 'Ikebukuro west exit station plaza at night after rain, broad sidewalk, station lights, bus lane reflections, vending machine glow, distant commuters as vague silhouettes only, no readable signs',
    woman: 'young adult Japanese woman on the right in a taupe trench coat and dark skirt, holding a smartphone',
    palette: 'warm amber station light, green accents, blue street shadows',
  },
  club: {
    seedBase: 44010,
    backdrop: 'Tokyo nightclub entrance at night, dark doorway, velvet rope silhouette, saturated blue purple and pink lights, wet pavement, distant party crowd as vague silhouettes only, no readable signs',
    woman: 'young adult Japanese woman on the right in a stylish jacket over a simple nightlife outfit, tasteful and not revealing, holding a smartphone',
    palette: 'electric blue, hot pink, violet, black shadows',
  },
};

const moods = {
  neutral: {
    seedOffset: 0,
    prompt: 'neutral conversation mood, the woman is calm but guarded, the man is slightly nervous, balanced distance',
  },
  good: {
    seedOffset: 1,
    prompt: 'warm successful conversation mood, the woman has a small natural smile and relaxed posture, the man looks relieved, comfortable distance',
  },
  bad: {
    seedOffset: 2,
    prompt: 'cautious uncomfortable conversation mood, the woman is guarded and angled slightly away, the man keeps respectful distance and looks tense, cooler warning accent',
  },
};

const buildPrompt = (location, mood) => [
  location.backdrop,
  'young adult Japanese man on the left in a casual dark jacket holding a smartphone',
  location.woman,
  'both full body, standing at a respectful conversation distance',
  'wide visual novel background scene with characters integrated',
  mood.prompt,
  location.palette,
  baseStyle,
].join(', ');

const assets = Object.entries(locations).flatMap(([key, location]) =>
  Object.entries(moods).map(([moodName, mood]) => ({
    file: `scene-${key}-${moodName}.png`,
    seed: location.seedBase + mood.seedOffset,
    prompt: buildPrompt(location, mood),
  })),
);

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

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

await mkdir(outDir, { recursive: true });

for (const moodName of Object.keys(moods)) {
  const legacyFile = path.join(outDir, `scene-${moodName}.png`);
  const shibuyaFile = path.join(outDir, `scene-shibuya-${moodName}.png`);

  if ((await exists(legacyFile)) && (force || !(await exists(shibuyaFile)))) {
    await copyFile(legacyFile, shibuyaFile);
    console.log(`Copied ${path.basename(legacyFile)} to ${path.basename(shibuyaFile)}`);
  }
}

const client = await request.newContext({
  timeout: 240_000,
  userAgent: 'pua-memorial-asset-generator/1.0',
});

try {
  for (const asset of assets) {
    const outputPath = path.join(outDir, asset.file);

    if (!force && (await exists(outputPath))) {
      console.log(`Skipping existing ${asset.file}`);
      continue;
    }

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

    await writeFile(outputPath, body);
    console.log(`Saved ${outputPath}`);
  }
} finally {
  await client.dispose();
}
