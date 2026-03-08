# CLAUDE.md — ZevKershman.com Project North Star

## What This Is
Personal brand website for Zev Kershman. Single-page, scroll-based.
Production-grade. Every detail matters. $100K quality bar.

## Design North Star
Reference: activtheory.com + together.ai + twelvelabs.io
Dark, cinematic, futuristic-operator. NOT a portfolio. NOT SaaS.

## Design Tokens — NEVER DEVIATE
--bg:        #0A0A0A
--surface:   #111111
--surface2:  #161616
--blue:      #0055FF   ← tech/interactive ONLY
--gold:      #C9A84C   ← authority moments, MAX 4x site-wide
--text:      #F0F0F0
--muted:     #555555
--border:    rgba(255,255,255,0.06)
--nav-h:     64px
--transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1)

## Typography — NEVER DEVIATE
Display: Monument Extended 800 (via Fontshare "Array" or self-hosted)
Body: DM Mono 400/500 (Google Fonts)
FORBIDDEN: Inter, Roboto, Arial, system fonts

## Z-Index Scale — NEVER DEVIATE
--z-base:        1
--z-nav:         100
--z-tooltip:     200
--z-mobile-menu: 500
--z-cursor:      900
--z-loader:      1000

## Before Every Session
1. Read CLAUDE.md
2. Read current index.html
3. Never break working features
4. Never change design tokens
5. Never introduce new fonts
6. Commit after every section

## Commit Format
feat: complete [section]
fix: resolve [issue]
style: refine [element] [change]
perf: optimize [what] for [why]
