# Contrast-FEL Backend Integration Specification

## Overview

This document specifies the data format and implementation details for Contrast-FEL analysis integration between the frontend application and the datamonkey-js-server backend.

## Socket.IO Event

**Event Name**: `cfel:spawn`

The frontend maps `contrast-fel` method to `cfel` for backend communication:

```javascript
const methodNameMap = {
    'contrast-fel': 'cfel'
};
const backendMethodName = methodNameMap[method.toLowerCase()] || method.toLowerCase();
const eventName = `${backendMethodName}:spawn`; // Results in: "cfel:spawn"
```

## Expected Data Structure

The frontend sends data in this format:

```javascript
{
  alignment: string,  // Clean FASTA or NEXUS format (embedded trees removed)
  tree: string,       // Tagged Newick format with branch set annotations
  job: {
    analysis_type: "contrast-fel",
    gencodeid: number,
    srv: "Yes" | "No",
    permutations: "Yes" | "No",
    pvalue: number,
    qvalue: number,
    "branch-set": string[],  // Array of branch set names
    output: string
  }
}
```

## Example Payload

```javascript
{
  alignment: ">Human\nGCCTTGGAAACCTGGGGTGCC...\n>Chimp\nGCCTTGGAAACCTGGGGTGCC...",
  tree: "(((Human:0,Chimp:0):0.02166{Set_1}:0.189,((Cow:0.088,Horse:0.177):0.045,(Mouse:0.121,Rat:0.035){Set_2}:0.124):0.017):0;",
  job: {
    analysis_type: "contrast-fel",
    gencodeid: 0,
    srv: "Yes",
    permutations: "Yes",
    pvalue: 0.05,
    qvalue: 0.2,
    "branch-set": ["Set_1", "Set_2"],
    output: ""
  }
}
```

## Key Implementation Details

### 1. Branch Set Parameter Format

**IMPORTANT**: The `branch-set` parameter must be sent as an **array**, not as separate `branch-set1` and `branch-set2` parameters.

```javascript
// ✅ CORRECT
{
  "branch-set": ["Set_1", "Set_2"]
}

// ❌ INCORRECT
{
  "branch-set1": "Set_1",
  "branch-set2": "Set_2"
}
```

### 2. HyPhy Command Generation

The backend should convert the `branch-set` array into repeatable `--branch-set` command-line parameters:

```bash
hyphy contrast-fel \
  --alignment /path/to/alignment \
  --tree /path/to/tree \
  --branch-set Set_1 \
  --branch-set Set_2 \
  --srv Yes \
  --permutations Yes \
  --pvalue 0.05 \
  --qvalue 0.2
```

**Key points:**
- Each branch set name becomes a separate `--branch-set` parameter
- Tag names are passed as the parameter values
- Do NOT use `--branches FG` for Contrast-FEL (this is for other methods)

### 3. Tagged Newick Tree Format

The tree string contains branch annotations using curly braces:

```
(((Human:0,Chimp:0):0.02166{Set_1}:0.189,((Cow:0.088){Set_2}:0.124):0.017):0;
```

- Tags are placed after branch lengths: `)branch_length{TagName}:parent_length`
- Common tag names: `Set_1`, `Set_2`, `Foreground`, `Background`
- Tag names **should not contain spaces** (use underscores: `Set_1` not `Set 1`)

### 4. Alignment Data Cleaning

The frontend strips embedded trees from alignment files before sending:

**NEXUS format**: Removes `BEGIN TREES;...END;` blocks
**FASTA format**: Removes appended Newick trees at end of file

Example of stripped data:
```
>Human
GCCTTGGAAACCTGGGGTGCC
>Chimp
GCCTTGGAAACCTGGGGTGCC
```

Any embedded tree in the alignment file has been removed. The separate `tree` parameter contains the correct tagged tree.

## Frontend Implementation Reference

### BackendAnalysisRunner.js

