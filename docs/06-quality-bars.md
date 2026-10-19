# 06. Quality bars

Numbers and checks that decide whether anything is "done". Each bar names the command or test that proves it. Paste the output in the conversation; a claim without output does not count.

---

## 1. Performance

Measured with Lighthouse (mobile preset, the default simulated throttling) on the production build served locally or from a preview deployment, three runs, report the median.

| Metric | Bar |
|---|---|
| Lighthouse performance (mobile) | 90 or higher |
| Largest Contentful Paint | 2.5 s or less |
| Cumulative Layout Shift | 0.05 or less |
| Total Blocking Time | 200 ms or less |
| Interaction to Next Paint (lab proxy) | 200 ms or less |
| First-load transfer, home page, **excluding** the lazy scene module and point file | 400 KB or less |
| Total JavaScript on first load (excluding the scene) | 100 KB gzip or less |
| Scene module | per `05` section 7 |
| Scene data | per `05` section 7 |
| Fonts | 2 families, Latin subset, 90 KB or less in total |
| Images above the fold | AVIF or WebP; explicit `width` and `height`; `fetchpriority="high"` on the LCP image only |
| Requests to third-party origins | 0 |
| Main-thread long tasks over 50 ms during load | none caused by our code, or each explained |

**Rules**
- No render-blocking JavaScript. Scripts are `type="module"` (deferred) or loaded on idle.
- No layout shift from fonts (`size-adjust` on the fallback, preload the two critical files).
- CSS is inlined or a single small file; no unused framework CSS shipped.
- The scene never delays any of: first paint, text, links, the resume button.

**Command:** `npm run check:perf` (to be created in Stage 5) runs Lighthouse three times and prints the median of each metric. If a bar fails, fix it or write down why and get Jake's approval; don't lower a bar silently.

---

## 2. Accessibility (WCAG 2.2 AA minimum)

**Automated:** Lighthouse accessibility score 100, and `axe-core` (via Playwright) reports zero violations on `/`, `/projects/spot`, `/projects/wayfinder`, `/projects/baton`, and `/404`, in light and dark.

**Manual or scripted checks (all must be recorded as pass in `08`)**
- **Keyboard:** full navigation with Tab and Shift+Tab only. A skip link is the first focusable element. Every control reachable. No focus traps. Focus order matches reading order.
- **Focus visibility:** every focusable element shows a ring of at least 3:1 contrast against its surroundings, in both themes.
- **Contrast:** every text and background pair at least 4.5:1 (3:1 for large text and UI graphics). Claude prints the table of computed ratios for all token pairs, in both themes, including the focus ring and the highlighter-hover link state.
- **Decorative exemption:** a graphic pair is exempt from 3:1 only if it is decorative under WCAG 1.4.11, meaning it is `aria-hidden` or its meaning is carried by adjacent text (for example 1 px rules, the lane-line track and fill, status squares, the viewport and figure-frame borders). Exempt pairs are still printed in the contrast table, in their own group, each with its reason. Anything else that carries meaning (focus ring, button borders, diagram strokes) must reach 3:1, which is why those use `--asphalt`.
- **Headings:** one `h1` per page, no skipped levels, headings describe their sections.
- **Landmarks:** `header`, `nav`, `main`, `footer` present once each.
- **Links and buttons:** names make sense out of context; the `Resume` link names its file type.
- **Images and figures:** meaningful alt text or `role="img"` with an accessible name for diagrams; decorative items hidden. The canvas is `aria-hidden`; the caption carries the meaning.
- **Motion:** `prefers-reduced-motion: reduce` removes the scene, sweep, morphs, and lane fill. Nothing flashes more than 3 times per second (see `05`).
- **Zoom and reflow:** at 200% browser zoom (1280 px equivalent) and at 320 px width, no horizontal scroll, no clipped or overlapping content.
- **Target size:** interactive targets are at least 44 by 44 px (the WCAG 2.2 minimum is 24; this site uses 44).
- **Language:** `<html lang="en">`.
- **Forced colors:** content is readable and focus rings visible under `forced-colors: active`.
- **Screen reader pass:** VoiceOver or NVDA read the home page once top to bottom; record anything confusing and fix it. (Jake does this one by hand; Claude supplies the checklist.)

---

## 3. Progressive enhancement

- With JavaScript disabled: all text, links, project pages, the resume link, and the email link work; the viewport shows the poster; the page looks intentional.
- With CSS custom properties unsupported: not a target (evergreen browsers only).
- Content is never injected by script.

---

## 4. SEO and metadata

