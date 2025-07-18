/**
 * FASTA Validation Utilities
 *
 * This module provides functions for validating FASTA format files
 * and identifying common issues in sequence data.
 */

// Valid nucleotide characters (including ambiguity codes)
const VALID_NUCLEOTIDES = new Set('ACGTUNRYSWKMBDHVacgtunryswkmbdhv-.');

// Valid amino acid characters
const VALID_AMINO_ACIDS = new Set('ACDEFGHIKLMNPQRSTVWYacdefghiklmnpqrstvwy-.*X');

// Common error types with specific codes and messages
export const ERROR_TYPES = {
	EMPTY_FILE: {
		code: 'FASTA-001',
		message: 'File is empty'
	},
	NO_HEADER: {
		code: 'FASTA-002',
		message: 'FASTA header line (starting with >) not found'
	},
	INVALID_HEADER: {
		code: 'FASTA-003',
		message: 'Invalid FASTA header format'
	},
	EMPTY_SEQUENCE: {
		code: 'FASTA-004',
		message: 'Sequence is empty'
	},
	INCONSISTENT_LENGTH: {
		code: 'FASTA-005',
		message: 'Inconsistent sequence lengths in alignment'
	},
	INVALID_CHARACTERS: {
		code: 'FASTA-006',
		message: 'Invalid characters in sequence'
	},
	DUPLICATE_HEADERS: {
		code: 'FASTA-007',
		message: 'Duplicate sequence headers'
	},
	STOP_CODONS: {
		code: 'FASTA-008',
		message: 'Stop codons found in coding sequence'
	},
	MIXED_CASE: {
		code: 'FASTA-009',
		message: 'Mixed case used in sequences (could indicate issues)'
	},
	WHITESPACE_IN_SEQUENCE: {
		code: 'FASTA-010',
		message: 'Whitespace found in sequence'
	},
	HEADER_WITHOUT_SEQUENCE: {
		code: 'FASTA-011',
		message: 'Header without corresponding sequence'
	}
};

/**
 * Parse a FASTA format string into sequence objects
 *
 * @param {string} fastaContent - The raw FASTA content
 * @returns {Object} Object with sequences and potential warnings
 */
export function parseFasta(fastaContent) {
	if (!fastaContent || !fastaContent.trim()) {
		throw new ValidationError(ERROR_TYPES.EMPTY_FILE.code, ERROR_TYPES.EMPTY_FILE.message);
	}

	const lines = fastaContent.split(/\\r?\\n/);
	const sequences = [];
	let currentSequence = null;
	const headers = new Set();
	const warnings = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		if (line.startsWith('>')) {
			// Save previous sequence if exists
			if (currentSequence && currentSequence.sequence.length === 0) {
				warnings.push({
					type: ERROR_TYPES.EMPTY_SEQUENCE,
					details: `Empty sequence for header: ${currentSequence.header}`,
					line: i
				});
			}

			// Process header
			const header = line.substring(1).trim();
			if (!header) {
				warnings.push({
					type: ERROR_TYPES.INVALID_HEADER,
					details: 'Empty header found',
					line: i + 1
				});
			}

			// Check for duplicate headers
			if (headers.has(header)) {
				warnings.push({
					type: ERROR_TYPES.DUPLICATE_HEADERS,
					details: `Duplicate header found: ${header}`,
					line: i + 1
				});
			}
			headers.add(header);

			currentSequence = {
				header: header,
				description: header,
				sequence: '',
				lineStart: i + 1
			};
			sequences.push(currentSequence);
		} else if (currentSequence) {
			// Check for whitespace in sequence
			if (/\\s/.test(line)) {
				warnings.push({
					type: ERROR_TYPES.WHITESPACE_IN_SEQUENCE,
					details: `Whitespace found in sequence line`,
					line: i + 1
				});
			}

			// Add to current sequence
			currentSequence.sequence += line.replace(/\\s/g, '');
		} else {
			// Sequence data before any header
			warnings.push({
				type: ERROR_TYPES.NO_HEADER,
				details: 'Sequence data found before any header',
				line: i + 1
			});
		}
	}

	// Handle case where file has no headers
	if (sequences.length === 0) {
		throw new ValidationError(ERROR_TYPES.NO_HEADER.code, ERROR_TYPES.NO_HEADER.message);
	}

	// Check for empty final sequence
	if (currentSequence && currentSequence.sequence.length === 0) {
		warnings.push({
			type: ERROR_TYPES.EMPTY_SEQUENCE,
			details: `Empty sequence for header: ${currentSequence.header}`,
			line: currentSequence.lineStart
		});
	}

	return {
		sequences,
		warnings
	};
}

/**
 * Validate parsed FASTA sequences
 *
 * @param {Array} sequences - Array of sequence objects from parseFasta
 * @param {Object} options - Validation options
 * @returns {Object} Validation results with errors and warnings
 */
