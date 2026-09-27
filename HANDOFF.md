# Handoff — New Site Build (Astro) & Multi-Site Strategy

**Owner:** Robert — robert@zoorepairs.com.au
**Date:** 2026-07-20
**Purpose:** Carry the context from the "Computers Gold Coast" session into a fresh
session so we can start a new site the *proper*, maintainable way (Astro), and plan
for a large multi-site setup (Robert has a clone with ~400 sites).

> **How to use this file:** In a new Claude Code window, say
> *"Read HANDOFF.md and let's continue."* Ideally do that in a **new, separate
> repository** for the Astro project — don't build the new site inside this
> production repo.

---

## 1. Who / what this is about

- Robert runs **Computers Gold Coast** — a Gold Coast (AU) computer/laptop repair
  & IT services business.
- Sister business: **Zoo Computer Repairs** (`zoorepairs.com.au`), Brisbane.
- Business model for the websites: **local-business SEO / lead-gen sites** — mostly
  static content, lots of service pages, forms handled by third parties. No logins,
  no dashboards, no e-commerce cart.
- **Robert has a clone that contains ~400 sites.** This is the big driver: the
  current hand-coded approach does NOT scale to 400 sites, and Astro (or similar)
  is the fix. See §5.

---

## 2. How the CURRENT site (this repo) is built — the tech we used

**Approach: plain hand-written HTML, no framework, no build step.**

| Piece | What we used |
|---|---|
| Pages | ~67 standalone `.html` files, one per page (1 home, services, contact, ~64 service pages) |
| Styling | Inline `<style>` block in each file's `<head>` (CSS duplicated per page) |
| Fonts | Google Fonts — **Inter** (400/500/600) + **Space Grotesk** (500/600/700) |
| Design tokens (CSS vars) | `--navy:#020617; --accent:#38bdf8; --sky-50:#f0f9ff; --gray-50:#f9fafb; --gray-200:#e5e7eb; --text:#0f172a; --text-soft:#475569;` |
| Shared UI classes | `.pill`, `.pill-primary`, `.pill-dark`, `.site-header`, `.nav-toggle` (mobile hamburger), `.hero`, `.grid`/`.grid-2`, `.bg-white`/`.bg-gray`, `.contact-card`, `.form-field` |
| SEO | `sitemap.xml` (repo root, 67 URLs), `robots.txt` (points to sitemap), **LocalBusiness JSON-LD** schema in each page's `<head>` |
| Contact form (general) | **FormSubmit** (formsubmit.co) using an **alias endpoint** so the raw email is NOT in page source. Alias action: `https://formsubmit.co/db4eea575889e7938a03c579f439a01d` |
| Repair-quote form (hardware) | External **forms.app** form: `https://ikfycq6u.forms.app/zoorepairs` (opens in new tab) |
| Phone number | **0447 266 455** → `tel:+61447266455`. Visible ONLY on contact.html; also in JSON-LD `telephone` on every page |
| Hosting | **Cloudflare Pages**, auto-deploys on merge to `master`. Project name: `computers-gold-coast` (`computers-gold-coast.pages.dev`) |
| Repo | `rob82aus/computers-gold-coast`, work branch `claude/add-robert-home-page-8nm076` |

**The pain point that proves why we need a framework:** changing the phone number
required editing **66 files**. Header/footer/nav/styles/business details are
duplicated across all 67 pages — there is no single source of truth.

---

## 3. Content provenance (for the current site — relevant if cloning method repeats)

- ~59 service pages were **adapted from the sister site `zoorepairs.com.au`**
  (Brisbane) with Brisbane → Gold Coast substitutions.
- 3 pages written **original from SERP research** (no source page existed).
- 4 install pages written **original, first person**: data cabling, TV antenna,
  alarm system, smart home automation.
- **⚠️ Duplicate-content risk:** cloned pages share a lot of text with the Brisbane
  site. Fine-ish for same-owner + different city, but not ideal for ranking. At
  **400 sites** this risk is MUCH bigger (see §5). Plan: unique-enough copy per
  site/city, unique NAP (name/address/phone), correct per-city schema.

---

## 4. Framework options we discussed (lightest → heaviest)

| Option | Ships JS? | Best for | Verdict for Robert |
|---|---|---|---|
| **Astro** ⭐ | Zero by default | Content/marketing/local-biz sites, blogs | **Recommended** — speed of static HTML + kills duplication |
| 11ty (Eleventy) | No | Same as Astro, plainer/older | Fine, but Astro is nicer — skip |
| Hugo | No | Massive sites, blazing builds | Overkill; Go templating is clunkier |
| **Next.js** | Yes (React app) | Web APPS: logins, bookings, dashboards, live data | Overkill for marketing sites — "truck to deliver a letter" |
| WordPress | Yes | Clients who self-edit content, plugin ecosystem | Only if a non-technical client must edit; slower, needs upkeep |
| Squarespace/Wix/Webflow | n/a | No-code, fastest launch, monthly fee | Only for hands-off clients; weaker SEO control |

**Rule of thumb:** reach for Next.js ONLY when the site needs app-like
interactivity (user accounts, real-time booking availability, a customer portal).
For service/marketing/local-SEO sites, **Astro is genuinely the best tool**, not
just the trendy one. Astro has an official **Cloudflare Pages adapter**, so the
git → auto-deploy workflow stays identical to now.

