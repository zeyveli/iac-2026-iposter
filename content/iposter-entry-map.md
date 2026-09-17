# IAC 2026 iPoster entry map

This is the assembly map for the approved content package. Paths are relative to
the static site root, so the same values work in a local preview and a
GitHub Pages project site. Replace only the host/base path supplied by the
iPoster platform; do not rewrite route names.

## Submission metadata

| iPoster field | Paste-ready value |
|---|---|
| Title | Development of a GPU-Accelerated High-Order Compact Incompressible Flow Solver |
| Authors | Elif Mihriban Zeyveli; Fırat Oğuz Edis |
| Affiliation | Istanbul Technical University, Department of Astronautical Engineering |
| Paper code | IAC-26,C4,IP,63,x110913 |
| Congress | 77th International Astronautical Congress (IAC 2026), Antalya, Türkiye, 5–9 October 2026 |
| Contact role | Elif Mihriban Zeyveli, corresponding author |

## Panel-to-copy map

| Poster area | Collapsed copy | Expanded copy | Primary visual / entry |
|---|---|---|---|
| Top left | `collapsed-panels.md`, “Motivation & Objective” | `expanded-panels.md`, “Motivation & Objective” | Objective callout and three contribution blocks |
| Centre, full height | `collapsed-panels.md`, “Method” | `expanded-panels.md`, “Method” | Six-step vertical workflow |
| Top right, left | `collapsed-panels.md`, “Validation” | `expanded-panels.md`, “Validation” | Blasius profiles and integral-error banner |
| Top right, right | `collapsed-panels.md`, “Performance” | `expanded-panels.md`, “Performance” | GMG-preconditioned iteration plot |
| Bottom left | `collapsed-panels.md`, “Conclusion” | `expanded-panels.md`, “Conclusion and scope” | Accurate / Scalable / GPU-oriented takeaways |
| Bottom right, full width | `collapsed-panels.md`, “Visual Summary slider” | Slider captions below | Five approved SVG/PNG summary images |

## Exact iframe route map

Use the following relative `iframe src` values. Each route is responsive and
supports vertical scrolling and a fullscreen view.

| Route (`iframe src`) | Panel / topic | Embedded page must show |
|---|---|---|
| `./pages/compact/index.html` | Method — compact spatial discretization | Modified wavenumber and points-per-wavelength comparison; scheme selection |
| `./pages/projection/index.html` | Method — half-staggered projection | Grid arrangement and animated five-stage timestep sequence |
| `./pages/batching/index.html` | Method — batched GPU tridiagonal solves | Grid-line selection, batching, factorization reuse and memory layout |
| `./pages/multigrid/index.html` | Method — matrix-free BiCGSTAB-GMG | Pressure-operator pathway and multigrid hierarchy |
| `./pages/validation-profiles/index.html` | Validation — similarity profiles | Station selection, analytical/numerical curves, toggles and hover inspection |
| `./pages/validation-integrals/index.html` | Validation — integral quantities | Selectable \(\delta^*\), \(\theta\), \(H_{12}\) and \(C_f\) comparison |
| `./pages/performance-convergence/index.html` | Performance — pressure convergence | Mean/range iterations, logarithmic node-count axis and hover data |
| `./pages/performance-scaling/index.html` | Performance — timestep scaling | Measured timestep versus ideal linear scaling |
| `./pages/performance-composition/index.html` | Performance — timestep composition | Stacked pressure, momentum/compact and remaining-operation bars |

The root `index.html` is a development index for checking these nine routes; it
is not an additional scientific panel or a submission iframe.

## Visual Summary slider captions

| Slide | Caption | Approved visual intent |
|---:|---|---|
| 1 | Numerical similarity profiles and integral quantities reproduce the analytical Blasius solution within 0.12%. | Blasius validation |
| 2 | Nodal velocity and cell-centred pressure are coupled through face-normal divergence and gradient operators. | Half-staggered arrangement |
| 3 | Independent compact grid-line systems are grouped into GPU-batched tridiagonal solves. | Batched GPU line systems |
| 4 | GMG-preconditioned BiCGSTAB maintains nearly grid-independent convergence over the tested grids. | Pressure-solver performance |
| 5 | Sufficiently large grids approach linear timestep scaling on the NVIDIA A100 GPU. | Timestep scaling |

## Acknowledgements

Computing resources used in this work were provided by the National Center for
High Performance Computing of Turkey (UHeM) under grant number 4013792022.
This study is also supported by Scientific Research Projects Coordination Unit
of Istanbul Technical University (ITU) through the LOKAP-H Research Funding
Program under Project No. FLO-2026-48134.

## Scope and publication gate

The current evidence is laminar Blasius validation plus GPU pressure-solver
performance. The corrected staggered face-velocity field may be described as
satisfying the prescribed divergence criterion; the interpolated nodal velocity
field must not be called divergence-certified. Controlled transition and
turbulent-flow results are not presented in the current study. Do not add
transition claims, turbulent-flow imagery or unsupported comparisons during
assembly.

This package is prepared for local preview and static hosting. Publication to a
public iPoster entry, GitHub repository or GitHub Pages deployment requires
separate approval.
