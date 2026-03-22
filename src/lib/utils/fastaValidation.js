/**
 * Simple FASTA Validation Utilities
 * Simplified version focusing on essential validation functionality
 */

// Legacy ERROR_TYPES for backward compatibility
export const ERROR_TYPES = {
	EMPTY_FILE: { code: 'FASTA-001', message: 'File is empty' },
	NO_HEADER: { code: 'FASTA-002', message: 'FASTA header line not found' },
	INVALID_HEADER: { code: 'FASTA-003', message: 'Invalid FASTA header format' },
	EMPTY_SEQUENCE: { code: 'FASTA-004', message: 'Sequence is empty' },
	INCONSISTENT_LENGTH: { code: 'FASTA-005', message: 'Inconsistent sequence lengths' },
	INVALID_CHARACTERS: { code: 'FASTA-006', message: 'Invalid characters in sequence' },
	DUPLICATE_HEADERS: { code: 'FASTA-007', message: 'Duplicate sequence headers' }
};

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
			const inconsistentLengths = sequences.filter((seq) => seq.sequence.length !== firstLength);

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
				averageLength:
					sequences.length > 0
						? Math.round(
								sequences.reduce((sum, seq) => sum + seq.sequence.length, 0) / sequences.length
							)
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
	const nucleotideCount = [...cleanSeq].filter((char) => 'ACGTUN'.includes(char)).length;
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
		minLength: Math.min(...sequences.map((s) => s.sequence.length)),
		maxLength: Math.max(...sequences.map((s) => s.sequence.length))
	};
}

/**
 * Sanitize a single sequence/node name for Newick compatibility.
 * Replaces characters that are invalid in Newick tree format with underscores,
 * collapses consecutive underscores, and strips leading/trailing underscores.
 * @param {string} name - Original name
 * @returns {string} Sanitized name
 */
export function sanitizeName(name) {
	if (!name) return name;
	// Replace characters invalid in Newick format with underscores
	let sanitized = name.replace(/[|() ,;:[\]'"]/g, '_');
	// Collapse consecutive underscores to a single underscore
	sanitized = sanitized.replace(/_+/g, '_');
	// Strip leading and trailing underscores
	sanitized = sanitized.replace(/^_+|_+$/g, '');
	return sanitized;
}

/**
 * Sanitize sequence names in FASTA data and tree data so they remain consistent
 * and compatible with HyPhy's Newick tree parser.
 *
 * Characters replaced: | ( ) space , : ; [ ] ' "
 *
 * @param {string} fastaData - Raw FASTA content
 * @param {string} treeData - Newick tree string
 * @returns {{ sanitizedFasta: string, sanitizedTree: string }}
 */
export function sanitizeSequenceNames(fastaData, treeData) {
	// Build a mapping of original names to sanitized names from the FASTA headers
	const nameMap = new Map();
	const lines = fastaData.split(/\r?\n/);

	for (const line of lines) {
		if (line.startsWith('>')) {
			const original = line.substring(1).trim();
			const sanitized = sanitizeName(original);
			if (original !== sanitized) {
				nameMap.set(original, sanitized);
			}
		}
	}

	// If nothing needs sanitizing, return early
	if (nameMap.size === 0) {
		return { sanitizedFasta: fastaData, sanitizedTree: treeData };
	}

	console.log(`Sanitizing ${nameMap.size} sequence name(s) with special characters`);

	// Sanitize FASTA headers
	const sanitizedFasta = lines
		.map((line) => {
			if (line.startsWith('>')) {
				const original = line.substring(1).trim();
				const sanitized = nameMap.get(original);
				return sanitized !== undefined ? `>${sanitized}` : line;
			}
			return line;
		})
		.join('\n');

	// Sanitize tree node names by replacing each original name in the Newick string
	let sanitizedTree = treeData;
	if (treeData) {
		// Sort by length descending so longer names are replaced first,
		// preventing partial replacements of shorter substrings
		const sortedEntries = [...nameMap.entries()].sort((a, b) => b[0].length - a[0].length);
		for (const [original, sanitized] of sortedEntries) {
			// Escape special regex characters in the original name
			const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			sanitizedTree = sanitizedTree.replace(new RegExp(escaped, 'g'), sanitized);
		}
	}

	return { sanitizedFasta, sanitizedTree };
}

/**
 * Convert sequences to FASTA format string
 * @param {Array} sequences - Array of sequence objects
 * @param {number} lineWidth - Line width for sequence wrapping (default: 80)
 * @returns {string} FASTA formatted string
 */
export function toFastaFormat(sequences, lineWidth = 80) {
	if (!sequences?.length) return '';

	return sequences
		.map((seq) => {
			const header = `>${seq.header}`;
			const sequence = seq.sequence;

			if (lineWidth <= 0) {
				return `${header}\n${sequence}`;
			}

			// Wrap sequence at specified line width
			const wrappedSequence =
				sequence.match(new RegExp(`.{1,${lineWidth}}`, 'g'))?.join('\n') || sequence;
			return `${header}\n${wrappedSequence}`;
		})
		.join('\n');
}

/**
 * Attempt to repair common FASTA format issues
 * @param {string} fastaContent - Raw FASTA content
 * @returns {Object} Repaired content and repair log
 */
export function repairFasta(fastaContent) {
	if (!fastaContent?.trim()) {
		return {
			repairedContent: '',
			repairs: ['Cannot repair empty content'],
			success: false
		};
	}

	let content = fastaContent;
	const repairs = [];

	// Remove excessive whitespace
	content = content.replace(/\n{3,}/g, '\n\n').trim();
	if (content !== fastaContent.trim()) {
		repairs.push('Removed excessive blank lines');
	}

	// Ensure headers start on new lines
	content = content.replace(/(\S)>/g, '$1\n>');
	if (content !== fastaContent) {
		repairs.push('Fixed header line breaks');
	}

	// Remove spaces within sequences (but preserve line breaks)
	const lines = content.split('\n');
	let inSequence = false;
	const repairedLines = [];

	for (const line of lines) {
		if (line.startsWith('>')) {
			inSequence = true;
			repairedLines.push(line);
		} else if (inSequence && line.trim()) {
			const originalLine = line;
			const cleanedLine = line.replace(/\s+/g, '');
			repairedLines.push(cleanedLine);
			if (originalLine !== cleanedLine) {
				repairs.push('Removed whitespace from sequences');
			}
		} else {
			repairedLines.push(line);
		}
	}

	const repairedContent = repairedLines.join('\n');

	return {
		repairedContent,
		repairs,
		success: repairs.length > 0
	};
}
