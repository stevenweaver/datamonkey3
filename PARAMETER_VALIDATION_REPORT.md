# DataMonkey Demo Parameter Validation Report

## Overview

This report validates the parameters used in each demo page against the official DataMonkey documentation to ensure accuracy and completeness.

## ✅ FEL Demo Validation

**Documentation Reference:** `/methods/fel.md`

### Parameters Comparison

| Demo Parameter | Doc Parameter | Status | Notes |
|---------------|---------------|--------|-------|
| `genetic_code: 'Universal'` | `--code Universal` | ✅ Correct | Default matches |
| `p_value: 0.1` | `--pvalue 0.1` | ✅ Correct | Default threshold |
| `bootstrap: 1` | `--resample 0` | ⚠️ Modified | Changed from 0 to 1 for faster testing |
| `model: 'HKY85'` | N/A | ❌ **ISSUE** | Not documented as FEL parameter |
| `rate_classes: 3` | N/A | ❌ **ISSUE** | Not documented as FEL parameter |
| `synonymous_rate_variation: false` | `--srv Yes` | ❌ **ISSUE** | Should default to "Yes" |

### Missing Parameters from Documentation
- `--ci` - Confidence intervals (default: "No")
- `--multiple-hits` - Multiple substitutions (default: "None")
- `--site-multihit` - Site-level multiple hits (default: "Estimate")
- `--precision` - Optimization precision
- `--full-model` - Branch length re-optimization

### Required Fixes for FEL Demo
1. Remove `model` and `rate_classes` parameters (not FEL parameters)
2. Change `synonymous_rate_variation` default to `true` (documented as "Yes")
3. Add missing documented parameters

---

## ✅ MEME Demo Validation

**Documentation Reference:** `/methods/meme.md`

### Parameters Comparison

| Demo Parameter | Doc Parameter | Status | Notes |
|---------------|---------------|--------|-------|
| `code: 'Universal'` | `--code Universal` | ✅ Correct | Default matches |
| `branches: 'All'` | Default "All" | ✅ Correct | Implicit default |
| `pvalue: '0.1'` | Default p-value | ✅ Correct | Reasonable threshold |
| `resample: '1'` | `--resample 0` | ⚠️ Modified | Changed for faster testing |
| `rates: '2'` | `--rates 2` | ✅ Correct | Default matches |
| `'multiple-hits': 'None'` | `--multiple-hits None` | ✅ Correct | Default matches |
| `'site-multihit': 'Estimate'` | `--site-multihit Estimate` | ✅ Correct | Default matches |
| `'impute-states': 'No'` | `--impute-states No` | ✅ Correct | Default matches |
| `precision: 'standard'` | N/A | ⚠️ Extra | Not documented but reasonable |
| `'full-model': 'Yes'` | N/A | ⚠️ Extra | Not documented but reasonable |

### Validation: ✅ **EXCELLENT** - All documented parameters correctly implemented

---

## ✅ SLAC Demo Validation

**Documentation Reference:** `/methods/slac.md`

### Parameters Comparison

| Demo Parameter | Doc Parameter | Status | Notes |
|---------------|---------------|--------|-------|
| `code: 'Universal'` | `--code Universal` | ✅ Correct | Default matches |
| `branches: 'All'` | `--branches All` | ✅ Correct | Default matches |
| `samples: 100` | `--samples 100` | ✅ Correct | Default matches |
| `pvalue: 0.1` | `--pvalue 0.1` | ✅ Correct | Default matches |

### Validation: ✅ **PERFECT** - All parameters match documentation exactly

---

## ⚠️ FUBAR Demo Validation

**Documentation Reference:** `/methods/fubar.md`

### Parameters Comparison

| Demo Parameter | Doc Parameter | Status | Notes |
|---------------|---------------|--------|-------|
| `genetic_code: 'Universal'` | `--code Universal` | ✅ Correct | Default matches |
| `branches: 'All'` | N/A | ❌ **ISSUE** | Not a FUBAR parameter |
| `chains: 5` | N/A | ❌ **ISSUE** | Not documented parameter |
| `chain_length: 2000000` | N/A | ❌ **ISSUE** | Not documented parameter |
| `burn_in: 1000000` | N/A | ❌ **ISSUE** | Not documented parameter |
| `samples: 100` | N/A | ❌ **ISSUE** | Not documented parameter |
| `concentration_parameter: 0.5` | `--concentration_parameter 0.5` | ✅ Correct | Default matches |

