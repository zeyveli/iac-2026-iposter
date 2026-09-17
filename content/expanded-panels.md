# IAC 2026 iPoster — expanded-panel copy

**Paper:** Development of a GPU-Accelerated High-Order Compact Incompressible Flow Solver  
**Authors:** Elif Mihriban Zeyveli and Fırat Oğuz Edis  
**Affiliation:** Istanbul Technical University, Department of Astronautical Engineering  
**Paper code:** IAC-26,C4,IP,63,x110913

The expanded copy is the technical layer behind the collapsed six-panel
poster. Each interactive topic opens the route listed in the iframe callout.
The route pages remain one-column at embedded width and may use two columns in
fullscreen; none requires horizontal scrolling.

## Motivation & Objective

Turbulent wall-bounded flows occur in liquid-propulsion systems, including
propellant tanks, feed systems and injectors. Direct Numerical Simulation (DNS)
provides fully resolved flow information, but its cost increases with Reynolds
number because all dynamically relevant spatial and temporal scales must be
resolved. High-order compact schemes improve short-wavelength resolution over
conventional explicit finite differences. Their implicit line systems require
specialized GPU treatment, while the pressure-Poisson solve in an incompressible
projection method is often the dominant operation.

This work develops and verifies a GPU-accelerated, high-order incompressible-flow
solver for wall-bounded flows and future turbulence-data generation. The
demonstrated capability is wall-bounded incompressible-flow simulation; it is
not presented as a completed propulsion-component simulation.

The contribution combines sixth-order compact finite differences, a
half-staggered pressure projection, batched GPU tridiagonal line solves, and a
matrix-free BiCGSTAB pressure solve with geometric-multigrid (GMG)
preconditioning.

## Method

### 1. Compact spatial discretization

Sixth-order compact first and direct second derivatives are used in the
interior and periodic spanwise direction, with one-sided closures at
non-periodic boundaries. Skew-symmetric convection is used for the momentum
equation. Repeated sixth-order compact midpoint interpolation is used to move
between nodal and face-normal representations; no separate explicit filter is
applied. The repeated interpolation attenuates the shortest resolved
wavelengths without introducing a separate filtering step.

**Interactive iframe:** `pages/compact/index.html` — modified-wavenumber and
points-per-wavelength comparison with scheme selection and curve toggles.

### 2. Half-staggered projection method

The three velocity components are stored at collocated nodes and pressure is
stored at cell centres. Nodal velocity is interpolated to face-normal staggered
locations, where the discrete divergence and pressure-gradient operations are
applied. The AB2 momentum predictor produces an intermediate velocity, and an
incremental pressure correction enforces incompressibility. The corrected face
velocity is transferred back to the nodal grid using compact midpoint
interpolation.

The defining pressure-correction relations are:

$$
D_hG_h\phi=\frac{1}{\Delta t}D_h\hat{\mathbf{u}}^*
$$

$$
\hat{\mathbf{u}}^{n+1}=\hat{\mathbf{u}}^*-\Delta tG_h\phi
$$

Here, \(D_h\) and \(G_h\) are the staggered discrete divergence and gradient,
\(\phi\) is the pressure correction, and \(\hat{\mathbf{u}}\) denotes the
face-normal velocity. The corrected staggered face-velocity field satisfies the
prescribed divergence criterion. The interpolated nodal velocity field is not
described as divergence-certified.

**Interactive iframe:** `pages/projection/index.html` — grid arrangement and
animated five-stage timestep sequence.

### 3. Batched GPU tridiagonal solves

Each directional compact operator creates independent tridiagonal systems along
grid lines. These systems are batched across the GPU. On a uniform grid they
share the same left-hand-side factorization, which is computed once and reused;
only the right-hand sides are recomputed. The memory layout is arranged so
neighbouring threads access neighbouring locations during the Thomas sweep.
Compact right-hand-side kernels write directly in the transposed
\((N_{\mathrm{lines}},N_{\mathrm{line}})\) layout, avoiding an explicit transpose
on the main execution path.

**Interactive iframe:** `pages/batching/index.html` — selectable grid-line
batch, factorization reuse and coalesced memory-layout view.

### 4. Matrix-free BiCGSTAB-GMG

The compact pressure operator is applied as \(D_hG_h\) without assembling a
global matrix. For each Krylov vector, the compact gradient is computed on
velocity faces and passed through the compact divergence. Because one-sided
closures and outlet pressure treatment make the operator nonsymmetric,
BiCGSTAB is used as the outer Krylov solver.

The GMG preconditioner uses a second-order seven-point Laplacian, geometric
coarsening in each Cartesian direction, full-weighting restriction, linear
prolongation, a direct coarse solve, damped wall-normal line relaxation and a
W-cycle. Each wall-normal line correction is tridiagonal, so the batched GPU
tridiagonal infrastructure is reused by the preconditioner.

**Interactive iframe:** `pages/multigrid/index.html` — matrix-free operator
pathway and multigrid hierarchy.

## Validation

### Validation case

