<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { validateFasta, repairFasta, toFastaFormat, ERROR_TYPES } from './utils/fastaValidation';
	import { exportData } from './utils/exportUtils';

	// Props
	export let file = null;
	export let autoValidate = true;
	export let showRepair = true;

	// Internal state
	let fileContent = '';
	let isValidating = false;
	let validationResults = null;
	let repairedData = null;
	let showFullErrors = false;
	let validationOptions = {
		checkConsistentLength: true,
		sequenceType: 'auto',
		checkStopCodons: true,
		checkCase: true
	};

	const dispatch = createEventDispatcher();

	// When file changes, validate it
	$: if (file && autoValidate) {
		validateFile();
	}

	// Get error severity class
	function getSeverityClass(isError) {
		return isError
			? 'bg-red-100 border-red-400 text-red-700'
			: 'bg-yellow-100 border-yellow-400 text-yellow-700';
	}

	// Format error code
	function formatErrorCode(type) {
		return type && type.code ? type.code : 'UNKNOWN';
	}

	// Run validation on the file
	async function validateFile() {
		if (!file) return;

		isValidating = true;
		try {
			// Read file content
			fileContent = await file.text();

			// Validate FASTA content
			validationResults = validateFasta(fileContent, validationOptions);

			// Dispatch result
			dispatch('validated', validationResults);

			// Auto-repair if there are issues
			if (!validationResults.valid && showRepair) {
				repairFastaData();
			} else {
				repairedData = null;
			}
		} catch (error) {
			console.error('Error validating file:', error);
			validationResults = {
				valid: false,
				errors: [
					{
						type: { code: 'FASTA-999', message: 'Validation error' },
						details: error.message || 'An error occurred during validation'
					}
				],
				warnings: [],
				sequences: [],
				stats: { sequenceCount: 0 }
			};
			dispatch('validated', validationResults);
		} finally {
			isValidating = false;
		}
	}

	// Repair FASTA data
	function repairFastaData() {
		if (!validationResults || !validationResults.sequences) return;

		try {
			// Repair the sequences
			const repaired = repairFasta(validationResults.sequences, {
				normalizeCase: true,
				padSequences: true,
				removeInvalidChars: true,
				removeWhitespace: true,
				sequenceType: validationResults.stats.detectedType || 'auto'
			});

			repairedData = {
				...repaired,
				fastaContent: toFastaFormat(repaired.sequences)
			};

			// Re-validate the repaired content
			const revalidation = validateFasta(repairedData.fastaContent, validationOptions);
			repairedData.valid = revalidation.valid;
			repairedData.remainingWarnings = revalidation.warnings;
			repairedData.remainingErrors = revalidation.errors;

			dispatch('repaired', repairedData);
		} catch (error) {
			console.error('Error repairing FASTA data:', error);
			repairedData = null;
		}
	}

	// Toggle show all errors
	function toggleFullErrors() {
		showFullErrors = !showFullErrors;
	}

	// Export repaired FASTA
	function exportRepaired() {
		if (!repairedData || !repairedData.fastaContent) return;

		try {
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
			const filename = `repaired_${file.name || 'sequence'}_${timestamp}`;

			exportData(repairedData.fastaContent, filename, 'txt');
			dispatch('exported', { filename });
		} catch (error) {
			console.error('Error exporting repaired FASTA:', error);
		}
	}

	// Use repaired data for analysis
	function useRepaired() {
		if (!repairedData || !repairedData.fastaContent) return;

		dispatch('useRepaired', {
			content: repairedData.fastaContent,
			name: `repaired_${file.name || 'sequence'}`
		});
	}

	// Re-run validation with new options
	function revalidate() {
		if (fileContent) {
			validationResults = validateFasta(fileContent, validationOptions);
			dispatch('validated', validationResults);

			if (!validationResults.valid && showRepair) {
				repairFastaData();
			} else {
				repairedData = null;
			}
		}
	}

	onMount(() => {
		if (file && autoValidate) {
			validateFile();
		}
	});
</script>

