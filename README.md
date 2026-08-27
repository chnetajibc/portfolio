# chnetaji.com — Portfolio

Conversational portfolio for **CH Netaji Bhadraiahnath Chowdary** — AI Engineer, Software Engineer, Entrepreneur. Built as a React SPA with chat-first UX.

Live: **https://chnetaji.com** (Cloudflare Pages)

## Stack

- **Frontend:** React 19, React Router 7, CRACO (CRA), Tailwind CSS, Framer Motion, Radix UI, Lucide
- **Build:** `react-scripts 5` + `craco`, Node 20, Yarn 1.22
- **Hosting:** Cloudflare Pages — `frontend/build` → `chnetaji.com`
- **SEO:** static `index.html` + JSON-LD `Person/WebSite`, `og-image.png` (1200×630), `sitemap.xml`, `robots.txt`, `llms.txt`, `humans.txt`

## Project Structure

```
frontend/
  public/
    index.html          # canonical, OG, Twitter, JSON-LD
    favicon.svg/ico/png # NBC avatar (matches Header)
    og-image.png        # 1200×630 dark aurora + NBC
    _redirects          # /* /index.html 200 (SPA)
    _headers            # security + cache
    robots.txt / sitemap.xml / llms.txt
  src/
    components/         # Avatar (NBC), Header, SocialLinks, ChatArea...
    data/               # profile.json, socials.json, experience, projects, skills
    pages/Portfolio.jsx # main route /
```

## Local Dev

```bash
cd frontend
yarn install
yarn start          # http://localhost:3000
yarn test           # 4 suites / 9 tests
yarn build          # production → build/
```

## Deployment — Cloudflare Pages

**Option A — Dashboard (recommended):**
1. Cloudflare → Pages → Create project → Connect `chnetajibc/portfolio`
2. Framework preset: `Create React App`
3. Root directory: `frontend`
4. Build command: `yarn build`
5. Output directory: `build`
6. Add custom domain `chnetaji.com` (+ `www`) → DNS auto-proxied

**Option B — GitHub Action:**
- Workflow `.github/workflows/deploy.yml` uses `cloudflare/pages-action@v1`
- Requires secrets: `CLOUDFLARE_API_TOKEN` (Pages Edit), `CLOUDFLARE_ACCOUNT_ID`
- Project name: `chnetaji-portfolio`, directory: `frontend/build`

SPA fallback handled by `public/_redirects`. Caching/security via `public/_headers`.

## SEO / AI

- `public/robots.txt` — `Allow: /`, `Sitemap: https://chnetaji.com/sitemap.xml`, explicit `Allow` for `GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.
- `public/llms.txt` — [llmstxt.org] spec for LLMs
- `public/sitemap.xml` — single URL `https://chnetaji.com/`
- `public/og-image.png` — regenerate via `python3` Pillow script in repo (dark aurora + NBC) — update if branding changes

## Analytics

- `index.html` includes Cloudflare Web Analytics beacon placeholder (replace `REPLACE_WITH_TOKEN`) + Plausible comment. Enable one, remove the other.

## Favicon

NBC logo mirrors `src/components/Avatar.jsx` (black circle, orbital lines, `NBC` text). Sources: `public/favicon.svg` (vector), `favicon-16/32.png`, `apple-touch-icon.png` (180), `android-chrome-192/512.png` (PWA via `site.webmanifest`).

## Health Check (dev only)

`frontend/plugins/health-check/` — `WebpackHealthPlugin` + `/health*` endpoints — enabled only if `ENABLE_HEALTH_CHECK=true` (`frontend/craco.config.js:15`). No effect in production.
