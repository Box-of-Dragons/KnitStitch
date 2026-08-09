# Changelog

> **Release-based changelog** — Version v0.8.1 · published 2026-08-09 · 65 commits · 309d8bbb
>
> The KnitStitch version number and this changelog are now generated from the repository's git tags and GitHub Releases. From here on, the release line is starting back at **v0.1.0** so versions can grow cleanly. The older CraftCMS (v1) history is preserved in the Archive tab.

---

## v0.8.1

Published 2026-08-09 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/releases/tag/v0.8.1)

Changes since v0.8.0.

## Fixes

- Guard SolveSpace circle sync and reuse rectangle corners

## Tests

- Sketching Stability Improvements
  - Fixed an issue where manual drawing rectangles were incorrectly offset.

## Other Changes

- Merge dev into master after release and trigger deploy
- Always merge dev into master after dev push
- Add unit and e2e test jobs before release
- Install Playwright browsers before e2e tests


## v0.8.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/releases/tag/v0.8.0)

Changes since v0.7.0.

## Features

- New sidebar accordion layout with resizable panels and color scheme
  - Panels can be expanded or collapsed, and the sidebar width can be adjusted.

## Tests

- Updated end-to-end test constraints

## Maintenance

- Stop tracking generated build info
- Improved development workflow
- Updated sketch service and state handling
- Updated build scripts and changelog generation

## Other Changes

- Added automated build and test workflow


## v0.7.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/tree/v0.7.0)

## Features

- Add floating panel and fullscreen controls
  - Add floating panel collapse/resize controllers with localStorage persistence
  - Add canvas fullscreen controller with toggle/restore
  - Update header, footer, sidebar, index, and app styles
  - Add disabled global login link placeholder
- Use shared site header from root site
  - replace hardcoded header HTML with site-header.js loader
  - header.html now injects global-bar.js and site-header.js from the root Structured Chaos site (localhost:4000 in dev, misssponto.me.uk in prod)
  - set window.SITE_HEADER config (brand, nav, GitHub/GitLab links)
  - placeholder divs for global-bar and site-header
- Load shared.css from root site on all pages
  - add inline loader script to all 5 page HTML files that injects css/shared.css from the root site (localhost:4000 in dev, misssponto.me.uk in prod) before app.css
  - shared.css provides design tokens, base styles, typography, and all shared components (global bar, site header, panels, chips, etc.)
- Use shared site footer

## Fixes

- Correct bezier stroke method
  - Also refreshes AGENTS.md git conventions and removes the duplicated docs/agents/git-rules.md.

## Documentation

- Add acknowledgements section to README
  - credit Devin, Codex, SolveSpace, and Better Auth (planned)
- Update GitHub URLs to PascalCase
- Note app.css loads after shared.css from root site
- Remove Craft CMS references after BoD migration
  - remove "no longer embedded in Craft CMS" (no longer relevant)
  - rename "CraftCMS GenerateBuildInfo.php" to "BoxOfDragons GenerateBuildInfo.php"
  - normalize "CraftCMS era" to "Craft CMS era" (historical context)

## Refactors

- Move shared styles to shared.css, keep only overrides
  - remove design tokens, base styles, typography, layout primitives, and all shared components (global bar, site header, navigation, panels, chips, color pairs, buttons, forms, lists, gallery, footer, responsive breakpoints) — now in css/shared.css from the root site
  - keep only KnitStitch-specific styles: theme color overrides (gold primary), layout overrides (scroll-margin-top, panel border-radius), body-class active nav state, and app layout (canvas, ribbon, workspace, floating panels, tool ribbon, object list, dimension overlay, color picker, small-screen warning, boot loading overlay)


## v0.6.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/tree/v0.6.0)

## Features

- Add resizable panel layout with drag handles
  - add panelResizer.js for drag-to-resize between cards
  - add CSS for resizable panel grid layout
  - wire resizer into mainUi boot sequence