The complete solver is assessed with a spatially developing laminar flat-plate
boundary layer and compared with the analytical Blasius solution. The case uses
a uniform Cartesian grid and a single NVIDIA A100 GPU.

| Parameter | Value |
|---|---:|
| Grid | \(1120\times1024\times120\) |
| GPU | NVIDIA A100 80 GB PCIe |
| Time step | \(2.5\times10^{-4}\) |
| Inlet \(Re_\theta\) | 174 |
| Outlet \(Re_\theta\) | approximately 317 |

The domain schematic identifies a Blasius inlet, no-slip plate, periodic
spanwise direction, far-field boundary and convective outlet. The velocity
profiles are sampled at multiple streamwise stations and expressed using the
Blasius similarity coordinate. The numerical profiles collapse onto the
analytical reference solution at all sampled stations.

**Interactive iframe:** `pages/validation-profiles/index.html` — station
selection, analytical/numerical comparison, curve toggles and hover inspection.

### Integral boundary-layer quantities

The spanwise-averaged streamwise velocity is used to compute displacement
thickness \(\delta^*\), momentum thickness \(\theta\), shape factor \(H_{12}\),
and wall skin-friction coefficient \(C_f\). The maximum relative errors over
the streamwise domain are:

| Quantity | Maximum relative error |
|---|---:|
| Displacement thickness, \(\delta^*\) | 0.06025% |
| Momentum thickness, \(\theta\) | 0.06684% |
| Shape factor, \(H_{12}\) | 0.03086% |
| Skin-friction coefficient, \(C_f\) | 0.11192% |

**Interactive iframe:** `pages/validation-integrals/index.html` — selectable
metric with streamwise numerical and analytical quantities.

### Numerical verification statement

Periodic compact operators recover the expected sixth-order behaviour. The
corrected staggered face-velocity field satisfies the prescribed divergence
criterion. The interpolated nodal velocity field is not described as
divergence-certified. Taken together, the complete spatially developing solver
reproduces the Blasius solution to within 0.12%, supporting the accuracy of the
compact discretization, boundary treatment and pressure-projection procedure.

## Performance

### Benchmark configuration

Thirty timesteps were sampled for each case on one NVIDIA A100 80 GB PCIe GPU
using identical physical parameters.

| Case | Grid | Total nodes |
|---|---:|---:|
| G1 | \(140\times128\times15\) | 268,800 |
| G2 | \(280\times256\times30\) | 2,150,400 |
| G3 | \(560\times512\times60\) | 17,203,200 |
| G4 | \(1120\times1024\times120\) | 137,625,600 |

### Pressure-solver convergence

The GMG-preconditioned BiCGSTAB iteration count remains nearly grid
independent over the tested range. Mean iterations increase from 6.63 for G1
to 8.43 for G4 while total nodes increase by 512 times (approximately a 27%
increase in mean iterations). The observed ranges are 6–7 for G1 and 8–10 for
G4.

**Interactive iframe:** `pages/performance-convergence/index.html` — mean and
range of iterations on a logarithmic node-count axis with hoverable case data.

### Timestep scaling

The complete timestep scales approximately linearly once the GPU is sufficiently
occupied. From G2 to G3, eight times more nodes produce a 7.90-times longer
timestep. From G3 to G4, eight times more nodes produce an 8.50-times longer
timestep. G1 is not emphasized because the smallest case does not fully occupy
the GPU.

**Interactive iframe:** `pages/performance-scaling/index.html` — measured
timestep compared with ideal linear scaling.

### Timestep composition

The pressure-Poisson solution remains the dominant operation, accounting for
73–82% of measured timestep execution. Its relative contribution decreases from
81.5% for G1 to 73.0% for G4. The remaining execution is grouped into momentum
and compact operators and other operations.

The largest sequential benchmark showed approximately 56 GiB of observed device
occupancy. This is not an isolated working-set measurement because allocations
persisted between cases.

**Interactive iframe:** `pages/performance-composition/index.html` — stacked
execution-time bars for pressure-Poisson, momentum and compact operators, and
remaining operations.

### Performance conclusion

The GPU implementation maintains nearly grid-independent pressure-solver
convergence and approximately linear timestep scaling on sufficiently large
grids.

## Conclusion and scope

The developed solver provides:

- a three-dimensional incompressible solver with sixth-order compact finite
  differences;
- half-staggered pressure projection with nodal velocity storage;
- batched GPU tridiagonal line solves;
- a matrix-free compact pressure operator;
- GMG-preconditioned BiCGSTAB; and
- complete-solver verification against the analytical Blasius solution.

The demonstrated results establish laminar boundary-layer accuracy and GPU
pressure-solver scalability. Controlled transition and turbulent-flow results
are not presented in the current study. They are future scope, not a result of
this poster.

## Acknowledgements

Computing resources used in this work were provided by the National Center for
High Performance Computing of Turkey (UHeM) under grant number 4013792022.
This study is also supported by Scientific Research Projects Coordination Unit
of Istanbul Technical University (ITU) through the LOKAP-H Research Funding
Program under Project No. FLO-2026-48134.
