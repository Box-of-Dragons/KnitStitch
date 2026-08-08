# KnitStitch Cleanup Backlog

This file tracks code that is still present in the repo but is no longer part of the public KnitStitch 2D surface.

Treat these items as future cleanup work. Do not delete shared CAD runtime pieces until the 2D sketcher has been audited against them.

## Retired Public Surface

| Area | Status | Primary code | Notes |
|---|---|---|---|
| 3D app bootstrap | Candidate | `web/app/index.js` | No longer built by `webpack.config.js`. Safe candidate for removal once nothing else imports it. |
| 3D entry shell | Candidate | `web/index.html` | Replaced by the 2D sketcher shell. Keep only if you need a historical reference. |
| 3D workbench UI | Candidate | `modules/workbenches/modeler/index.ts` | Likely removable from the KnitStitch fork if no remaining 2D path imports modeler workbench actions. |
| 3D app docs | Candidate | `README.md`, `docs/maintainer-notes.md`, `AGENTS.md` | Updated to describe KnitStitch as 2D-first. Leave the current wording in place unless the fork direction changes again. |

## Shared Runtime To Audit Before Deletion

| Area | Status | Primary code | Notes |
|---|---|---|---|
| Scene / viewer shell | Keep for now | `web/app/cad/dom/components/View3d.jsx`, `web/app/cad/dom/components/WebApplication.jsx` | The public 2D app still relies on portions of the CAD runtime, so these are not safe to delete blindly. |
| Scene bundles | Keep for now | `web/app/cad/scene/*`, `modules/scene/*` | Shared geometry/view infrastructure used by sketching and display flows. |
| Sketching UI | Keep | `web/app/sketcher/*`, `web/app/cad/sketch/*` | Public KnitStitch surface. Do not remove. |

## Suggested Next Pass

1. Search for direct imports of `web/app/index.js` and `modules/workbenches/modeler/*`.
2. Verify whether any 2D-only page still depends on the 3D viewer shell.
3. If nothing depends on the 3D bootstrap, remove `web/app/index.js` and any dead build wiring.
4. After that, evaluate whether the modeler workbench can be split out or archived separately.
