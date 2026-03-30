/**
 * Tests for validateCodonAlignment() utility
 * Verifies that codon alignment validation catches:
 * - Sequences not divisible by 3
 * - In-frame stop codons for various genetic codes
 * - Edge cases (empty input, single codons, etc.)
 */

import { describe, it, expect } from 'vitest';
import { validateCodonAlignment } from '../lib/utils/fastaValidation.js';

// Helper to build a simple FASTA string
function fasta(seqs) {
	return seqs.map(([name, seq]) => `>${name}\n${seq}`).join('\n');
}

describe('validateCodonAlignment', () => {
	describe('valid alignments', () => {
		it('accepts a valid codon alignment (divisible by 3, no stop codons)', () => {
			const data = fasta([
				['Seq1', 'ATGAAACCC'],
				['Seq2', 'ATGAAAGGG']
			]);
			const result = validateCodonAlignment(data);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('accepts a single codon sequence (length 3)', () => {
			const data = fasta([['Seq1', 'ATG']]);
			const result = validateCodonAlignment(data);
			expect(result.valid).toBe(true);
		});

		it('allows a terminal stop codon (last codon)', () => {
			// TAA at the end should not be flagged since it is the terminal codon
			const data = fasta([['Seq1', 'ATGAAATAA']]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(true);
		});
	});

	describe('not divisible by 3', () => {
		it('rejects alignment whose length is not divisible by 3', () => {
			const data = fasta([
				['Seq1', 'ATGAA'],
				['Seq2', 'ATGCC']
			]);
			const result = validateCodonAlignment(data);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
			expect(result.errors[0]).toContain('not divisible by 3');
		});

		it('rejects single nucleotide', () => {
			const data = fasta([['Seq1', 'A']]);
			const result = validateCodonAlignment(data);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('not divisible by 3');
		});
	});

	describe('in-frame stop codons (Universal code)', () => {
		it('detects TAA stop codon in-frame', () => {
			// TAA at codon position 2 (in-frame, not terminal)
			const data = fasta([['Seq1', 'ATGTAACCC']]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('TAA');
			expect(result.errors[0]).toContain('codon position 2');
		});

		it('detects TAG stop codon in-frame', () => {
			const data = fasta([['Seq1', 'ATGTAGCCC']]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('TAG');
		});

		it('detects TGA stop codon in-frame', () => {
			const data = fasta([['Seq1', 'ATGTGACCC']]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('TGA');
		});

		it('does not flag stop codons that are out of frame', () => {
			// "AATAAGGCC" - TAA starts at position 1 (out of frame)
			// Codons: AAT AAG GCC - none are stop codons
			const data = fasta([['Seq1', 'AATAAGCCC']]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(true);
		});
	});

	describe('multiple sequences', () => {
		it('detects stop codon in second sequence only', () => {
			const data = fasta([
				['Clean', 'ATGAAACCC'],
				['Dirty', 'ATGTAACCC']
			]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('Dirty');
		});

		it('reports stop codons in multiple sequences', () => {
			const data = fasta([
				['Seq1', 'ATGTAACCC'],
				['Seq2', 'ATGTAGCCC']
			]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(false);
			expect(result.errors).toHaveLength(2);
		});
	});

	describe('genetic code variants', () => {
		it('Ciliate nuclear (5): TAA is NOT a stop codon', () => {
			// In ciliate nuclear code, only TGA is a stop codon
			const data = fasta([['Seq1', 'ATGTAACCC']]);
			const result = validateCodonAlignment(data, 5);
			// TAA codes for Gln in ciliate nuclear, should be valid
			expect(result.valid).toBe(true);
		});

		it('Ciliate nuclear (5): TGA IS a stop codon', () => {
			const data = fasta([['Seq1', 'ATGTGACCC']]);
			const result = validateCodonAlignment(data, 5);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('TGA');
		});

		it('Vertebrate mito (1): AGA is a stop codon', () => {
			const data = fasta([['Seq1', 'ATGAGACCC']]);
			const result = validateCodonAlignment(data, 1);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('AGA');
		});

		it('Vertebrate mito (1): TGA is NOT a stop codon', () => {
			// In vertebrate mitochondrial code, TGA codes for Trp
			const data = fasta([['Seq1', 'ATGTGACCC']]);
			const result = validateCodonAlignment(data, 1);
			expect(result.valid).toBe(true);
		});

		it('unknown genetic code falls back to Universal', () => {
			const data = fasta([['Seq1', 'ATGTAACCC']]);
			const result = validateCodonAlignment(data, 999);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('TAA');
		});
	});

	describe('edge cases', () => {
		it('returns invalid for null input', () => {
			const result = validateCodonAlignment(null);
			expect(result.valid).toBe(false);
			expect(result.errors).toHaveLength(1);
		});

		it('returns invalid for empty string', () => {
			const result = validateCodonAlignment('');
			expect(result.valid).toBe(false);
		});

		it('returns invalid for whitespace-only input', () => {
			const result = validateCodonAlignment('   \n  ');
			expect(result.valid).toBe(false);
		});

		it('handles lowercase sequences', () => {
			const data = fasta([['Seq1', 'atgtaaccc']]);
			const result = validateCodonAlignment(data, 0);
			expect(result.valid).toBe(false);
			expect(result.errors[0]).toContain('TAA');
		});

		it('ignores gap characters when checking length', () => {
			// 9 nucleotides + 3 gaps = 12 chars, but clean length is 9 (divisible by 3)
			const data = fasta([['Seq1', 'ATG---AAACCC']]);
			const result = validateCodonAlignment(data);
			expect(result.valid).toBe(true);
		});

		it('defaults to genetic code 0 when not specified', () => {
			const data = fasta([['Seq1', 'ATGTAACCC']]);
			const result = validateCodonAlignment(data);
			expect(result.valid).toBe(false);
		});
	});
});
