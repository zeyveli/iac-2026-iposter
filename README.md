# IAC 2026 interactive iPoster

Static, responsive microsite content for **Development of a GPU-Accelerated
High-Order Compact Incompressible Flow Solver** by Elif Mihriban Zeyveli and
Fırat Oğuz Edis (IAC-26,C4,IP,63,x110913).

The root page is a development index for the nine iframe routes. The approved
collapsed and expanded panel copy, entry map, numerical fixtures and route
pages are kept together so the iPoster assembly can use the same terminology
and claims everywhere.

The official transparent İTÜ seal supplied by the authors is stored at
`assets/images/itu-seal.png`; preserve its aspect ratio and clear space when
placing it in the iPoster header.

## Local preview

From this directory, run:

```sh
python3 -m http.server 4173
```

Then open <http://localhost:4173/>. Serving over HTTP is recommended because
some browsers restrict module or asset loading from `file://` URLs. The route
links on the development index are the exact relative paths intended for iframe
`src` values.

Run the content and scientific claim checks with:

```sh
npm test
npm run check
```

## GitHub Pages-ready static hosting

The package is GitHub Pages-ready: publish the `iac-iposter/` directory as the
site root, preserve the `assets/`, `content/`, `data/`, `pages/`, `scripts/` and
`tests/` paths, and enable Pages for the selected branch or static artifact.
Relative links (`./pages/...`) allow the site to work under a project-site base
path without a server-side component or third-party runtime API. If a hosting
workflow adds a base path, keep the route names unchanged.

## Content and scope guardrails

- The demonstrated results are laminar Blasius boundary-layer accuracy and GPU
  pressure-solver performance.
- The corrected staggered face-velocity field satisfies the prescribed
  divergence criterion. The interpolated nodal velocity field is not described
  as divergence-certified.
- Controlled transition and turbulent-flow results are not presented in the
  current study. They remain future scope.
- Acknowledgements, grant numbers, paper code and exact iframe mapping are in
  [`content/iposter-entry-map.md`](content/iposter-entry-map.md).

## Publication gate

Local preview and static hosting preparation do not publish the work. Public
iPoster submission, creation of an external repository, and GitHub Pages
deployment each require separate approval from the authors/owner.

Publication requires separate approval.