- Add small-screen warning page and redirect guard
  - add standalone warning page at /small-screen-warning.html for phone-sized viewports
  - inline guard in index.html <head> redirects <=768px viewports before the editor or WASM solver loads
  - warning page's Continue button sets a sessionStorage bypass so users can proceed after acknowledging
  - register the new page as a Vite entry and in the organisePages move list
  - add Responsive / Mobile Support section to roadmap; mark warning page item as shipped

## Fixes

- Restore panel resizing after helper refactor
  - Use the renamed ratio normalizer in pointer-move handling and cover the complete drag-ratio transformation with regression tests.

## Documentation

- Mark sketchLayer refactor as complete on roadmap
- Reconcile shipped features and auth plans

## Refactors

- Replace rectangle persistence with bézier persistence
  - stop saving/loading sketch.rectangles
  - save/load sketch.beziers with control point reconnection


## v0.5.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/tree/v0.5.0)

## Features

- Migrate sketch solving to SolveSpace WASM
- Use exact polygon coverage for symmetric cell fills
- Add directional increase and decrease instructions
- Make sketch fill threshold configurable
- Add bézier curve tool for smooth armhole shaping
  - four-click workflow: start, control1, control2, end
  - curves flatten into 24 segments for fill and row-count calculations
  - full selection, deletion, persistence, and undo/redo support
  - add Bézier button to the sidebar shape tools
- Add pattern import/export with replace and merge modes
  - serialize sketch state to JSON pattern files
  - import supports replace (overwrite) and merge (remap ids and append)
  - add export and import buttons to the sketch panel

## Fixes

- Handle gzip-compressed webhook payloads from GitHub
  - GitHub sends webhooks with Content-Encoding: gzip for larger payloads. The signature is computed on the raw compressed bytes, so decompression must happen after signature verification. Also collect raw Buffer chunks instead of concatenating strings to avoid corrupting binary gzip data.
- Handle form-urlencoded webhook payloads from GitHub
  - GitHub webhooks can be configured with Content-Type application/x-www-form-urlencoded, which wraps the JSON payload in a payload= form field. Parse the form field and URL-decode the JSON after signature verification. Also handle the gzip case on the raw bytes before form parsing.
- Drop /pages/ prefix from nav and changelog fragment URLs
- Offset icons beside constrained geometry
- Rebuild hydrated objects and resolve source imports

## Documentation

- Update solver migration roadmap and AGENTS notes

## Refactors

- Align v1/v2 fragments and add version anchors
  - add version anchor IDs to first li per version in generator
  - wrap single-string descriptions in ul/li instead of p
  - add v1 sidebar blocks (Change Types + Versions) with data-version
  - fix sidebar block show/hide on tab switch
  - align v1 style to match v2 (heading levels, labels, text)
  - remove build snapshot description sentence
  - update aria-label to Changelog sections
- Split sketchLayer into focused render and event modules
  - extract entity rendering into sketchEntityRenderer.js
  - extract preview rendering into sketchPreviewRenderer.js
  - extract hit testing into sketchHitTest.js
  - extract stage event setup into sketchStageEvents.js
  - include bézier rendering and hit testing in the new modules
  - flatten bézier segments in gridLayer for closed-shape fill
- Convert rectangle to individual lines with corner-to-corner workflow
  - corner-to-corner workflow replaces center-outward
  - center point snaps to nearby existing points (e.g. origin anchor)
  - diagonal construction lines keep center alive via midpoint constraints
  - deleting both diagonals reclaims center point via orphan cleanup
  - each edge is independently selectable and deletable
  - remove rectangle composite from persistence, snapshot, selection, and deletion

## Tests

- Wait for solver readiness and add circle/rectangle/parallel specs
- Remove dead dofAnalyzer/overconstraintChecker tests and stub solver in undo tests

## Maintenance

