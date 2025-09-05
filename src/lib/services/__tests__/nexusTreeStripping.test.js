/**
 * Tests for NEXUS tree stripping functionality
 * Addresses issue where embedded trees in NEXUS files override separate tree files
 */

import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Strip embedded trees from NEXUS alignment data
 * NEXUS files can contain TREES blocks that take precedence over separate tree files
 */
function stripTreesFromNexus(nexusData) {
	// Check if this looks like NEXUS format
	if (!nexusData.toLowerCase().includes('#nexus')) {
		return nexusData;
	}

	// Look for TREES block (case insensitive)
	const treesBlockRegex = /begin\s+trees\s*;.*?end\s*;/gis;
	const hasTreesBlock = treesBlockRegex.test(nexusData);

	if (hasTreesBlock) {
		const cleanedNexus = nexusData.replace(treesBlockRegex, '');
		return cleanedNexus;
	} else {
		return nexusData;
	}
}

describe('NEXUS Tree Stripping', () => {
	let simpleNexus;
	let nexusWithEmbeddedTree;
	let nexusWithMultipleTrees;
	let nexusWithComplexTrees;
	let nonNexusData;

	beforeEach(() => {
		simpleNexus = `#NEXUS

BEGIN DATA;
	DIMENSIONS NTAX=4 NCHAR=9;
	FORMAT DATATYPE=DNA GAP=- MISSING=?;
	MATRIX
		A ATGATGATG
		B ATGATGATG
		C ATGATGATG
		D ATGATGATG
	;
END;`;

		nexusWithEmbeddedTree = `#NEXUS

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
END;`;

		nexusWithMultipleTrees = `#NEXUS

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
	TREE tree2 = ((A{FG}:0.1,B:0.1):0.1,(C{FG}:0.1,D:0.1):0.1);
END;

BEGIN ASSUMPTIONS;
	OPTIONS DEFTYPE=unord PolyTcount=MINSTEPS;
END;`;

		nexusWithComplexTrees = `#NEXUS

BEGIN DATA;
	DIMENSIONS NTAX=6 NCHAR=12;
	FORMAT DATATYPE=DNA GAP=- MISSING=?;
	MATRIX
		Human    ATGATGATGATG
		Chimp    ATGATGATGATG
		Gorilla  ATGATGATGATG
		Mouse    ATGATGATGATG
		Rat      ATGATGATGATG
		Dog      ATGATGATGATG
	;
END;

BEGIN TREES;
	[This is a comment about trees]
	TREE primates = (((Human:0.1,Chimp:0.1)Apes:0.2,Gorilla:0.3)Primates:0.1,((Mouse:0.4,Rat:0.4)Rodents:0.3,Dog:0.7)Mammals:0.2);
	TREE labeled_primates = (((Human{FG}:0.1,Chimp{FG}:0.1)Apes:0.2,Gorilla:0.3)Primates:0.1,((Mouse:0.4,Rat:0.4)Rodents:0.3,Dog:0.7)Mammals:0.2);
END;`;

		nonNexusData = `>Human
ATGATGATGATG
>Chimp
ATGATGATGATG
>Mouse
ATGATGATGATG
>Dog
ATGATGATGATG`;
	});

	describe('Detection and Stripping', () => {
		it('should detect NEXUS format correctly', () => {
			expect(stripTreesFromNexus(simpleNexus)).toBe(simpleNexus);
			expect(stripTreesFromNexus(nexusWithEmbeddedTree)).not.toContain('BEGIN TREES');
		});

		it('should leave non-NEXUS data unchanged', () => {
			const result = stripTreesFromNexus(nonNexusData);
			expect(result).toBe(nonNexusData);
		});

		it('should leave NEXUS without trees unchanged', () => {
			const result = stripTreesFromNexus(simpleNexus);
			expect(result).toBe(simpleNexus);
			expect(result).toContain('BEGIN DATA');
			expect(result).toContain('END;');
		});

		it('should remove single TREES block', () => {
			const result = stripTreesFromNexus(nexusWithEmbeddedTree);

			// Should preserve data block
			expect(result).toContain('BEGIN DATA');
			expect(result).toContain('MATRIX');
			expect(result).toContain('A ATGATGATG');

			// Should remove trees block
			expect(result).not.toContain('BEGIN TREES');
			expect(result).not.toContain('TREE tree1');
			expect(result).not.toContain('((A:0.1,B:0.1):0.1,(C:0.1,D:0.1):0.1)');
		});

		it('should remove TREES block with multiple trees', () => {
			const result = stripTreesFromNexus(nexusWithMultipleTrees);

			// Should preserve data and other blocks
			expect(result).toContain('BEGIN DATA');
			expect(result).toContain('BEGIN ASSUMPTIONS');

			// Should remove entire trees block including all trees
			expect(result).not.toContain('BEGIN TREES');
			expect(result).not.toContain('TREE tree1');
			expect(result).not.toContain('TREE tree2');
			expect(result).not.toContain('{FG}');
		});

		it('should handle complex trees with comments and labels', () => {
			const result = stripTreesFromNexus(nexusWithComplexTrees);

			// Should preserve data
			expect(result).toContain('BEGIN DATA');
			expect(result).toContain('Human    ATGATGATGATG');

			// Should remove trees and comments
			expect(result).not.toContain('BEGIN TREES');
			expect(result).not.toContain('[This is a comment about trees]');
			expect(result).not.toContain('TREE primates');
			expect(result).not.toContain('TREE labeled_primates');
			expect(result).not.toContain('Human{FG}');
		});
	});

	describe('Case Sensitivity', () => {
		it('should handle case-insensitive NEXUS detection', () => {
			const lowerCaseNexus = nexusWithEmbeddedTree.toLowerCase();
			const result = stripTreesFromNexus(lowerCaseNexus);
			expect(result).not.toContain('begin trees');
		});

		it('should handle mixed case BEGIN TREES blocks', () => {
			const mixedCaseNexus = nexusWithEmbeddedTree
				.replace('BEGIN TREES', 'Begin Trees')
				.replace('END;', 'End;');

			const result = stripTreesFromNexus(mixedCaseNexus);
			expect(result).not.toContain('Begin Trees');
			expect(result).not.toContain('TREE tree1');
		});
	});

	describe('Whitespace and Formatting', () => {
		it('should handle various whitespace in TREES block', () => {
			const spacedNexus = `#NEXUS

BEGIN DATA;
	DIMENSIONS NTAX=2 NCHAR=3;
	MATRIX
		A ATG
		B ATG
	;
END;

BEGIN    TREES   ;
	TREE tree1 = (A:0.1,B:0.1);
END   ;`;

			const result = stripTreesFromNexus(spacedNexus);
			expect(result).not.toContain('BEGIN    TREES');
			expect(result).toContain('BEGIN DATA');
		});

		it('should preserve formatting of remaining blocks', () => {
			const result = stripTreesFromNexus(nexusWithEmbeddedTree);

			// Check that indentation and structure is preserved
			expect(result).toContain('\tDIMENSIONS NTAX=4');
			expect(result).toContain('\t\tA ATGATGATG');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty TREES block', () => {
			const emptyTreesNexus = `#NEXUS

BEGIN DATA;
	DIMENSIONS NTAX=2 NCHAR=3;
	MATRIX
		A ATG
		B ATG
	;
END;

BEGIN TREES;
END;`;

			const result = stripTreesFromNexus(emptyTreesNexus);
			expect(result).not.toContain('BEGIN TREES');
			expect(result).toContain('BEGIN DATA');
		});

		it('should handle TREES block with only comments', () => {
			const commentOnlyTrees = `#NEXUS

BEGIN DATA;
	MATRIX A ATG;
END;

BEGIN TREES;
	[Just a comment, no actual trees]
END;`;

			const result = stripTreesFromNexus(commentOnlyTrees);
			expect(result).not.toContain('BEGIN TREES');
			expect(result).not.toContain('[Just a comment');
		});

		it('should handle multiple TREES blocks (edge case)', () => {
			const multipleTrees = `#NEXUS

BEGIN DATA;
	MATRIX A ATG;
END;

BEGIN TREES;
	TREE tree1 = (A:0.1);
END;

BEGIN ASSUMPTIONS;
	OPTIONS DEFTYPE=unord;
END;

BEGIN TREES;
	TREE tree2 = (A:0.2);
END;`;

			const result = stripTreesFromNexus(multipleTrees);
			expect(result).not.toContain('BEGIN TREES');
			expect(result).not.toContain('TREE tree1');
			expect(result).not.toContain('TREE tree2');
			expect(result).toContain('BEGIN ASSUMPTIONS');
		});
	});

	describe('Integration Scenarios', () => {
		it('should work with real-world NEXUS file structure', () => {
			const realWorldNexus = `#NEXUS
[TITLE: Primate sequences]

BEGIN DATA;
	DIMENSIONS NTAX=4 NCHAR=60;
	FORMAT DATATYPE=DNA MISSING=? GAP=- INTERLEAVE=YES;
	MATRIX
		Human     ATGCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG
		Chimp     ATGCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG  
		Gorilla   ATGCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG
		Mouse     ATGCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG ATCGATCGATCGATCGATCG
	;
END;

BEGIN ASSUMPTIONS;
	DEFTYPE = unord;
	POLYTCOUNT = MINSTEPS;
END;

BEGIN TREES;
	[Neighbor-joining tree from PAUP]
	TRANSLATE
		1 Human,
		2 Chimp,
		3 Gorilla,
		4 Mouse;
	TREE nj_tree = [&R] ((1:0.1,2:0.1):0.05,(3:0.15,4:0.2):0.1);
END;`;

			const result = stripTreesFromNexus(realWorldNexus);

			// Should preserve title, data, and assumptions
			expect(result).toContain('[TITLE: Primate sequences]');
			expect(result).toContain('BEGIN DATA');
			expect(result).toContain('BEGIN ASSUMPTIONS');
			expect(result).toContain('INTERLEAVE=YES');

			// Should remove trees and translate table
			expect(result).not.toContain('BEGIN TREES');
			expect(result).not.toContain('TRANSLATE');
			expect(result).not.toContain('TREE nj_tree');
			expect(result).not.toContain('[&R]');
		});
	});
});

describe('HyPhy Integration Workflow', () => {
	it('should prepare clean alignment for external tree usage', () => {
		const nexusWithTree = `#NEXUS
BEGIN DATA;
	MATRIX
		A ATGATG
		B ATGATG
	;
END;
BEGIN TREES;
	TREE embedded = (A:0.1,B:0.1);
END;`;

		const separateTaggedTree = '((A{FG}:0.1,B:0.1):0.1);';

		// Clean the NEXUS file
		const cleanedAlignment = stripTreesFromNexus(nexusWithTree);

		// Verify workflow
		expect(cleanedAlignment).toContain('BEGIN DATA');
		expect(cleanedAlignment).not.toContain('BEGIN TREES');
		expect(cleanedAlignment).not.toContain('embedded');

		// Now the separate tagged tree can be used without conflict
		expect(separateTaggedTree).toContain('{FG}');
	});
});
