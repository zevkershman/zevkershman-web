# Handoff — zevkershman.com

**Session date:** 2026-03-08
**Branch:** main
**Repo:** github.com/zevkershman/zevkershman-web
**Vercel preview:** https://zevkershman-web.vercel.app (auto-deploys from main)

---

## What Was Built

Complete single-page personal brand website. Dark, cinematic, scroll-based.
6 sections, 9 JS modules, 6 CSS files, full animation system, CI pipeline.

### Sections
1. **Hero** — Canvas node network (120 nodes desktop / 60 mobile), mouse repulsion physics, ZK loader split reveal, word-by-word headline animation, typewriter subtitle, scroll indicator
2. **About** — Philosophy ticker (infinite scroll marquee), overlapping photo stack with hover transforms, gold-accented intro paragraph
3. **Journey** — SVG career timeline with 7 nodes (2008–present), cubic bezier paths with blue glow fuse draw animation, tooltips, sonar ping on "NOW" node
4. **Philosophy** — 4 cards in 2x2 grid with ghost "SYSTEMS" text, hover lift + border effects, ScrollTrigger batch stagger
5. **Stack** — Canvas mind map with central "ZEV" node, 6 radiating categories (Automation, AI, Data, Comms, Dev, Ops), 18 tool nodes
6. **Contact** — Web3Forms integration with client-side validation, honeypot spam protection, success/error states

### Core Systems
- **Loader:** ZK monogram split reveal → hero word reveal → typewriter → scroll indicator
- **Custom cursor:** Dot (instant) + ring (lerp 0.12), crosshair mode in hero, 4-ring trail in hero, hover states for links/cards/timeline/mindmap
- **Navigation:** Sticky with glass effect, hide on scroll down / show on scroll up, active section tracking via IntersectionObserver, mobile hamburger with focus trap
- **Smooth scroll:** Lenis + GSAP ScrollTrigger proxy
- **Animations:** GSAP master timeline, ScrollTrigger per section, scrubbed parallax on hero
- **Reduced motion:** Full support — static canvas frame, no loader, immediate visibility, Lenis destroyed, native smooth scroll restored
- **Error monitoring:** Global error + unhandled rejection + long task observer, reports to Vercel Analytics

---

## File Structure

```
zevkershman-web/
├── .github/workflows/ci.yml      ← GitHub Actions CI pipeline
├── .gitignore
├── .htmlvalidate.json             ← HTML validation config
├── .lighthouserc.js               ← Lighthouse CI thresholds
├── .stylelintrc.json              ← CSS linting config
├── 404.html                       ← Custom error page
├── CLAUDE.md                      ← Project north star / design tokens
├── build.js                       ← Env var injection + sitemap date
├── favicon.svg                    ← ZK monogram in blue
├── index.html                     ← Main page (all 6 sections)
├── package.json
├── package-lock.json
├── playwright.config.js           ← Playwright test config
├── robots.txt
├── sitemap.xml                    ← Build date: 2026-03-08
├── vercel.json                    ← Security headers + caching + CSP
├── css/
│   ├── tokens.css                 ← Design tokens (colors, spacing, z-index)
│   ├── base.css                   ← Reset + typography classes
│   ├── layout.css                 ← Grid, sections, photo stack, forms
│   ├── components.css             ← Nav, loader, cursor, cards
│   ├── animations.css             ← Keyframes + print stylesheet
│   └── responsive.css             ← Media queries + reduced motion
├── js/
│   ├── canvas.js                  ← Hero node network animation
│   ├── mindmap.js                 ← Stack section mind map
│   ├── cursor.js                  ← Custom cursor + trail + crosshair
│   ├── loader.js                  ← Page loader + font loading + hero reveal
│   ├── nav.js                     ← Navigation + mobile menu + active links
│   ├── scroll.js                  ← Lenis + GSAP ScrollTrigger animations
│   ├── timeline.js                ← SVG timeline + tooltips + path animation
│   ├── form.js                    ← Web3Forms submit + validation
│   └── monitoring.js              ← Error tracking
└── assets/images/
    ├── zev-pro.jpg                ← Professional photo (real)
    ├── zev-pro@2x.jpg
    ├── zev-pro.webp
    ├── zev-pro@2x.webp
    ├── zev-personal.jpg           ← Personal photo (real)
    ├── zev-personal@2x.jpg
    ├── zev-personal.webp
    ├── zev-personal@2x.webp
    └── zev-og.jpg                 ← OG image 1200x630
```

---

## Commits This Session

| Hash | Message |
|------|---------|
| `fb58076` | feat: initial production build — all phases complete |
| `c3a7380` | feat: add CI pipeline and test infrastructure |

---

## Pending Before Launch

### Must-do
- [ ] **WEB3FORMS_KEY** — Verify the env var is set in Vercel project settings. The placeholder `YOUR_WEB3FORMS_KEY` in index.html gets replaced by `build.js` during Vercel's build step.
- [ ] **DNS propagation** — Point zevkershman.com to Vercel. Add domain in Vercel dashboard → Settings → Domains.
- [ ] **Test the contact form** — Submit a test message after deploy to confirm Web3Forms receives it.
- [ ] **Browser testing** — Chrome, Safari, Firefox (desktop + mobile). Focus on: canvas performance, font loading, photo stack layout, mobile menu focus trap.
- [ ] **Font verification** — Confirm Array (Monument Extended) loads from Fontshare. If it doesn't, self-host the font files in `/assets/fonts/`.

### Should-do (Phase 7)
- [ ] **Write unit tests** — `tests/unit/` is empty. Cover: canvas init, form validation, nav scroll behavior.
- [ ] **Write integration tests** — `tests/integration/` is empty. Cover: full page load, form submission flow, navigation.
- [ ] **Write a11y tests** — `tests/accessibility/` is empty. Cover: skip nav, focus management, ARIA attributes.
- [ ] **Write visual regression tests** — `tests/visual/` is empty. Generate baselines with `npm run test:visual:update`.
- [ ] **Lighthouse audit** — Run after deploy to verify scores meet thresholds (perf ≥85, a11y ≥90, best-practices ≥90, seo ≥90).

### Nice-to-have
- [ ] **OG image optimization** — Current `zev-og.jpg` is 6MB. Compress to <500KB.
- [ ] **Monument Extended license** — If Zev has a license, self-host for reliability. Fontshare's Array is the free alternative currently in use.

---

## Known Risks

1. **Fontshare CDN dependency** — If Fontshare goes down, the display font falls back to Oswald then sans-serif. A 3-second timeout in `loader.js` prevents indefinite FOUT blocking.
2. **Canvas performance on low-end mobile** — 60 nodes + connections at 30fps. Throttled via delta-time but could still be heavy on very old devices. Tab-hidden pause helps battery.
3. **Web3Forms free tier** — 250 submissions/month. No storage cap but rate-limited. If volume exceeds this, upgrade or switch provider.
4. **CI tests are empty** — Pipeline will pass vacuously until test files are written. False confidence until Phase 7 is complete.
5. **CSP connect-src includes n8n** — `*.n8n.cloud` is whitelisted for future webhook integrations. Remove if not needed.

---

## Design Tokens (quick reference)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0A0A0A` | Page background |
| `--surface` | `#111111` | Cards, inputs |
| `--blue` | `#0055FF` | Interactive elements |
| `--gold` | `#C9A84C` | Authority moments (max 4x site-wide) |
| `--text` | `#F0F0F0` | Body text |
| `--muted` | `#555555` | Secondary text |
| `--font-display` | Array / Monument Extended | Headlines |
| `--font-body` | DM Mono | Body text |