| Item | Spec |
|---|---|
| `<title>` home | `Jacob Webster: perception and autonomy software` |
| `<title>` project | `{Project}: Jacob Webster` |
| Meta description | One sentence per page, 150 characters or fewer, no keyword stuffing, from `02` |
| Canonical URL | Set per page, using the host `https://www.jakewebster.dev` (decision D11) |
| Open Graph / Twitter card | `og:title`, `og:description`, `og:image` (the generated `og-home.png`, or a per-project crop), `og:type=website`, `twitter:card=summary_large_image`; image alt text provided |
| Structured data | A single JSON-LD `Person` on the home page: `name`, `url`, `sameAs` (LinkedIn, GitHub), `alumniOf` (the University of South Carolina). Nothing else; no job title claims beyond the resume. |
| `sitemap.xml`, `robots.txt` | Generated; `robots.txt` allows all |
| Favicon | SVG favicon plus a 180 px touch icon (per `03`) |
| `theme-color`, `color-scheme` | Set for both themes |
| Lighthouse SEO | 100 |

---

## 5. Privacy and security

- **No analytics, no cookies, no third-party requests.** The only storage use is the `sessionStorage` flag for the intro (no personal data).
- **No phone number, address, or any personal data beyond the email, LinkedIn, and GitHub links.**
- **Content Security Policy** (the site deploys on Vercel; set headers in `vercel.json`): `default-src 'self'`; `img-src 'self' data:`; `style-src 'self'` (inline critical CSS allowed via hash or nonce); `script-src 'self'`; `font-src 'self'`; `connect-src 'self'`; `frame-ancestors 'none'`; `base-uri 'self'`; `form-action 'none'`. If the Baton demo video is embedded, use a link to YouTube instead of an iframe, so no third-party origin loads.
- Other headers if supported: `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` with camera, microphone, and geolocation denied.
- **Dependencies:** minimal; lockfile committed; `npm audit` (or the package manager's equivalent) shows no high or critical issues; each dependency justified in the plan.
- **Secrets:** no `.env` values, keys, or tokens in the repo or history. Run a secrets scan (`gitleaks` or `trufflehog`) on the full history and paste the result.
- **Licensed assets:** `check:assets` passes (see `05` section 9).

---

## 6. Browser support

Evergreen browsers, latest two versions: Chrome, Edge, Firefox, Safari (macOS and iOS 16 or later), plus Chrome on Android. WebGL2 absence is handled by the fallback; nothing else may depend on it. No polyfills.

---

## 7. Code quality

- TypeScript (or JSDoc-typed JavaScript) with strict settings if the framework uses scripts at all.
- Linting and formatting configured and passing (`npm run lint`).
- CSS uses tokens only. No `!important`. No raw hex values outside the token file. A script greps for both.
- No dead code, no commented-out blocks, no leftover `console.log`.
- Components are small and named for what they are, not how they look.
- Content is in `content/` files (see `02`, section G); the build validates the schema.
- README at the repo root explains how to run, build, add a project, regenerate the point-cloud assets, and where the private assets live.

---

## 8. The checks (scripts to create; names are fixed so `/goal` conditions can reference them)

| Script | What it fails on |
|---|---|
| `check:content` | Always: missing required frontmatter; a project page missing "What isn't done"; any claim string from the forbidden columns in `02` section B (a maintained list of regexes: `autonomously follows`, `deployed on Spot`, `SLAM`, `real-time`, `production-ready`, `I built Baton`, and so on), any banned word from `02` section F, and the Spot checked phrases in `02` section B (scoped to the Spot page, home copy, and Spot figure). Warn-level rules (the Spot "integrat…" and "runs/deployed on the robot" phrases) are warnings in every mode. In strict mode only (`--strict`, or `VERCEL_ENV=production`, which Vercel sets on production builds): any `TODO(jake)` anywhere in `content/`, `src/`, or the build output. Outside strict mode each `TODO(jake)` is listed as a warning. |
| `check:assets` | See `05` section 9 |
| `check:links` | Any internal link, anchor, or external link that does not resolve (external checks may be allowed to warn, not fail, for rate-limited hosts) |
| `check:a11y` | Any axe violation on any route in either theme |
| `check:perf` | Any Lighthouse metric outside section 1 |
| `check:tokens` | Raw hex outside the token file, `!important`, banned selectors |
| `check:size` | First-load transfer, JS, font, and scene budgets exceeded |
| `check:all` | Runs every check above in order; non-zero exit on any failure |

The production build (`npm run build`) runs `check:content`, `check:assets`, and `check:tokens` before it emits output. On Vercel production deploys `check:content` is strict, so a `TODO(jake)` blocks the release; local and preview builds pass with the TODOs listed as warnings. Run `npm run check:content -- --strict` to check release readiness locally.
