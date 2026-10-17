import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const project = resolve(import.meta.dirname, '..');
const dist = resolve(project, 'dist');
const output = resolve(project, 'exports');
const mime = { '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2' };

function localAsset(url) {
  const relative = url.includes('/assets/') ? `assets/${url.split('/assets/')[1]}` : url.replace(/^\//, '');
  const path = resolve(dist, relative);
  if (!path.startsWith(dist + sep)) throw new Error(`Unexpected asset path: ${url}`);
  return path;
}

async function dataUrl(url) {
  const path = localAsset(url);
  const data = await readFile(path);
  const type = mime[extname(path)];
  if (!type) throw new Error(`Unsupported inline asset: ${path}`);
  return `data:${type};base64,${data.toString('base64')}`;
}

let html = await readFile(resolve(dist, 'index.html'), 'utf8');
const cssTag = html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/)?.[0];
const jsTag = html.match(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/)?.[0];
if (!cssTag || !jsTag) throw new Error('The Vite build is missing its stylesheet or JavaScript entry.');

let css = await readFile(localAsset(cssTag.match(/href="([^"]+)"/)[1]), 'utf8');
const assetUrls = [...new Set([...css.matchAll(/url\((?:["']?)([^)'"\s]+)(?:["']?)\)/g)].map(match => match[1]))];
for (const url of assetUrls) {
  if (!url.startsWith('data:')) css = css.replaceAll(url, await dataUrl(url));
}
const javascript = await readFile(localAsset(jsTag.match(/src="([^"]+)"/)[1]), 'utf8');
html = html.replace(cssTag, () => `<style>${css}</style>`).replace(jsTag, '');
html = html.replace('href="/favicon.svg"', `href="${await dataUrl('/favicon.svg')}"`);
html = html.replace('</body>', () => `<script type="module">${javascript.replaceAll('</script', '<\\/script')}</script></body>`);

await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'SSD-LAB.html'), html);
await writeFile(resolve(output, 'index.html'), html);
const pages = resolve(project, 'docs');
await mkdir(pages, { recursive: true });
await writeFile(resolve(pages, 'index.html'), html);
await writeFile(resolve(pages, '.nojekyll'), '');
console.log(`Standalone website saved: ${resolve(output, 'SSD-LAB.html')}`);
console.log(`GitHub Pages website saved: ${resolve(pages, 'index.html')}`);
console.log('Open this HTML file in a WebGL-capable browser. No server or dependency installation is required.');