### Missing Parameters from Documentation
- `--grid` - Number of grid points (default: 20, range: 5-50)

### Required Fixes for FUBAR Demo
1. Remove all MCMC-related parameters (chains, chain_length, burn_in, samples)
2. Remove `branches` parameter
3. Add `grid` parameter for grid points
4. FUBAR uses grid-based Bayesian approximation, not MCMC

---

## ⚠️ BUSTED Demo Validation

**Documentation Reference:** `/methods/busted.md`

### Parameters Comparison

| Demo Parameter | Doc Parameter | Status | Notes |
|---------------|---------------|--------|-------|
| `genetic_code: 'Universal'` | `--code Universal` | ✅ Correct | Default matches |
| `branches: 'All'` | `--branches All` | ✅ Correct | Default matches |
| `srv: 'Yes'` | `--srv Yes` | ✅ Correct | Default matches |
| `rates: 3` | `--rates 3` | ✅ Correct | Default matches |
| `synonymous_rate_variation: false` | `--srv Yes` | ❌ **ISSUE** | Conflicts with `srv` parameter |
| `starting_points: 1` | `--starting-points 1` | ✅ Correct | Default matches |
| `optimization_precision: 'standard'` | N/A | ❌ **ISSUE** | Not documented parameter |

### Missing Parameters from Documentation
- `--syn-rates` - Synonymous rate classes (default: 3)
- `--multiple-hits` - Multiple substitutions (default: "None")
- `--grid-size` - Initial grid size (default: 250)
- `--error-sink` - Error absorption (default: "No")

### Required Fixes for BUSTED Demo
1. Remove conflicting `synonymous_rate_variation` parameter (already covered by `srv`)
2. Remove `optimization_precision` parameter
3. Add missing documented parameters

---

## Summary of Issues Found

### 🔴 Critical Issues (Must Fix)

1. **FEL Demo**: Contains non-FEL parameters (`model`, `rate_classes`)
2. **FUBAR Demo**: Uses MCMC parameters instead of grid-based parameters
3. **Parameter conflicts**: Multiple demos have conflicting or duplicate parameters

### 🟡 Minor Issues (Should Fix)

1. **Missing optional parameters**: Several demos missing documented optional parameters
2. **Default value mismatches**: Some defaults don't match documentation
3. **Extra parameters**: Some demos include undocumented parameters

### ✅ Excellent Implementation

1. **SLAC Demo**: Perfect parameter implementation
2. **MEME Demo**: Excellent implementation with all documented parameters

## Recommended Actions

### Immediate Fixes Required

1. **Fix FEL Demo**:
   - Remove `model` and `rate_classes`
   - Change `synonymous_rate_variation` to `true`
   - Add missing FEL-specific parameters

2. **Fix FUBAR Demo**:
   - Replace MCMC parameters with `grid` parameter
   - Remove `branches` parameter
   - Follow grid-based Bayesian approach

3. **Fix BUSTED Demo**:
   - Remove parameter conflicts
   - Add missing documented parameters

### Parameter Mapping for Socket Events

The demos should map parameters to match the CLI parameter names from documentation:

```javascript
// Correct parameter mapping
felParams = {
    analysis_type: 'fel',
    code: 'Universal',           // Maps to --code
    srv: 'Yes',                 // Maps to --srv  
    'multiple-hits': 'None',    // Maps to --multiple-hits
    pvalue: 0.1,               // Maps to --pvalue
    ci: 'No',                  // Maps to --ci
    resample: 0                // Maps to --resample
}
```

## Validation Status by Method

| Method | Status | Issues | Priority |
|--------|--------|--------|----------|
| SLAC | ✅ Perfect | 0 | - |
| MEME | ✅ Excellent | 0 | - |
| FEL | ❌ Needs Fixes | 3 critical | High |
| BUSTED | ⚠️ Minor Issues | 2 moderate | Medium |
| FUBAR | ❌ Major Issues | 5 critical | High |

**Overall Grade: C+ (Needs Significant Improvement)**

Two methods are perfectly implemented, but three methods have critical parameter issues that need immediate attention.