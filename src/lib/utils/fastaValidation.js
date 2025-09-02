/**
 * Simple FASTA Validation Utilities
 * Simplified version focusing on essential validation functionality
 */

// Valid character sets
const VALID_NUCLEOTIDES = new Set('ACGTUNRYSWKMBDHVacgtunryswkmbdhv-.');
const VALID_AMINO_ACIDS = new Set('ACDEFGHIKLMNPQRSTVWYacdefghiklmnpqrstvwy-.*X');

/**
 * Parse FASTA format string into sequences
 * @param {string} fastaContent - Raw FASTA content
 * @returns {Object} Parsed sequences and validation info
 */
export function parseFasta(fastaContent) {
	if (!fastaContent?.trim()) {
		throw new Error('File is empty');
	}

	const lines = fastaContent.split(/\r?\n/);
	const sequences = [];
	let currentSequence = null;
	const headers = new Set();
	const warnings = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		if (line.startsWith('>')) {
			// Save previous sequence
			if (currentSequence) {
				sequences.push(currentSequence);
			}

			// Start new sequence
			const header = line.substring(1).trim();
			if (!header) {
				warnings.push(`Empty header at line ${i + 1}`);
			}

			if (headers.has(header)) {
				warnings.push(`Duplicate header: ${header}`);
			}
			headers.add(header);

			currentSequence = {
				header,
				sequence: ''
			};
		} else if (currentSequence) {
			// Add to current sequence (remove whitespace)
			currentSequence.sequence += line.replace(/\s/g, '');
		} else {
			throw new Error('Sequence data found before header');
		}
	}

	// Add the last sequence
	if (currentSequence) {
		sequences.push(currentSequence);
	}

	if (sequences.length === 0) {
		throw new Error('No sequences found');
	}

	return { sequences, warnings };
}

/**
 * Validate FASTA content
 * @param {string} fastaContent - Raw FASTA content
 * @returns {Object} Validation result
 */
export function validateFasta(fastaContent) {
	try {
		const { sequences, warnings } = parseFasta(fastaContent);
		const errors = [];

		// Check for empty sequences
		sequences.forEach((seq, idx) => {
			if (!seq.sequence) {
				errors.push(`Empty sequence: ${seq.header}`);
			}
		});

		// Check sequence length consistency (for alignments)
		if (sequences.length > 1) {
			const firstLength = sequences[0].sequence.length;
			const inconsistentLengths = sequences.filter(seq => seq.sequence.length !== firstLength);
			
			if (inconsistentLengths.length > 0) {
				warnings.push(`Inconsistent sequence lengths detected (may not be aligned)`);
			}
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
			sequences,
			stats: {
				sequenceCount: sequences.length,
				averageLength: sequences.length > 0 
					? Math.round(sequences.reduce((sum, seq) => sum + seq.sequence.length, 0) / sequences.length)
					: 0
			}
		};

	} catch (error) {
		return {
			valid: false,
			errors: [error.message],
			warnings: [],
			sequences: [],
			stats: { sequenceCount: 0, averageLength: 0 }
		};
	}
}

/**
 * Detect sequence type (DNA/RNA/Protein)
 * @param {string} sequence - Sequence string
 * @returns {string} Detected type
 */
export function detectSequenceType(sequence) {
	if (!sequence) return 'unknown';

	const cleanSeq = sequence.replace(/[-.\s]/g, '').toUpperCase();
	const nucleotideCount = [...cleanSeq].filter(char => 'ACGTUN'.includes(char)).length;
	const nucleotideRatio = nucleotideCount / cleanSeq.length;

	// If >80% are standard nucleotides, consider it DNA/RNA
	if (nucleotideRatio > 0.8) {
		return cleanSeq.includes('U') ? 'RNA' : 'DNA';
	}

	return 'Protein';
}

/**
 * Validate sequence characters for given type
 * @param {string} sequence - Sequence string  
 * @param {string} type - Expected type (DNA/RNA/Protein)
 * @returns {Array} Invalid characters found
 */
export function validateSequenceCharacters(sequence, type) {
	const validChars = type === 'Protein' ? VALID_AMINO_ACIDS : VALID_NUCLEOTIDES;
	const invalidChars = new Set();

	for (const char of sequence) {
		if (!validChars.has(char)) {
			invalidChars.add(char);
		}
	}

	return Array.from(invalidChars);
}

/**
 * Simple sequence statistics
 * @param {Array} sequences - Array of sequence objects
 * @returns {Object} Basic statistics
 */
export function getSequenceStats(sequences) {
	if (!sequences?.length) {
		return { count: 0, totalLength: 0, averageLength: 0 };
	}

	const totalLength = sequences.reduce((sum, seq) => sum + seq.sequence.length, 0);
	
	return {
		count: sequences.length,
		totalLength,
		averageLength: Math.round(totalLength / sequences.length),
		minLength: Math.min(...sequences.map(s => s.sequence.length)),
		maxLength: Math.max(...sequences.map(s => s.sequence.length))
	};
}