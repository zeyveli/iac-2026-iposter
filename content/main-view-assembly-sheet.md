# IAC 2026 iPoster — main-view assembly sheet

This sheet is the exact assembly guide for the fixed six-panel template. It
covers only the collapsed poster view; expanded text and interactive pages are
already prepared separately. The iframe URLs remain placeholders until the
static site is hosted.

## Header

| Field | Entry |
|---|---|
| Logo | `assets/images/itu-seal.png` |
| Title | Development of a GPU-Accelerated High-Order Compact Incompressible Flow Solver |
| Authors | Elif Mihriban Zeyveli · Fırat Oğuz Edis |
| Affiliation | Istanbul Technical University · Astronautical Engineering |
| Paper code | IAC-26,C4,IP,63,x110913 |

Keep the İTÜ seal at its native aspect ratio. Place it at the far left of the
header with clear white space. Do not stretch, recolour or crop it.

## Fixed-panel placement

| Position | Panel | Main-view treatment |
|---|---|---|
| Top left | Motivation & Objective | Short text plus three contribution labels |
| Bottom left | Conclusion | Three numbered takeaways and one scope line |
| Centre, full height | Method | Portrait workflow graphic only |
| Top right, left | Validation | Square validation summary graphic |
| Top right, right | Performance | Square performance summary graphic |
| Bottom right, full width | Visual Summary | Five-image slider |

## Top left — Motivation & Objective

### Paste-ready main-view copy

**Motivation**

Wall-bounded flows are central to liquid-propulsion systems, but fully resolved
simulation remains computationally demanding. High-order compact schemes offer
spectral-like resolution while introducing implicit line systems and a global
pressure-Poisson problem.

**Objective**

Develop and verify a GPU-accelerated, high-order incompressible-flow solver for
wall-bounded flows and future turbulence-data generation.

**High-order accuracy · Consistent incompressibility · GPU-oriented solution**

### Assembly rules

- Keep the objective visually dominant in a pale-blue callout.
- Use the three contribution labels as a single compact row or three short
  stacked labels.
- Do not add equations, citations or an iframe to the collapsed view.
- If the panel overflows, shorten the first paragraph; do not shrink to fit.

## Centre — Method

### Upload

- Primary: `poster-assets/method-workflow.png`
- Vector backup: `poster-assets/method-workflow.svg`
- Native aspect ratio: 900 × 1260, portrait

### Caption

Sixth-order compact, half-staggered projection method implemented entirely on
the GPU.

### Assembly rules

- Make the workflow the dominant object and centre it vertically.
- Use image-fit **contain**; never crop the return arrow or bottom GPU banner.
- Do not repeat the six workflow steps as body text in the collapsed panel.
- The expanded Method panel will contain four iframe blocks after hosting.

## Top right, left — Validation

### Upload

- Primary: `poster-assets/validation-summary.png`
- Vector backup: `poster-assets/validation-summary.svg`
- Native aspect ratio: 1100 × 1000

### Optional one-line caption

Laminar Blasius verification · maximum error below 0.12%.

### Assembly rules

- Use image-fit **contain** and fill as much of the panel width as possible.
- The error statement is already included in the graphic; omit the optional
  caption if it causes vertical scrolling.
- Do not describe transition or turbulent-flow validation.

## Top right, right — Performance

### Upload

- Primary: `poster-assets/performance-summary.png`
- Vector backup: `poster-assets/performance-summary.svg`
- Native aspect ratio: 1100 × 1000

### Optional one-line caption

Mean BiCGSTAB iterations increase from 6.63 to 8.43 across 512× more nodes.

### Assembly rules

- Use image-fit **contain** and preserve the plot labels and observed ranges.
- The headline and pressure-solution share are already included in the graphic.
- Omit the optional caption if the panel would scroll.

## Bottom left — Conclusion

### Paste-ready main-view copy

1. **Accurate:** Blasius quantities reproduced with less than 0.12% maximum
   error.
2. **Scalable:** Mean pressure-solver iterations increase from 6.63 to 8.43
   across 512× more nodes.
3. **GPU-oriented:** Batched compact operators and matrix-free BiCGSTAB–GMG
   enable large three-dimensional simulations.

**Take-home message:** High-order spatial accuracy and scalable GPU pressure
projection are achieved in one incompressible-flow solver.

**Current scope:** Laminar boundary-layer validation and GPU pressure-solver
performance.

### Assembly rules

- Make the three bold lead words the visual anchors.
- Keep acknowledgements, funding details and future work in the expanded panel.
- If space is tight, remove the current-scope line first; do not shrink to fit.

## Bottom right — Visual Summary

Load the images in this exact order:

| Slide | Upload | Caption |
|---:|---|---|
| 1 | `slider/01-blasius-validation.png` | Numerical similarity profiles and integral quantities reproduce the analytical Blasius solution within 0.12%. |
| 2 | `slider/02-half-staggered.png` | Nodal velocity and cell-centred pressure are coupled through face-normal divergence and gradient operators. |
| 3 | `slider/03-batched-lines.png` | Independent compact grid-line systems are grouped into GPU-batched tridiagonal solves. |
| 4 | `slider/04-gmg-convergence.png` | GMG-preconditioned BiCGSTAB maintains nearly grid-independent convergence over the tested grids. |
| 5 | `slider/05-timestep-performance.png` | Sufficiently large grids approach linear timestep scaling on the NVIDIA A100 GPU. |

The matching SVG files may be used if the iPoster platform accepts SVG uploads.
All slider graphics have a 1600 × 500 native aspect ratio. Use **contain**, keep
captions to one sentence and disable any automatic crop.

## Expanded-panel iframe placeholders

After hosting, replace `<BASE-URL>` with the GitHub Pages project URL. Do not
change the route names.

| Expanded topic | URL placeholder |
|---|---|
| Compact spatial discretization | `<BASE-URL>/pages/compact/index.html` |
| Half-staggered projection | `<BASE-URL>/pages/projection/index.html` |
| Batched GPU line solves | `<BASE-URL>/pages/batching/index.html` |
| Matrix-free BiCGSTAB–GMG | `<BASE-URL>/pages/multigrid/index.html` |
| Validation profiles | `<BASE-URL>/pages/validation-profiles/index.html` |
| Validation integral quantities | `<BASE-URL>/pages/validation-integrals/index.html` |
| Pressure convergence | `<BASE-URL>/pages/performance-convergence/index.html` |
| Timestep scaling | `<BASE-URL>/pages/performance-scaling/index.html` |
| Timestep composition | `<BASE-URL>/pages/performance-composition/index.html` |

## Final collapsed-view acceptance check

- No panel shows a vertical or horizontal scrollbar.
- The Method workflow is readable without opening the panel.
- Both numerical headlines are legible at the normal poster view.
- Slider captions match their numbered files.
- The title, author names, affiliation and paper code are correct.
- The İTÜ seal is not distorted.
- No transition or turbulence result is claimed.
