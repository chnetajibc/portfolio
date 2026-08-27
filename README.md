# chnetaji.com — Portfolio

Conversational portfolio for **CH Netaji Bhadraiahnath Chowdary** — AI Engineer, Software Engineer, Entrepreneur. Built as a React SPA with chat-first UX.

Live: **https://chnetaji.com** (Cloudflare Pages)

## Stack

- **Frontend:** React 19, React Router 7, **Vite 6** (`@vitejs/plugin-react`), Tailwind CSS, Framer Motion, Radix UI, Lucide
- **Build:** `vite` + `vitest`/`jsdom`, Node 20, npm (migrated from CRA/CRACO/Yarn)
- **Hosting:** Cloudflare Pages — `frontend/dist` → `chnetaji.com` (Vite `outDir: dist`, modern default; preset `React (Vite)`)
- **SEO:** static `index.html` (Vite root) + JSON-LD `Person/WebSite`, `og-image.png` (1200×630), `sitemap.xml`, `robots.txt`, `llms.txt`, `humans.txt`

## Project Structure

```
frontend/
  index.html            # Vite entry (canonical, OG, Twitter, JSON-LD) → dist/index.html
  vite.config.js        # @vitejs/plugin-react, alias @ → src, outDir: dist, base: /, vitest
  eslint.config.js      # flat config (eslint 9 + react-hooks/jsx-a11y)
  public/
    favicon.svg/ico/png # NBC avatar (matches Header)
    og-image.png        # 1200×630 dark aurora + NBC
    _redirects          # /* /index.html 200 (SPA)
    _headers            # security + cache
    robots.txt / sitemap.xml / llms.txt
  src/
    index.jsx / App.jsx # entry (was .js, now .jsx for Vite)
    components/         # Avatar (NBC), Header, SocialLinks, ChatArea...
    data/               # profile.json, socials.json, experience, projects, skills
    pages/Portfolio.jsx # main route /
```

## Local Dev

```bash
cd frontend
npm install
npm run dev          # vite --port 3000 → http://localhost:3000 (alias: npm start)
npm test             # vitest run — 4 suites / 9 tests
npm run build        # vite build → dist/ (535 kB JS → ~170 kB gzip)
npm run preview      # vite preview --port 3000 → dist
```

## Deployment — Cloudflare Pages (Git direct, no GitHub Action)

1. Cloudflare → Pages → Create project → Connect `chnetajibc/portfolio`
2. Framework preset: **`React (Vite)`**
3. Root directory: `frontend`
4. Build command: `npm run build` (`vite build`)
5. Output directory: `dist` (Vite modern default)
6. Add custom domain `chnetaji.com` (+ `www`) → DNS auto-proxied

> No `.github/workflows` — Cloudflare builds directly from `main` on push. SPA fallback handled by `public/_redirects`. Caching/security via `public/_headers`.

## SEO / AI

- `public/robots.txt` — `Allow: /`, `Sitemap: https://chnetaji.com/sitemap.xml`, explicit `Allow` for `GPTBot`, `ClaudeBot`, `PerplexityBot`, etc.
- `public/llms.txt` — [llmstxt.org] spec for LLMs
- `public/sitemap.xml` — single URL `https://chnetaji.com/`
- `public/og-image.png` — regenerate via `python3` Pillow script in repo (dark aurora + NBC) — update if branding changes

## Analytics

- `index.html` includes Cloudflare Web Analytics beacon placeholder (replace `REPLACE_WITH_TOKEN`) + Plausible comment. Enable one, remove the other.

## Favicon

NBC logo mirrors `src/components/Avatar.jsx` (black circle, orbital lines, `NBC` text). Sources: `public/favicon.svg` (vector), `favicon-16/32.png`, `apple-touch-icon.png` (180), `android-chrome-192/512.png` (PWA via `site.webmanifest`).

## Notes

- `frontend/plugins/health-check/` removed — was CRA/CRACO webpack-only, not needed for Vite.
- `packageManager` is no longer pinned to Yarn; use `npm` (or `pnpm`/`bun`) — Cloudflare auto-detects `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`.
