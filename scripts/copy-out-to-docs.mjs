import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'out');
const docsDir = path.join(root, 'docs');
const basePathName = 'pua_memorial';
const localBasePathDir = path.join(outDir, basePathName);

if (!existsSync(outDir)) {
  throw new Error('Next export output was not found at ./out');
}

await writeFile(path.join(outDir, '.nojekyll'), '');
await rm(localBasePathDir, { recursive: true, force: true });
await mkdir(localBasePathDir, { recursive: true });

const entries = await readdir(outDir, { withFileTypes: true });
await Promise.all(
  entries
    .filter((entry) => entry.name !== basePathName)
    .map((entry) => cp(path.join(outDir, entry.name), path.join(localBasePathDir, entry.name), { recursive: true })),
);

await rm(docsDir, { recursive: true, force: true });
await mkdir(docsDir, { recursive: true });
await cp(outDir, docsDir, { recursive: true });
await writeFile(path.join(docsDir, '.nojekyll'), '');
