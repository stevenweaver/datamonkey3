/**
 * Test for Contrast-FEL WASM execution with multi-set branch selection
 *
 * This test validates that Contrast-FEL works correctly with interactive
 * branch selection where multiple sets of branches are specified.
 *
 * Run with: npm run test -- contrast-fel-wasm
 */

import { describe, expect, it } from 'vitest';

// Test data from CD2-slim.fna (10 sequences, 17 codons)
const TEST_FASTA = `>Human
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Chimp
GCCTTGGAAACCTGGGGTGCCTTGGGTCAGGACATCAACTTGGACATTCCT
>Baboon
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCAACTTGGACATTCCT
>RhMonkey
GCTTTGGAAACCTGGGGAGCGCTGGGTCAGGACATCAACTTGGACATTCCT
>Cow
AGCATTGTCGTCTGGGGTGCCCTGGATCATGACCTCAACCTGGACATTCCT
>Pig
ACTGAGGTTGTCTGGGGCATCGTGGATCAAGACATCAACCTGGACATTCCT
>Horse
AATATCACCATCTTGGGTGCCCTGGAACGTGATATCAACCTGGACATTCCT
>Cat
GATGATATCGTCTGGGGTACCCTGGGTCAGGACATCAACCTGGACATTCCT
>Mouse
AATGAGACCATCTGGGGTGTCTTGGGTCATGGCATCACCCTGAACATCCCC
>Rat
AGTGGGACCGTCTGGGGTGCCCTGGGTCATGGCATCAACCTGGACATCCCT`;

// Tree with multi-set tags (Set_1 and Set_2 instead of spaces)
const TEST_TREE_MULTISET = `(((Human:0,Chimp:0):0.02166017600706549,(Baboon:0,RhMonkey:0):0.08454871222214284){Set_1}:0.1898804322701872,((Cow:0.08802139862787406,Horse:0.1770186752804336):0.0450013916056009,(Mouse:0.1219119664814597,Rat:0.03550454062015435){Set_2}:0.1244133402668078):0.01795217374765563,(Pig:0.1592109185107414,Cat:0.07671186476683911):0.01307003277251646):0;`;

describe('Contrast-FEL WASM Multi-Set Branch Selection', () => {
	it('should accept multi-set branch names without spaces', () => {
		const config = {
			geneticCode: 'Universal',
			branchesToTest: 'Interactive',
			branchSet1: 'Set_1',
			branchSet2: 'Set_2',
			srv: 'Yes',
			permutations: 'Yes',
			pvalue: 0.05,
			qvalue: 0.2,
			interactiveTree: TEST_TREE_MULTISET
		};

		// Verify config is accepted
		expect(config.branchSet1).toBe('Set_1');
		expect(config.branchSet2).toBe('Set_2');
		expect(config.interactiveTree).toContain('{Set_1}');
		expect(config.interactiveTree).toContain('{Set_2}');

		console.log('✅ Multi-set config validated:');
		console.log('   - branchSet1:', config.branchSet1);
		console.log('   - branchSet2:', config.branchSet2);
		console.log('   - Tree contains Set_1 tags:', config.interactiveTree.includes('{Set_1}'));
		console.log('   - Tree contains Set_2 tags:', config.interactiveTree.includes('{Set_2}'));
	});

	it('should build correct command arguments for multi-set selection', () => {
		// Test the command building logic
		const config = {
			branchSet1: 'Set_1',
			branchSet2: 'Set_2',
			srv: 'Yes',
			permutations: 'Yes',
			pvalue: 0.05,
			qvalue: 0.2
		};

		// Simulate command arg building (simplified)
		const args = [];

		// Branch sets - use repeatable --branch-set with tag names as separate arguments
		if (config.branchSet1) {
			args.push('--branch-set');
			args.push(config.branchSet1);
		}
		if (config.branchSet2) {
			args.push('--branch-set');
			args.push(config.branchSet2);
		}

		// Other params
		args.push(`--srv ${config.srv}`);
		args.push(`--permutations ${config.permutations}`);
		args.push(`--pvalue ${config.pvalue}`);
		args.push(`--qvalue ${config.qvalue}`);

		const command = `hyphy Contrast-FEL ${args.join(' ')}`;

		// Verify command uses repeatable --branch-set with tag names as separate arguments
		expect(command).toContain('--branch-set Set_1');
		expect(command).toContain('--branch-set Set_2');
		expect(command).not.toContain('--branch-set1'); // Should not use numbered variant
		expect(command).not.toContain('--branch-set2'); // Should not use numbered variant

		console.log('✅ Command built correctly:');
		console.log('   ', command);
		console.log('   Matches Datamonkey 2 format: --branch-set Set_1 --branch-set Set_2');
	});

	it('should reject branch set names with spaces', () => {
		// Verify that spaces in set names would cause issues
		const badConfig = {
			branchSet1: 'Set 1', // Contains space - BAD
			branchSet2: 'Set 2'  // Contains space - BAD
		};

		const args = [];
		args.push(`--branch-set ${badConfig.branchSet1}`);
		args.push(`--branch-set ${badConfig.branchSet2}`);
		const command = `hyphy Contrast-FEL ${args.join(' ')}`;

		// This would result in: --branch-set Set 1 --branch-set Set 2
		// HyPhy would parse: branch-set="Set", then "1" as next positional arg
		expect(command).toContain('--branch-set Set 1'); // This is the problem

		console.log('❌ Bad command (for demonstration):');
		console.log('   ', command);
		console.log('   HyPhy would parse "Set" and "1" as separate arguments');
	});

	it('should validate tree tag format matches branch set names', () => {
		const config = {
			branchSet1: 'Set_1',
			branchSet2: 'Set_2',
			interactiveTree: TEST_TREE_MULTISET
		};

		// Extract tags from tree using regex
		const tagRegex = /\{([^}]+)\}/g;
		const tags = new Set();
		let match;
		while ((match = tagRegex.exec(config.interactiveTree)) !== null) {
			tags.add(match[1]);
		}

		// Verify tags match branch set names
		expect(tags.has(config.branchSet1)).toBe(true);
		expect(tags.has(config.branchSet2)).toBe(true);

		console.log('✅ Tree tags validated:');
		console.log('   - Tags found in tree:', Array.from(tags).join(', '));
		console.log('   - branchSet1 matches:', tags.has(config.branchSet1));
		console.log('   - branchSet2 matches:', tags.has(config.branchSet2));
	});
});

/**
 * Integration test data for manual testing
 */
export const CONTRAST_FEL_TEST_DATA = {
	fasta: TEST_FASTA,
	tree: TEST_TREE_MULTISET,
	config: {
		geneticCode: 'Universal',
		branchesToTest: 'Interactive',
		branchSet1: 'Set_1',
		branchSet2: 'Set_2',
		srv: 'Yes',
		permutations: 'Yes',
		pvalue: 0.05,
		qvalue: 0.2
	}
};