<div class="fasta-validator mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
	<h3 class="mb-3 text-lg font-bold">FASTA Validation</h3>

	{#if !file}
		<p class="text-gray-500">No file selected for validation</p>
	{:else if isValidating}
		<div class="flex items-center">
			<div class="loader mr-3"></div>
			<p>Validating {file.name}...</p>
		</div>
	{:else if validationResults}
		<!-- Validation options -->
		<div class="mb-4 rounded border border-gray-200 p-3">
			<h4 class="mb-2 font-medium">Validation Options</h4>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={validationOptions.checkConsistentLength}
						on:change={revalidate}
						class="mr-2"
					/>
					<span>Check consistent length</span>
				</label>

				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={validationOptions.checkStopCodons}
						on:change={revalidate}
						class="mr-2"
					/>
					<span>Check stop codons</span>
				</label>

				<label class="flex items-center">
					<input
						type="checkbox"
						bind:checked={validationOptions.checkCase}
						on:change={revalidate}
						class="mr-2"
					/>
					<span>Check case consistency</span>
				</label>

				<div>
					<label class="mb-1 block">Sequence type:</label>
					<select
						bind:value={validationOptions.sequenceType}
						on:change={revalidate}
						class="w-full rounded border border-gray-300 px-2 py-1"
					>
						<option value="auto">Auto-detect</option>
						<option value="nucleotide">Nucleotide</option>
						<option value="amino">Amino Acid</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Validation summary -->
		<div class="mb-4 rounded border border-gray-200 p-3">
			<h4 class="mb-2 font-medium">Validation Summary</h4>

			<div
				class="mb-3 rounded p-2"
				class:bg-green-100={validationResults.valid}
				class:bg-red-100={!validationResults.valid}
			>
				<p
					class="font-medium"
					class:text-green-700={validationResults.valid}
					class:text-red-700={!validationResults.valid}
				>
					{validationResults.valid ? 'Valid FASTA file' : 'Invalid FASTA file'}
				</p>
				{#if validationResults.stats}
					<p class="text-sm">
						<span class="font-medium">Sequences:</span>
						{validationResults.stats.sequenceCount}
						{#if validationResults.stats.sequenceCount > 0}
							<span class="mx-1">|</span>
							<span class="font-medium">Type:</span>
							{validationResults.stats.detectedType === 'nucleotide' ? 'Nucleotide' : 'Amino Acid'}
							<span class="mx-1">|</span>
							<span class="font-medium">Length:</span>
							{#if validationResults.stats.minLength === validationResults.stats.maxLength}
								{validationResults.stats.minLength} bp
							{:else}
								{validationResults.stats.minLength} - {validationResults.stats.maxLength} bp
							{/if}
						{/if}
					</p>
				{/if}
			</div>

			<!-- Errors and warnings -->
			{#if validationResults.errors.length > 0 || validationResults.warnings.length > 0}
				<div class="issues-list">
					<div class="mb-2 flex items-center justify-between">
						<h5 class="font-medium">Issues Found</h5>
						<button
							on:click={toggleFullErrors}
							class="text-xs text-blue-600 hover:text-blue-800 hover:underline"
						>
							{showFullErrors ? 'Show Summary' : 'Show All Details'}
						</button>
					</div>

					<ul class="max-h-48 overflow-y-auto">
						{#each validationResults.errors as error}
							<li class="mb-1 rounded border-l-4 border-red-400 bg-red-50 p-2 text-sm">
								<div class="flex items-start justify-between">
									<div>
										<span class="font-mono text-xs text-red-800">{formatErrorCode(error.type)}</span
										>
										<span class="ml-2 font-medium">{error.type ? error.type.message : 'Error'}</span
										>
									</div>
								</div>
								{#if showFullErrors && error.details}
									<p class="mt-1 text-xs">{error.details}</p>
								{/if}
							</li>
						{/each}

						{#each validationResults.warnings as warning}
							<li class="mb-1 rounded border-l-4 border-yellow-400 bg-yellow-50 p-2 text-sm">
								<div class="flex items-start justify-between">
									<div>
										<span class="font-mono text-xs text-yellow-800"
											>{formatErrorCode(warning.type)}</span
										>
										<span class="ml-2 font-medium"
											>{warning.type ? warning.type.message : 'Warning'}</span
										>
									</div>
								</div>
								{#if showFullErrors && warning.details}
									<p class="mt-1 text-xs">{warning.details}</p>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<p class="text-green-600">No issues found in the file</p>
			{/if}
		</div>

		<!-- Repair section -->
		{#if showRepair && !validationResults.valid}
			<div class="repair-section mb-4 rounded border border-gray-200 p-3">
				<h4 class="mb-2 font-medium">Repair Options</h4>

				{#if !repairedData}
					<button
						on:click={repairFastaData}
						class="flex items-center rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
								clip-rule="evenodd"
							/>
						</svg>
						Repair FASTA File
					</button>
				{:else}
					<div class="mb-3 rounded bg-green-100 p-2 text-green-700">
						<p class="font-medium">File Repaired Successfully</p>
						<p class="text-sm">
							{#if repairedData.valid}
								All issues have been fixed.
							{:else}
								Some issues were fixed, but some may require manual attention.
							{/if}
						</p>
					</div>

					{#if repairedData.repairs.length > 0}
						<div class="mb-3">
							<h5 class="mb-1 font-medium">Repairs Applied:</h5>
							<ul class="ml-4 list-disc text-sm">
								{#each repairedData.repairs.slice(0, 5) as repair}
									<li>{repair.details}</li>
								{/each}
								{#if repairedData.repairs.length > 5}
									<li class="text-gray-500">
										...and {repairedData.repairs.length - 5} more repairs
									</li>
								{/if}
							</ul>
						</div>
					{/if}

					{#if repairedData.remainingErrors.length > 0 || repairedData.remainingWarnings.length > 0}
						<div class="mb-3">
							<h5 class="mb-1 font-medium">Remaining Issues:</h5>
							<ul class="ml-4 list-disc text-sm">
								{#each repairedData.remainingErrors as error}
									<li class="text-red-600">{error.type.message}</li>
								{/each}
								{#each repairedData.remainingWarnings as warning}
									<li class="text-yellow-600">{warning.type.message}</li>
								{/each}
							</ul>
						</div>
					{/if}

					<div class="flex flex-wrap gap-2">
						<button
							on:click={exportRepaired}
							class="flex items-center rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
							Export Repaired FASTA
						</button>

						<button
							on:click={useRepaired}
							class="flex items-center rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
							disabled={!repairedData.valid}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
							Use Repaired Version
						</button>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.loader {
		border: 3px solid #f3f3f3;
		border-top: 3px solid #3498db;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
