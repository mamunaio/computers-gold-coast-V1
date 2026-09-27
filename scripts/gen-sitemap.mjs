// Post-build sitemap generator. Walks the real dist output so the sitemap
// always matches exactly what was deployed (any trailing-slash style, any
// nesting). Wired via package.json: "build": "astro build && node scripts/gen-sitemap.mjs".
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const cfg = readFileSync('astro.config.mjs', 'utf8');
const SITE = (cfg.match(/site:\s*['"]([^'"]+)['"]/) || [])[1].replace(/\/$/, '');
const DIST = 'dist';

function walk(dir) {
  let out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const paths = new Set();
for (const f of walk(DIST)) {
  const rel = relative(DIST, f).split(sep).join('/');
  if (rel === '404.html') continue;
  let url;
  if (rel === 'index.html') url = '/';
  else if (rel.endsWith('/index.html')) url = '/' + rel.slice(0, -'index.html'.length); // directory style -> /foo/
  else if (rel.endsWith('.html')) url = '/' + rel.slice(0, -'.html'.length);            // file style -> /foo
  else continue;
  paths.add(url);
}

const lastmod = new Date().toISOString().slice(0, 10);
const body = [...paths]
  .sort()
  .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${lastmod}</lastmod></url>`)
  .join('\n');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), xml);
console.log(`sitemap: ${paths.size} urls -> ${SITE}/sitemap.xml`);
