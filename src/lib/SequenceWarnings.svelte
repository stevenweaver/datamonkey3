<!-- src/lib/SequenceWarnings.svelte -->
<script>
	export let fileMetricsJSON = null;

	// State for managing warnings
	let warnings = [];
	let showAllWarnings = false;

	// Watch for changes in fileMetricsJSON
	$: if (fileMetricsJSON) {
		generateWarnings(fileMetricsJSON);
	}

	// Generate warnings based on file metrics
	function generateWarnings(data) {
		warnings = [];

		if (!data || !data.FILE_INFO) return;

		// Check for duplicate sequences
		if (data.FILE_INFO.duplicate_sequences && data.FILE_INFO.duplicate_sequences > 0) {
			warnings.push({
				type: 'warning',
				title: 'Duplicate Sequences Detected',
				message: `Found ${data.FILE_INFO.duplicate_sequences} duplicate sequence${data.FILE_INFO.duplicate_sequences === 1 ? '' : 's'} in your alignment.`,
				details:
					'Duplicate sequences can affect the accuracy of selection analysis. Consider removing duplicates for more reliable results.',
				action: 'View duplicates',
				actionHandler: () => showDuplicateSequences()
			});
		}

		// Check for short alignment
		if (data.FILE_INFO.sites && data.FILE_INFO.sites < 30) {
			warnings.push({
				type: 'info',
				title: 'Short Alignment',
				message: `Your alignment has only ${data.FILE_INFO.sites} sites, which is relatively short.`,
				details:
					'Short alignments may have limited statistical power for detecting selection. Consider adding more sequences or sites if possible.',
				action: null
			});
		}

		// Check for small number of sequences
		if (data.FILE_INFO.sequences && data.FILE_INFO.sequences < 8) {
			warnings.push({
				type: 'info',
				title: 'Small Sample Size',
				message: `Your alignment has only ${data.FILE_INFO.sequences} sequences, which is a small sample.`,
				details:
					'Selection analyses generally perform better with larger samples. Consider adding more sequences if possible.',
				action: null
			});
		}

		// Check for ambiguous characters
		if (data.FILE_INFO.ambiguous_sites && data.FILE_INFO.ambiguous_sites > 0) {
			warnings.push({
				type: 'warning',
				title: 'Ambiguous Characters',
				message: `Found ${data.FILE_INFO.ambiguous_sites} ambiguous character${data.FILE_INFO.ambiguous_sites === 1 ? '' : 's'} in your alignment.`,
				details:
					'Ambiguous characters (like N, X, etc.) may cause issues with some analyses. Consider resolving these ambiguities if possible.',
				action: null
			});
		}

		// Check for stop codons
		if (data.FILE_INFO.stop_codons && data.FILE_INFO.stop_codons > 0) {
			warnings.push({
				type: 'error',
				title: 'Stop Codons Detected',
				message: `Found ${data.FILE_INFO.stop_codons} stop codon${data.FILE_INFO.stop_codons === 1 ? '' : 's'} in your alignment.`,
				details:
					'Stop codons within the alignment may indicate frame shifts, sequencing errors, or pseudogenes. Verify your alignment and genetic code selection.',
				action: null
			});
		}

		// Check for frameshift issues (uneven codon count)
		if (data.FILE_INFO.rawsites && data.FILE_INFO.rawsites % 3 !== 0) {
			warnings.push({
				type: 'error',
				title: 'Alignment Length Not Divisible by 3',
				message: `Your alignment length (${data.FILE_INFO.rawsites}) is not divisible by 3.`,
				details:
					'Codon-based analyses require sequence lengths to be multiples of 3. Check for frameshifts or alignment errors.',
				action: null
			});
		}
	}

	// Show duplicate sequences (placeholder function)
	function showDuplicateSequences() {
		// In a real implementation, this would open a modal or highlight the duplicates
		alert('This function would show the duplicate sequences. Implementation pending.');
	}

	// Get the color class based on warning type
	function getWarningColorClass(type) {
		switch (type) {
			case 'error':
				return 'bg-red-50 border-red-300 text-red-800';
			case 'warning':
				return 'bg-yellow-50 border-yellow-300 text-yellow-800';
			case 'info':
			default:
				return 'bg-blue-50 border-blue-300 text-blue-800';
		}
	}

	// Get the icon based on warning type
	function getWarningIcon(type) {
		switch (type) {
			case 'error':
				return `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        `;
			case 'warning':
				return `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        `;
			case 'info':
			default:
				return `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        `;
		}
	}

	// Toggle showing all warnings
	function toggleShowAllWarnings() {
		showAllWarnings = !showAllWarnings;
	}

	// Calculate warnings to display
	$: displayedWarnings = showAllWarnings ? warnings : warnings.slice(0, 2);
</script>

{#if warnings.length > 0}
	<div class="sequence-warnings mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Sequence Warnings ({warnings.length})</h3>

			{#if warnings.length > 2}
				<button class="text-sm text-blue-600 hover:text-blue-800" on:click={toggleShowAllWarnings}>
					{showAllWarnings ? 'Show Fewer' : 'Show All'}
				</button>
			{/if}
		</div>

		<div class="mt-3 space-y-3">
			{#each displayedWarnings as warning}
				<div class={`warning-item rounded-md border p-3 ${getWarningColorClass(warning.type)}`}>
					<div class="flex items-start">
						<div class="mr-3 flex-shrink-0" style="margin-top: 2px;">
							{@html getWarningIcon(warning.type)}
						</div>

						<div class="flex-1">
							<h4 class="font-semibold">{warning.title}</h4>
							<p class="text-sm">{warning.message}</p>

							{#if warning.details}
								<p class="mt-1 text-xs opacity-90">{warning.details}</p>
							{/if}

							{#if warning.action}
								<button
									class="mt-2 rounded bg-white bg-opacity-50 px-3 py-1 text-xs font-medium hover:bg-opacity-70"
									on:click={warning.actionHandler}
								>
									{warning.action}
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/each}

			{#if !showAllWarnings && warnings.length > 2}
				<div class="text-center">
					<p class="text-sm text-gray-500">
						+{warnings.length - 2} more {warnings.length - 2 === 1 ? 'warning' : 'warnings'}
					</p>
				</div>
			{/if}
		</div>

		<div class="mt-4 text-xs text-gray-500">
			<p>
				These warnings are meant to help you improve your analysis results. Minor issues may not
				significantly affect results.
			</p>
		</div>
	</div>
{/if}