---

## 5. The 400-site clone — why Astro matters here most, and the plan

The whole reason to switch: at **~400 sites**, hand-copied HTML is unmanageable. One
global change (a phone number, a footer link, a schema fix) would mean editing
thousands of files. Astro turns that into **one edit**.

### Recommended Astro architecture (for one site, then scaled to many)

```
src/
  config/
    business.ts        ← SINGLE SOURCE OF TRUTH: name, phone, email, hours,
                          address, ABN, socials, brand colours. Change once.
  layouts/
    Base.astro         ← <head>, fonts, global CSS/tokens, JSON-LD schema
  components/
    Header.astro       ← nav + hamburger, written ONCE
    Footer.astro
    ServiceHero.astro
    QuoteButtons.astro ← forms.app + FormSubmit paths
  content/
    services/          ← one Markdown/data file PER service (title, city,
                          keywords, FAQ, body). Content Collections.
  pages/
    index.astro
    contact.astro
    services/[slug].astro  ← ONE template that generates ALL service pages
                             from the content collection
```

- **One service template + a data file = all service pages.** Changing the template
  updates every service page at once.
- **`business.ts` is the fix for the "66-file phone edit."** Phone/hours/NAP live in
  ONE place and flow into every page + every JSON-LD block.
- Design tokens (the `--navy/--accent/...` vars above) become global CSS, defined
  once.

### Scaling ONE Astro codebase to ~400 sites — options to explore

1. **Config-per-site monorepo / template repo:** one Astro "template" repo; each
   site is generated by swapping a `business.ts` + content folder + brand tokens.
   Best when sites are structurally identical, differ by city/brand/content.
2. **Build-time data source:** drive sites from a spreadsheet/JSON/headless CMS so
   non-devs can spin up or edit a site's data without touching code.
3. **One Cloudflare Pages project per site** (custom domain each) vs. a smarter
   multi-tenant setup — decide based on how independent the 400 domains are.

### ⚠️ SEO warning for 400 cloned sites (must plan for this)
- 400 near-identical sites = major **duplicate-content / doorway-page risk** with
  Google. This is the #1 thing that can sink the whole network.
- Mitigations to design in from day one: genuinely **unique copy per site**
  (not just city find-replace), unique **NAP** per business, correct **per-location
  LocalBusiness schema**, distinct value on each page, and canonical hygiene.
- Worth a dedicated planning conversation before mass-generating.

---

## 6. Hosting / DNS / infra lessons learned (Cloudflare) — reusable for new sites

- **Custom domain on Cloudflare Pages must be registered INSIDE the Pages project**
  (Workers & Pages → project → Custom domains), not just as a DNS CNAME. A proxied
  CNAME alone is not enough.
  - Symptom we hit: apex `computersgoldcoast.com.au` returned 200, but
    **`www` returned 522** because `www` was never added in the Pages project's
    Custom domains list. Google had indexed the `www` URL, so every search click
    broke. **Fix:** add `www.<domain>` as a custom domain in the Pages project.
  - Follow-up polish: pick ONE canonical (www vs non-www) and add a Cloudflare
    **Redirect Rule** (301) for the other. Google indexed `www` here, so keep `www`
    canonical.
- **Email on the domain, no cPanel needed:** use **Cloudflare Email Routing** (free)
  — auto-adds MX + SPF, forwards `anything@domain` to an existing inbox. Already set
  up for computersgoldcoast.com.au (MX → `route1/2/3.mx.cloudflare.net`). It's
  receive/forward only; to *send as* the address, add SMTP relay in Gmail or use
  Google Workspace / Zoho.
- **Google Search Console:** easiest is a **Domain property** verified by a TXT
  record in Cloudflare DNS (covers http/https + all subdomains). Then submit
  `sitemap.xml`. (Two `google-site-verification` TXT records already present.)

---

## 7. Open items / suggested next steps

- [ ] **Fix `www` 522** on the current site: add `www.computersgoldcoast.com.au` as a
      custom domain in the Cloudflare Pages project (breaks all Google click-throughs
      until done). *(Current-site task, not Astro.)*
- [ ] Homepage **LocalBusiness JSON-LD still has placeholder address/hours** — fill
      with real details or trim the fields. *(Current-site task.)*
- [ ] **Start the Astro project in a NEW repo.** Scaffold: `Base` layout,
      `business.ts` config, `Header`/`Footer` components, one `services/[slug].astro`
      template + a content collection, Cloudflare Pages adapter.
- [ ] Decide the **multi-site scaling model** for the 400-site clone (see §5 options).
- [ ] Plan **unique-content strategy** to avoid duplicate-content penalties at scale.

## 8. Handy references

- Current repo: `rob82aus/computers-gold-coast` (branch `claude/add-robert-home-page-8nm076`)
- Cloudflare Pages project: `computers-gold-coast` → `computers-gold-coast.pages.dev`
- Repair-quote form: `https://ikfycq6u.forms.app/zoorepairs`
- FormSubmit alias action: `https://formsubmit.co/db4eea575889e7938a03c579f439a01d`
- Phone: **0447 266 455** / `tel:+61447266455`
- Astro + Cloudflare docs: https://docs.astro.build/en/guides/deploy/cloudflare/
