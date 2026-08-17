// Copy the built site from dist/ to the repo root, where GitHub Pages serves it
// ("Deploy from a branch" -> main -> / (root)) — the same mechanism the
// system-design-guide repo uses. Run automatically after `astro build`.
//
// Only the build's own outputs are touched; the source tree is left alone.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) {
  console.error('publish-root: dist/ not found — run `astro build` first.');
  process.exit(1);
}

// Astro fingerprints asset filenames, so stale copies would accumulate at the
// root. Clear the generated asset dir before copying the fresh build in.
fs.rmSync(path.join(root, '_astro'), { recursive: true, force: true });

const published = [];
for (const entry of fs.readdirSync(dist)) {
  fs.cpSync(path.join(dist, entry), path.join(root, entry), { recursive: true });
  published.push(entry);
}

console.log(`publish-root: copied to repo root -> ${published.sort().join(', ')}`);
