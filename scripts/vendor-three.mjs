// Maintainer utility; the delivered experience needs no install or build.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('node_modules/three');
const dest = path.resolve('public/night-walk/vendor');
const visited = new Set();
async function copy(relative) {
  if (visited.has(relative)) return;
  visited.add(relative);
  const source = path.join(root, relative);
  const target = path.join(dest, relative.replace(/^build\//, '').replace(/^examples\/jsm\//, 'addons/'));
  await mkdir(path.dirname(target), {recursive: true});
  const code = await readFile(source, 'utf8');
  await writeFile(target, code);
  for (const match of code.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
    if (match[1].startsWith('.')) await copy(path.posix.normalize(path.posix.join(path.posix.dirname(relative), match[1])));
  }
}
for (const entry of ['build/three.module.js', 'examples/jsm/postprocessing/EffectComposer.js', 'examples/jsm/postprocessing/RenderPass.js', 'examples/jsm/postprocessing/UnrealBloomPass.js', 'examples/jsm/postprocessing/OutputPass.js', 'examples/jsm/utils/BufferGeometryUtils.js']) await copy(entry);
await copyFile(path.join(root,'LICENSE'),path.join(dest,'LICENSE.txt'));
console.log(`Vendored Three.js r186: ${visited.size} modules.`);
