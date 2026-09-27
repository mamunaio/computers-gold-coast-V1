import { defineConfig } from 'astro/config';

// Faithful migration of computersgoldcoast.com.au (hand-written HTML -> Astro).
// Static output -> deploys directly to Cloudflare Pages (no adapter).
// URLs must stay extensionless with NO trailing slash to match the live site,
// e.g. /apple-mac-repairs-gold-coast -> file build format emits <slug>.html,
// which Cloudflare Pages serves at exactly that path.
export default defineConfig({
  site: 'https://computersgoldcoast.com.au',
  trailingSlash: 'never',
  build: { format: 'file' },
});