export function validateSequences(sequences, options = {}) {
	const {
		checkConsistentLength = true,
		sequenceType = 'auto', // 'nucleotide', 'amino', or 'auto'
		checkStopCodons = true,
		checkCase = true
	} = options;

	const results = {
		valid: true,
		errors: [],
		warnings: [],
		stats: {
			sequenceCount: sequences.length,
			minLength: Infinity,
			maxLength: 0,
			totalLength: 0,
			detectedType: null
		}
	};

	// Determine sequence type if auto
	let type = sequenceType;
	if (type === 'auto' && sequences.length > 0) {
		// Sample first sequence
		const sample = sequences[0].sequence;
		// Check if it's predominantly nucleotides
		const nucleotideCount = [...sample].filter((char) => 'ACGTUacgtu'.includes(char)).length;
		type = nucleotideCount / sample.length > 0.9 ? 'nucleotide' : 'amino';
	}
	results.stats.detectedType = type;

	// Set of valid characters based on determined type
	const validChars = type === 'nucleotide' ? VALID_NUCLEOTIDES : VALID_AMINO_ACIDS;

	// Check each sequence
	for (let i = 0; i < sequences.length; i++) {
		const seq = sequences[i];
		const seqLength = seq.sequence.length;

		// Update stats
		results.stats.minLength = Math.min(results.stats.minLength, seqLength);
		results.stats.maxLength = Math.max(results.stats.maxLength, seqLength);
		results.stats.totalLength += seqLength;

		// Check for invalid characters
		const invalidChars = new Set();
		for (const char of seq.sequence) {
			if (!validChars.has(char)) {
				invalidChars.add(char);
			}
		}

		if (invalidChars.size > 0) {
			results.errors.push({
				type: ERROR_TYPES.INVALID_CHARACTERS,
				details: `Invalid characters found in sequence ${i + 1} (${seq.header}): ${[...invalidChars].join(', ')}`,
				sequence: i,
				chars: [...invalidChars]
			});
			results.valid = false;
		}

		// Check for mixed case
		if (checkCase) {
			const hasUpperCase = /[A-Z]/.test(seq.sequence);
			const hasLowerCase = /[a-z]/.test(seq.sequence);
			if (hasUpperCase && hasLowerCase) {
				results.warnings.push({
					type: ERROR_TYPES.MIXED_CASE,
					details: `Mixed case found in sequence ${i + 1} (${seq.header})`,
					sequence: i
				});
			}
		}

		// Check for stop codons in coding sequences
		if (checkStopCodons && type === 'nucleotide' && seqLength % 3 === 0) {
			const stopCodons = ['TAA', 'TAG', 'TGA', 'UAA', 'UAG', 'UGA'];
			let stopCodonPositions = [];

			for (let pos = 0; pos < seqLength - 2; pos += 3) {
				const codon = seq.sequence.substring(pos, pos + 3).toUpperCase();
				if (stopCodons.includes(codon)) {
					stopCodonPositions.push(pos);
				}
			}

			if (stopCodonPositions.length > 0) {
				// Ignore stop codons at the very end of the sequence
				if (stopCodonPositions.length === 1 && stopCodonPositions[0] === seqLength - 3) {
					// This is fine - stop codon at end
				} else {
					results.warnings.push({
						type: ERROR_TYPES.STOP_CODONS,
						details: `Stop codons found in sequence ${i + 1} (${seq.header}) at positions: ${stopCodonPositions.join(', ')}`,
						sequence: i,
						positions: stopCodonPositions
					});
				}
			}
		}
	}

	// Check for consistent lengths (alignment)
	if (checkConsistentLength && sequences.length > 1) {
		if (results.stats.minLength !== results.stats.maxLength) {
			results.errors.push({
				type: ERROR_TYPES.INCONSISTENT_LENGTH,
				details: `Sequences have inconsistent lengths (min: ${results.stats.minLength}, max: ${results.stats.maxLength})`,
				minLength: results.stats.minLength,
				maxLength: results.stats.maxLength
			});
			results.valid = false;
		}
	}

	// Add averages
	if (sequences.length > 0) {
		results.stats.averageLength = results.stats.totalLength / sequences.length;
	}

	return results;
}

/**
 * Normalize and repair FASTA sequences
 *
 * @param {Array} sequences - Array of sequence objects
 * @param {Object} options - Repair options
 * @returns {Object} Normalized sequences and repair notes
 */