Parameter preparation (lines 378-397):

```javascript
case 'contrast-fel':
    const branchSets = [];
    if (config.branchSet1 || config['branch-set1']) {
        branchSets.push(config.branchSet1 || config['branch-set1'] || 'Set_1');
    }
    if (config.branchSet2 || config['branch-set2']) {
        branchSets.push(config.branchSet2 || config['branch-set2'] || 'Set_2');
    }

    return {
        ...baseParams,
        srv: config.srv === 'Yes' ? 'Yes' : 'No',
        permutations: config.permutations === 'Yes' ? 'Yes' : 'No',
        pvalue: config.pvalue || config.pValueThreshold || 0.05,
        qvalue: config.qvalue || config.qValueThreshold || 0.20,
        'branch-set': branchSets.length > 0 ? branchSets : ['Set_1', 'Set_2'],
        output: config.output || ''
    };
```

Socket emission (lines 223-245):

```javascript
const methodNameMap = {
    'contrast-fel': 'cfel'
};
const backendMethodName = methodNameMap[method.toLowerCase()] || method.toLowerCase();
const eventName = `${backendMethodName}:spawn`;

const cleanedFastaData = stripEmbeddedTrees(fastaData);

const submitData = {
    alignment: cleanedFastaData,
    tree: treeData,
    job: analysisParams
};

this.socket.emit(eventName, submitData);
```

## Differences from Other Methods

### vs. aBSREL/BUSTED
- Contrast-FEL uses multiple branch sets (array of tags)
- aBSREL/BUSTED use single branch set with "FG" tag
- Parameter name: `branch-set` (array) vs `branches: "All"` (string)

### vs. FEL/SLAC/MEME
- These methods don't use branch selection
- Parameter: `branches: "All"` (analyze all branches)

## Testing

The frontend includes tests in `src/test/contrast-fel-wasm.test.js` that validate:
- Command argument format
- Branch set name validation (no spaces)
- Tree tag format matching branch set names

Working Datamonkey 2 command example:
```bash
mpirun -np 16 HYPHYMPI contrast-fel \
  --alignment /path/to/alignment \
  --tree /path/to/tree \
  --branch-set Foreground \
  --branch-set background \
  --srv Yes \
  --permutations Yes \
  --output /path/to/output.json
```

## Validation Checklist

Backend should verify:
- [ ] `cfel:spawn` event handler is registered
- [ ] `branch-set` parameter is received as an array
- [ ] Array values match tags in the tree string (e.g., `{Set_1}`, `{Set_2}`)
- [ ] Command generation uses repeatable `--branch-set` parameters
- [ ] Tree file is written with branch annotations intact
- [ ] Alignment file does not contain embedded trees (frontend strips them)

## Visualization

Contrast-FEL results use the **FEL visualization component** from hyphy-scope for displaying results.

The visualization mapping is configured in:
- `src/lib/AnalysisResultViewer.svelte` (line 130): Maps `'contrast-fel'` to `HyphyScopeFel`
- `src/lib/utils/hyphyEyeIntegration.js` (line 154): Adds `'contrastfel'` to supported methods for hyphy-eye integration

This means Contrast-FEL results will be displayed using the same visualization as FEL, which shows:
- Site-by-site selection pressure comparison between branch sets
- Interactive plots and tables
- Statistical significance indicators

## Contact

For questions or issues with this integration, please contact the frontend development team.

---

**Document Version**: 1.1
**Last Updated**: January 2025
**Related Files**:
- `src/lib/services/BackendAnalysisRunner.js` (lines 387-406)
- `src/lib/services/WasmAnalysisRunner.js` (lines 270-282)
- `src/lib/AnalyzeTab.svelte` (lines 60-119, 154-156)
- `src/lib/AnalysisResultViewer.svelte` (line 130)
- `src/lib/utils/hyphyEyeIntegration.js` (line 154)
- `src/test/contrast-fel-wasm.test.js`
