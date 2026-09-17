# IAC 2026 iPoster — collapsed-panel copy

**Paper:** Development of a GPU-Accelerated High-Order Compact Incompressible Flow Solver  
**Authors:** Elif Mihriban Zeyveli and Fırat Oğuz Edis  
**Affiliation:** Istanbul Technical University, Department of Astronautical Engineering  
**Paper code:** IAC-26,C4,IP,63,x110913

This file is the short copy intended for the six-panel iPoster assembly. Keep the
headlines and result banners visually dominant; technical detail belongs in the
expanded panels and responsive iframe pages.

## 1. Motivation & Objective

### Motivation

Turbulent wall-bounded flows occur in liquid-propulsion systems, including
propellant tanks, feed systems and injectors. Direct Numerical Simulation
provides fully resolved flow information but remains computationally demanding.

High-order compact schemes offer spectral-like spatial resolution, but their
implicit line systems and the global pressure-Poisson problem complicate
efficient GPU implementation.

### Objective

> Develop and verify a GPU-accelerated, high-order incompressible-flow solver
> for wall-bounded flows and future turbulence-data generation.

### Contribution blocks

1. **High-order accuracy:** sixth-order compact finite differences.
2. **Consistent incompressibility:** half-staggered pressure projection.
3. **GPU-oriented solution:** batched tridiagonal systems and matrix-free
   BiCGSTAB-GMG.

## 2. Method

### Sixth-order compact, half-staggered projection workflow

1. Nodal velocity and cell-centred pressure.
2. AB2 momentum predictor.
3. Compact interpolation to velocity faces.
4. Matrix-free pressure projection using BiCGSTAB and GMG.
5. Velocity and pressure correction.
6. Return to the nodal representation for the next timestep.

> Sixth-order compact, half-staggered projection method implemented entirely on
> the GPU.

## 3. Validation

### Laminar Flat-Plate Boundary Layer

The dominant composite figure shows Blasius similarity profiles and the
skin-friction comparison.

> **Maximum error below 0.12%** across \(\delta^*\), \(\theta\), \(H_{12}\) and
> \(C_f\).

The demonstrated result is laminar boundary-layer verification. The corrected
staggered face-velocity field satisfies the prescribed divergence criterion;
the interpolated nodal velocity field is not described as
divergence-certified.

## 4. Performance

The GMG-preconditioned iteration plot is the dominant visual.

> **6.63 to 8.43 mean BiCGSTAB iterations** while the problem size increases
> by **512 times**.

Pressure solution accounts for **73–82%** of the timestep.

## 5. Conclusion

1. **Accurate:** Blasius quantities reproduced with less than 0.12% maximum
   error.
2. **Scalable:** mean pressure-solver iterations increase from 6.63 to 8.43
   across a 512-times increase in nodes.
3. **GPU-oriented:** batched compact operators and matrix-free BiCGSTAB-GMG
   enable large three-dimensional high-order simulations.

> The developed solver combines high-order spatial accuracy with scalable GPU
> pressure projection for wall-bounded incompressible flows.

**Current scope:** The demonstrated results establish laminar boundary-layer
accuracy and GPU pressure-solver scalability. Controlled transition and
turbulent-flow results are not presented in the current study.

## 6. Visual Summary slider

Use these short captions in the five-image slider. The images should be built
from the same approved numerical data as the expanded pages.

1. **Blasius verification:** Numerical similarity profiles and integral
   quantities reproduce the analytical solution within 0.12%.
2. **Half-staggered projection:** Nodal velocity and cell-centred pressure are
   coupled through face-normal divergence and gradient operators.
3. **GPU batching:** Independent compact grid-line systems are grouped into
   GPU-batched tridiagonal solves.
4. **GPU pressure solve:** GMG-preconditioned BiCGSTAB maintains nearly
   grid-independent convergence over the tested grids.
5. **Timestep scaling:** Sufficiently large grids approach linear timestep
   scaling on the NVIDIA A100 GPU.

## Credits

Computing resources used in this work were provided by the National Center for
High Performance Computing of Turkey (UHeM) under grant number 4013792022.
This study is also supported by Scientific Research Projects Coordination Unit
of Istanbul Technical University (ITU) through the LOKAP-H Research Funding
Program under Project No. FLO-2026-48134.
