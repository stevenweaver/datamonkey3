<script>
	import { exportData } from './utils/exportUtils';
	import { Download } from 'lucide-svelte';

	// Props
	export let alignmentFile = null; // The File object containing the alignment
	export let showExport = true;

	// Internal state
	let exportStatus = '';
	let lineWrap = 60;
	let exportFormat = 'fasta';
	let sequences = [];
	let isLoading = false;

	// Available export formats
	const exportFormats = [
		{ id: 'fasta', label: 'FASTA', description: 'Standard FASTA format' },
		{ id: 'nexus', label: 'NEXUS', description: 'NEXUS format for phylogenetic analysis' }
	];

	// Parse sequences when alignmentFile changes
	$: if (alignmentFile) {
		parseAlignmentFile();
	}

	/**
	 * Parse sequences from the alignment file (FASTA or NEXUS format)
	 */
	async function parseAlignmentFile() {
		if (!alignmentFile) {
			sequences = [];
			return;
		}

		isLoading = true;
		try {
			const content = await alignmentFile.text();
			sequences = parseFastaOrNexus(content);
		} catch (error) {
			console.error('Error parsing alignment file:', error);
			sequences = [];
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Parse FASTA or NEXUS format content
	 */
	function parseFastaOrNexus(content) {
		const trimmed = content.trim();

		// Check if it's NEXUS format
		if (trimmed.toLowerCase().startsWith('#nexus')) {
			return parseNexus(trimmed);
		}

		// Otherwise assume FASTA format
		return parseFasta(trimmed);
	}

	/**
	 * Parse FASTA format content
	 */
	function parseFasta(content) {
		const result = [];
		const lines = content.split('\n');
		let currentName = '';
		let currentSequence = '';

		for (const line of lines) {
			const trimmedLine = line.trim();

			// Skip empty lines
			if (!trimmedLine) continue;

			// Skip comment lines
			if (trimmedLine.startsWith(';')) continue;

			// Skip lines that look like Newick trees (start with '(' and contain ':')
			if (trimmedLine.startsWith('(') && trimmedLine.includes(':')) {
				continue;
			}

			if (trimmedLine.startsWith('>')) {
				// Save previous sequence if exists
				if (currentName && currentSequence) {
					result.push({
						name: currentName,
						sequence: currentSequence
					});
				}
				// Start new sequence
				currentName = trimmedLine.substring(1).trim();
				currentSequence = '';
			} else {
				// Append to current sequence, but filter out any tree characters that might be embedded
				// Trees contain characters like ( ) : ; which aren't valid in sequences
				const cleanedLine = trimmedLine.replace(/\s/g, '');
				// Only add if it looks like sequence data (contains only valid nucleotide/amino acid chars and gaps)
				if (/^[A-Za-z\-\.\*]+$/.test(cleanedLine)) {
					currentSequence += cleanedLine;
				}
			}
		}

		// Don't forget the last sequence
		if (currentName && currentSequence) {
			result.push({
				name: currentName,
				sequence: currentSequence
			});
		}

		return result;
	}

	/**
	 * Parse NEXUS format content
	 */
	function parseNexus(content) {
		const result = [];

		// Find the DATA or CHARACTERS block
		const matrixMatch = content.match(/MATRIX\s*\n([\s\S]*?)\s*;/i);
		if (!matrixMatch) {
			return result;
		}

		const matrixContent = matrixMatch[1];
		const lines = matrixContent.split('\n');

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine) continue;

			// Split on whitespace - first part is name, rest is sequence
			const parts = trimmedLine.split(/\s+/);
			if (parts.length >= 2) {
				const name = parts[0];
				const sequence = parts.slice(1).join('').replace(/\s/g, '');

				if (name && sequence) {
					result.push({ name, sequence });
				}
			}
		}

		return result;
	}

	/**
	 * Generate FASTA format text from sequences
	 */
	function generateFastaText(seqs, options = {}) {
		const { wrap = lineWrap } = options;
		let fastaText = '';

		for (const seq of seqs) {
			// Add header
			fastaText += `>${seq.name}\n`;

			// Add sequence with line wrapping
			let sequence = seq.sequence;

			// Wrap the sequence
			if (wrap > 0) {
				for (let i = 0; i < sequence.length; i += wrap) {
					fastaText += sequence.substring(i, i + wrap) + '\n';
				}
			} else {
				fastaText += sequence + '\n';
			}
		}

		return fastaText;
	}

	/**
	 * Generate NEXUS format text from sequences
	 */
	function generateNexusText(seqs) {
		if (seqs.length === 0) return '';

		const nchar = seqs[0].sequence.length;
		const ntax = seqs.length;

		let nexusText = '#NEXUS\n\n';
		nexusText += 'BEGIN DATA;\n';
		nexusText += `  DIMENSIONS NTAX=${ntax} NCHAR=${nchar};\n`;
		nexusText += '  FORMAT DATATYPE=DNA GAP=- MISSING=?;\n';
		nexusText += '  MATRIX\n';

		for (const seq of seqs) {
			// Pad sequence name to align sequences
			const paddedName = seq.name.padEnd(30);
			nexusText += `    ${paddedName} ${seq.sequence}\n`;
		}

		nexusText += '  ;\n';
		nexusText += 'END;\n';

		return nexusText;
	}

	/**
	 * Export sequences in the selected format
	 */
	function exportSequences() {
		try {
			if (sequences.length === 0) {
				exportStatus = 'No sequence data available';
				setTimeout(() => {
					exportStatus = '';
				}, 3000);
				return;
			}

			// Generate a filename
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
			const baseFilename = alignmentFile?.name?.replace(/\.[^/.]+$/, '') || 'sequences';
			const filename = `${baseFilename}_${timestamp}`;

			// Generate content based on format
			let content;
			let format;

			switch (exportFormat) {
				case 'fasta':
					content = generateFastaText(sequences, { wrap: lineWrap });
					format = 'fasta';
					break;

				case 'nexus':
					content = generateNexusText(sequences);
					format = 'nex';
					break;
			}

			// Export the data
			exportData(content, filename, format);

			exportStatus = 'Exported successfully';
			setTimeout(() => {
				exportStatus = '';
			}, 3000);
		} catch (error) {
			console.error('Error exporting sequences:', error);
			exportStatus = `Export failed: ${error.message}`;
			setTimeout(() => {
				exportStatus = '';
			}, 5000);
		}
	}
