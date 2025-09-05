# Issue: NEXUS files with embedded trees override separate tree files

## Summary

When running HyPhy analyses (e.g., FEL) with both a NEXUS alignment file containing an embedded tree and a separate tree file specified via `--tree`, HyPhy uses the embedded tree from the NEXUS file instead of the specified tree file.

## Expected Behavior

When both an embedded tree (in NEXUS TREES block) and a separate tree file are provided, either:

1. The `--tree` parameter should take precedence (explicit override), OR
2. HyPhy should warn about conflicting tree sources and require clarification

## Current Behavior

HyPhy silently uses the embedded tree from the NEXUS file, ignoring the `--tree` parameter entirely.

## Impact

This creates issues when:

- Users want to override embedded trees with custom trees
- Programmatic workflows need to apply branch labels/tags to trees (e.g., `{FG}` tags for foreground branches)
- Users are unaware their NEXUS file contains embedded trees

## Reproduction

1. Create a NEXUS file with embedded tree:

```nexus
#NEXUS

BEGIN DATA;
    DIMENSIONS NTAX=4 NCHAR=9;
    FORMAT DATATYPE=DNA GAP=- MISSING=?;
    MATRIX
        A ATGATGATG
        B ATGATGATG
        C ATGATGATG
        D ATGATGATG
    ;
END;

BEGIN TREES;
    TREE tree1 = ((A:0.1,B:0.1):0.1,(C:0.1,D:0.1):0.1);
END;
```

2. Create a separate tree file with branch labels:

```
((A{FG}:0.1,B:0.1):0.1,(C{FG}:0.1,D:0.1):0.1);
```

3. Run FEL with both files:

```bash
hyphy fel --alignment data.nex --tree labeled.tree --branches FG
```

4. **Result**: HyPhy uses the unlabeled embedded tree, not the labeled tree file

## Workaround

Currently, users must manually strip TREES blocks from NEXUS files before analysis.

## Environment

- HyPhy version: 2.5.63
- Platform: Web (via Aioli/WebAssembly), but likely affects all platforms

## Suggested Solutions

1. **Command-line flag**: Add `--ignore-embedded-trees` to force using `--tree` parameter
2. **Precedence order**: Make `--tree` parameter override embedded trees by default
3. **Warning**: Display warning when both sources are present
4. **Documentation**: Clarify tree precedence rules in documentation

This issue affects programmatic usage where tree labeling/tagging is essential for branch-specific analyses.