- Reorganise static pages and partials under public/pages
  - Move index.html, changelog pages, changelog fragments, and partials into public/pages so Vite's publicDir and htmlIncludes plugin serve them consistently.
- Split SolveSpace WASM runtime into .js and .wasm
  - Replace the single-file base64-embedded slvs.js with a separate slvs.wasm binary so the browser can stream and instantiate it.

## Other Changes

- Align type scale, chip, panel, and list styles with CraftCMS
  - reduce type-body to 14px and type-subtitle to 13px
  - change chip to inline-flex with 12px border-radius
  - update panel padding and add margin-bottom
  - add list styling with border-top separators in panel--padded
  - widen page-layout sidebar column to 340px
  - adjust sticky sidebar top offset to 129px
  - remove subtitle and container-content scoped styles
  - add changelog sidebar block and version scroll CSS
  - add tab-bar, tab-btn, and tab-panel CSS
- Update sidebar, header, and index markup for new page layout


## v0.4.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/tree/v0.4.0)

## Features

- Add build-time HTML includes via Vite plugin
  - add htmlIncludes() Vite plugin for HTML include directives
  - create partials/header.html, footer.html, sidebar.html
  - refactor index.html to use includes instead of inline header/footer
  - add page-home body class for nav active state

## Documentation

- Document WASM solver loading and mitigations
  - Record the root cause (SINGLE_FILE=1 base64 embed forcing synchronous decode + non-streaming instantiate), the lazy-load mitigations shipped here, and the approaches tried and rejected (requestIdleCallback, listening:false on grid/overlay layers, E2E flakiness) so future sessions don't re-investigate the freeze in circles.

## Tests

- Wait for lazy solver load in sketch helpers
  - The solver no longer loads eagerly at boot, so automated tests that click through constraint/dimension steps in milliseconds race ahead of the async WASM load. Explicitly trigger ensureSolver() and wait for ready in openSketch() to keep constraint-dependent assertions deterministic.


## v0.3.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/tree/v0.3.0)

## Features

- Add changelog page with v1/v2 tabs
  - Add pages/changelog.html with separated layout (global header, page header, content area, footer) and v1/v2 tab switching
  - Add --format=html to generate-build-info.mjs for HTML changelog fragments
  - Fix artificial line breaks in captions (trim git log fields) and word-wrapped paragraph lines becoming separate bullets
  - Generate public/changelog-v2.html from KnitStitch git history
  - Copy CraftCMS changelog history to public/changelog-v1.html with caption line breaks fixed
  - Add CSS for chips, color-pairs, panels, lists, and tab bar
  - Add pages/changelog.html as second Vite build entry
  - Update nav link from /CHANGELOG.md to /pages/changelog.html
  - Update build-info scripts to also generate HTML changelog
- Add GitHub webhook for VPS auto-deploy
  - Add webhook.php adapted from CraftCMS webhook (same HMAC-SHA256 signature verification) but with npm ci + npm run build instead of composer install
  - Add .env.example with GITHUB_WEBHOOK_SECRET template
  - Add .env to .gitignore, fix corrupted .gitignore encoding
  - Update AGENTS.md with VPS deploy section, SSH setup steps, and architecture entries for webhook.php, .env.example, pages/
  - Update README.md with deployment note
- Add boot loading overlay for solver initialization
  - Shown from first paint until the SolveSpace WASM solver finishes loading so the page reads as "loading" instead of "crashed" during the main-thread block. The spinner uses a transform-only CSS animation so it keeps visibly spinning even while the main thread is busy.

## Fixes