</script>

{#if alignmentFile && showExport}
	<div class="fasta-export mb-4 rounded-lg border border-border-subtle bg-white p-4 shadow-sm">
		<h3 class="mb-3 text-lg font-bold">Export Sequences</h3>

		{#if isLoading}
			<p class="text-sm text-text-silver">Loading sequences...</p>
		{:else if sequences.length === 0}
			<p class="text-sm text-text-silver">No sequences found in alignment file.</p>
		{:else}
			<p class="mb-3 text-sm text-text-silver">
				{sequences.length} sequences loaded ({sequences[0]?.sequence?.length || 0} sites)
			</p>

			<div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
				<!-- Export format -->
				<div>
					<label class="mb-1 block text-sm font-medium">Format:</label>
					<div class="flex flex-wrap gap-2">
						{#each exportFormats as format}
							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="exportFormat"
									value={format.id}
									bind:group={exportFormat}
									class="mr-1"
								/>
								<span class="mr-1 text-sm font-medium">{format.label}</span>
							</label>
						{/each}
					</div>
				</div>

				<!-- FASTA options (conditional) -->
				{#if exportFormat === 'fasta'}
					<div>
						<label class="mb-1 block text-sm font-medium">Options:</label>
						<div class="flex items-center">
							<label class="mr-1 text-sm">Line wrap:</label>
							<input
								type="number"
								bind:value={lineWrap}
								min="0"
								max="10000"
								step="10"
								class="w-16 rounded border border-border-subtle px-2 py-1 text-sm"
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Export button -->
			<div class="export-actions flex items-center">
				<button
					on:click={exportSequences}
					class="flex items-center rounded bg-brand-royal px-3 py-1 text-white hover:bg-brand-deep"
				>
					<Download class="mr-1 h-4 w-4" />
					Export Sequences
				</button>

				{#if exportStatus}
					<span
						class="ml-3 text-sm"
						class:text-status-success={!exportStatus.includes('failed')}
						class:text-status-error={exportStatus.includes('failed')}
					>
						{exportStatus}
					</span>
				{/if}
			</div>

			<!-- Help text -->
			<div class="mt-3 text-xs text-text-silver">
				{#if exportFormat === 'fasta'}
					<p>
						Exports sequences in standard FASTA format with each sequence preceded by a header line
						(starting with &gt;).
					</p>
				{:else if exportFormat === 'nexus'}
					<p>
						Exports sequences in NEXUS format, commonly used for phylogenetic analysis software.
					</p>
				{/if}
			</div>
		{/if}
	</div>
{/if}