export function repairFasta(sequences, options = {}) {
	const {
		normalizeCase = true,
		padSequences = true,
		removeInvalidChars = true,
		removeWhitespace = true,
		sequenceType = 'auto' // 'nucleotide', 'amino', or 'auto'
	} = options;

	// Determine sequence type if auto
	let type = sequenceType;
	if (type === 'auto' && sequences.length > 0) {
		// Sample first sequence
		const sample = sequences[0].sequence;
		// Check if it's predominantly nucleotides
		const nucleotideCount = [...sample].filter((char) => 'ACGTUacgtu'.includes(char)).length;
		type = nucleotideCount / sample.length > 0.9 ? 'nucleotide' : 'amino';
	}

	// Set of valid characters based on determined type
	const validChars = type === 'nucleotide' ? VALID_NUCLEOTIDES : VALID_AMINO_ACIDS;

	// Find max sequence length (for padding)
	let maxLength = 0;
	if (padSequences) {
		for (const seq of sequences) {
			maxLength = Math.max(maxLength, seq.sequence.length);
		}
	}

	const repairs = [];
	const repairedSequences = sequences.map((seq, index) => {
		const repaired = {
			...seq,
			sequence: seq.sequence
		};

		// Remove whitespace
		if (removeWhitespace && /\\s/.test(repaired.sequence)) {
			const oldLength = repaired.sequence.length;
			repaired.sequence = repaired.sequence.replace(/\\s/g, '');
			repairs.push({
				type: 'whitespace_removed',
				sequence: index,
				header: seq.header,
				details: `Removed whitespace from sequence ${index + 1}`
			});
		}

		// Normalize case
		if (normalizeCase) {
			const oldSeq = repaired.sequence;
			repaired.sequence = repaired.sequence.toUpperCase();
			if (oldSeq !== repaired.sequence) {
				repairs.push({
					type: 'case_normalized',
					sequence: index,
					header: seq.header,
					details: `Normalized case to uppercase for sequence ${index + 1}`
				});
			}
		}

		// Remove invalid characters
		if (removeInvalidChars) {
			const oldSeq = repaired.sequence;
			repaired.sequence = [...repaired.sequence].filter((char) => validChars.has(char)).join('');

			if (oldSeq !== repaired.sequence) {
				repairs.push({
					type: 'invalid_chars_removed',
					sequence: index,
					header: seq.header,
					details: `Removed invalid characters from sequence ${index + 1}`
				});
			}
		}

		// Pad sequences to same length
		if (padSequences && repaired.sequence.length < maxLength) {
			const oldLength = repaired.sequence.length;
			const paddingChar = type === 'nucleotide' ? '-' : '-';
			repaired.sequence = repaired.sequence.padEnd(maxLength, paddingChar);

			repairs.push({
				type: 'sequence_padded',
				sequence: index,
				header: seq.header,
				details: `Padded sequence ${index + 1} from ${oldLength} to ${maxLength} characters`
			});
		}

		return repaired;
	});

	return {
		sequences: repairedSequences,
		repairs
	};
}

/**
 * Convert sequence objects back to FASTA format
 *
 * @param {Array} sequences - Array of sequence objects
 * @param {Object} options - Export options
 * @returns {string} FASTA format string
 */
export function toFastaFormat(sequences, options = {}) {
	const { lineLength = 60, includeDescription = true } = options;

	let fastaContent = '';

	for (const seq of sequences) {
		// Add header line
		fastaContent += '>' + (includeDescription ? seq.header : seq.header.split(/\\s+/)[0]) + '\n';

		// Add sequence with line wrapping
		let sequence = seq.sequence;
		for (let i = 0; i < sequence.length; i += lineLength) {
			fastaContent += sequence.substring(i, i + lineLength) + '\n';
		}
	}

	return fastaContent;
}

/**
 * Validate a raw FASTA string and return detailed results
 *
 * @param {string} fastaContent - Raw FASTA content to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation results with detailed information
 */
export function validateFasta(fastaContent, options = {}) {
	try {
		// Parse the FASTA content
		const { sequences, warnings: parseWarnings } = parseFasta(fastaContent);

		// Validate the sequences
		const validationResults = validateSequences(sequences, options);

		// Combine warnings from parsing and validation
		validationResults.warnings = [...parseWarnings, ...validationResults.warnings];

		// Add sequence data to the results
		validationResults.sequences = sequences;

		return validationResults;
	} catch (error) {
		if (error instanceof ValidationError) {
			return {
				valid: false,
				errors: [
					{
						type: { code: error.code, message: error.message },
						details: error.message
					}
				],
				warnings: [],
				sequences: [],
				stats: {
					sequenceCount: 0
				}
			};
		}

		// Handle other errors
		return {
			valid: false,
			errors: [
				{
					type: { code: 'FASTA-999', message: 'Unknown error' },
					details: error.message || 'Unknown error occurred during validation'
				}
			],
			warnings: [],
			sequences: [],
			stats: {
				sequenceCount: 0
			}
		};
	}
}

/**
 * Custom error class for validation errors
 */
class ValidationError extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
		this.name = 'ValidationError';
	}
}