- Defer solver load and drop canvas hit-test reads
  - The page was sluggish and triggered recurring HTML5 canvas permission prompts. Two root causes: the ~6 MB SolveSpace WASM bundle was instantiated eagerly at boot (a long main-thread block), and Konva's pixel-based hit detection called getImageData() on every pointer event (prompting per-canvas privacy permissions in browsers like LibreWolf).
  - load the solver lazily via ensureSolver() (idempotent, memoized) instead of in the SketchService constructor; main.js no longer blocks boot on it, and tool selection / solve attempts trigger it as a fallback
  - set grid and sketch layers to listening:false and route pointer events through the app's own geometry hit testing (nearestPoint/nearestLine) instead of Konva's hit canvas, eliminating the getImageData() reads that caused the repeated prompts

## Documentation

- Rewrite git-rules for KnitStitch project
  - replace Craft CMS references with Node.js tooling
  - update scopes to match project areas (sketch, solver, grid, etc.)
  - add style commit type, update examples

## Refactors

- Remove dead native solver code
  - delete 7 native solver modules and 4 unit tests (2275 lines)
  - remove solverBackend flag, native fallback branches, enforce* calls
  - adapter solve() distinguishes user-drag from reconverge semantics
  - accept RESULT_REDUNDANT_OKAY, restore anchor positions in writeBack
  - keep perpendicularFeasibility, dofAnalyzer, overconstraintChecker
- Replace PHP webhook with Node.js webhook server
  - Replace webhook.php with scripts/webhook-server.mjs (no external dependencies, uses only Node.js built-ins)
  - Add ecosystem.config.cjs for PM2 process management
  - Update .env.example to reference webhook-server.mjs
  - Update AGENTS.md with Node.js webhook setup instructions (PM2, nginx proxy, ecosystem config)
  - Update README.md deploy note
  - nginx on the KnitStitch subdomain is a static/Node site with no PHP processing, so the PHP webhook returned 405. The Node.js server runs on 127.0.0.1:3001 with nginx proxying /webhook to it.

## Other Changes

- Update app styles and index.html


## v0.2.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/tree/v0.2.0)

## Features

- Integrate SolveSpace WASM constraint solver
  - Replace the hand-rolled gradient-descent solver with SolveSpace's Newton's-method solver, compiled to WebAssembly. Shipped behind a solverBackend feature flag ('native' | 'slvs') so the existing solver stays available as a fallback.
  - The SolveSpace solver is built from a fork of solvespace/solvespace (XanthiaJo/SolverWasm) which already includes embind JS bindings and a CMake slvs-wasm target. The built slvs.js (6 MB, single-file with embedded WASM) is committed as a static asset in public/wasm/.
  - Key pieces:
  - bridges KnitStitch's sketch model (points, lines, constraints, dimensions in pixels) to SolveSpace entities. Uses a uniform scale (X-axis stitch scale) for both axes to preserve angles despite the non-square grid.
  - sketchService._solve: single dispatch point that routes to the SLVS adapter when the flag is set, otherwise falls through to the existing native solver path.
  - all three dual-solver branches replaced with service._solve() calls.
  - solverBackend flag added to sketch state, currently set to 'slvs'.
  - SolveSpace is GPL-3.0-or-later, so KnitStitch adopts GPL-3.0-or-later accordingly (LICENSE added, package.json updated).

## Maintenance

- Add VS Code workspace config and build tooling
  - Add VS Code launch/tasks config, the build-info generator script, generated buildInfo.js, CHANGELOG.md, and the historical CraftCMS changelog reference.


## v0.1.0

Published 2026-08-08 — [View on GitHub](https://github.com/Box-of-Dragons/KnitStitch/tree/v0.1.0)

## Breaking Changes

- Initialize standalone KnitStitch Grid app
  - extract app from CraftCMS into standalone Vite project
  - serve from own subdomain (www.knitstitch.misssponto.me.uk)
  - standalone index.html with simple header, no Craft partials
  - extract CSS into public/css/app.css with design tokens and components
  - update test configs for Vite dev server (no DDEV/CraftCMS needed)
  - 93 unit tests passing, Playwright E2E auto-starts dev server
  - KnitStitch is now a standalone app, no longer embedded in CraftCMS.

