<!-- src/lib/FelOptions.svelte -->
<script>
	import BranchSelector from './BranchSelector.svelte';
	import TreeSourceSelector from './TreeSourceSelector.svelte';
	import { treeStore } from '../stores/tree';

	export let runMethod; // Function to be called to run the FEL analysis
	let gencodeid = 'Universal'; // Default to Universal code
	let dsVariation = '2'; // Default to Yes
	let multipleHits = 'None'; // Default option
	let siteMultihit = 'Estimate'; // Default option
	let resample = 0; // Default value for resampling
	let confidenceInterval = false; // Default for checkbox

	// Branch selection options
	let branchesToTest = 'All'; // Default option
	let customBranches = ''; // For comma-separated branch names
	let regexPattern = ''; // For regex patterns
	let selectedTreeData = '';
	let taggedNewick = '';

	// Tree store subscription
	let trees = {};
	treeStore.subscribe((value) => {
		trees = value;
		if (trees.inferredNewick) {
			selectedTreeData = trees.inferredNewick;
		}
	});

	// Handle branch selection change
	function handleBranchSelectionChange(event) {
		taggedNewick = event.detail.taggedNewick || '';
	}

	// Generate tagged Newick based on selection mode
	function generateTaggedNewick(treeData, mode, customValue = '') {
		if (!treeData) return '';

		switch (mode) {
			case 'All':
				// Tag all branches as foreground
				return treeData.replace(/([,\(])([^,\(\):]+):/g, '$1$2{fg}:');
			case 'Internal':
				// Tag only internal nodes (nodes without names or with numeric identifiers)
				return treeData.replace(/\)([^,\(\):]*):([^,\(\):]+)/g, ')$1{fg}:$2');
			case 'Leaves':
				// Tag only leaf nodes (named nodes that don't have children)
				return treeData.replace(/([A-Za-z][^,\(\):]*):([^,\(\):]+)/g, '$1{fg}:$2');
			case 'Unlabeled':
				// Tag branches that don't have existing labels
				return treeData.replace(/(\w+):([^,\(\){]+)(?!\{)/g, '$1{fg}:$2');
			case 'Custom':
				if (customValue.includes(',')) {
					// Comma-separated branch names
					const branchNames = customValue.split(',').map((n) => n.trim());
					let result = treeData;
					branchNames.forEach((name) => {
						result = result.replace(new RegExp(`(${name}):`, 'g'), `$1{fg}:`);
					});
					return result;
				} else if (customValue.startsWith('/') && customValue.endsWith('/i')) {
					// Regex pattern (case-insensitive)
					const pattern = customValue.slice(1, -2);
					const regex = new RegExp(`(${pattern}):`, 'gi');
					return treeData.replace(regex, '$1{fg}:');
				} else if (customValue.startsWith('/') && customValue.endsWith('/')) {
					// Regex pattern (case-sensitive)
					const pattern = customValue.slice(1, -1);
					const regex = new RegExp(`(${pattern}):`, 'g');
					return treeData.replace(regex, '$1{fg}:');
				}
				return treeData;
			default:
				return treeData;
		}
	}

	// Update tagged newick when selection changes
	$: if (selectedTreeData && branchesToTest) {
		if (branchesToTest === 'Interactive') {
			// Use the interactively selected branches from BranchSelector
			// taggedNewick will be set by handleBranchSelectionChange
		} else {
			taggedNewick = generateTaggedNewick(
				selectedTreeData,
				branchesToTest,
				branchesToTest === 'Custom' ? customBranches || regexPattern : ''
			);
		}
	}
</script>

<div id="fel-options" class="rounded-lg bg-white p-6 shadow-md">
	<h3 class="mb-4 text-xl font-semibold">FEL Analysis Options</h3>

	<div class="mb-4">
		<label id="geneticcode-content" class="mb-1 block text-gray-700">
			Genetic Code <a href="/help#genetic-code" target="_blank" class="text-blue-500"
				><sup>?</sup></a
			>
		</label>
		<select
			bind:value={gencodeid}
			name="gencodeid"
			class="w-full rounded border border-gray-300 p-2"
		>
			<option value="Universal">Universal code</option>
			<option value="Vertebrate mtDNA">Vertebrate mitochondrial DNA code</option>
			<option value="Yeast mtDNA">Yeast mitochondrial DNA code</option>
			<option value="Mold/Protozoan mtDNA"
				>Mold, Protozoan and Coelenterate mt; Mycloplasma/Spiroplasma</option
			>
			<option value="Invertebrate mtDNA">Invertebrate mitochondrial DNA code</option>
			<option value="Ciliate Nuclear">Ciliate, Dasycladacean and Hexamita Nuclear code</option>
			<option value="Echinoderm mtDNA">Echinoderm mitochondrial DNA code</option>
			<option value="Eupltoid Nuclear">Euplotid Nuclear code</option>
			<option value="Alt. Yeast Nuclear">Alternative Yeast Nuclear code</option>
			<option value="Ascidian mtDNA">Ascidian mitochondrial DNA code</option>
			<option value="Flatworm mtDNA">Flatworm mitochondrial DNA code</option>
			<option value="Blepharisma Nuclear">Blepharisma Nuclear code</option>
		</select>
	</div>

	<div class="mb-4">
		<label class="mb-1 block text-gray-700">Synonymous rate variation (recommended)?</label>
		<select
			bind:value={dsVariation}
			id="ds-variation"
			class="w-full rounded border border-gray-300 p-2"
		>
			<option value="2">No</option>
			<option value="1">Yes</option>
		</select>
	</div>

	<div class="mb-4">
		<label for="multiple-hits" class="mb-1 block text-gray-700">Multiple Hits</label>
		<select
			bind:value={multipleHits}
			name="multiple_hits"
			id="multiple-hits"
			class="w-full rounded border border-gray-300 p-2"
		>
			<option value="None">None (Single mutations only)</option>
			<option value="Double">Double (Branch-specific rates for double substitutions)</option>
			<option value="Double+Triple"
				>Double+Triple (Branch-specific rates for double and triple substitutions)</option
			>
		</select>
	</div>

	<div class="mb-4">
		<label for="estimated-rates" class="mb-1 block text-gray-700">Site Multihit</label>
		<select
			bind:value={siteMultihit}
			name="site_multihit"
			id="site-multihit"
			class="w-full rounded border border-gray-300 p-2"
		>
			<option value="Estimate"
				>Estimate (Branch-specific rates for substitutions based on model fit)</option
			>
			<option value="Global">Global (Rates derived from global model fit)</option>
		</select>
	</div>

	<!-- Branches to Test Section -->
	<div class="mb-6">
		<h4 class="mb-3 text-lg font-semibold">Branches to Test</h4>
		<div class="mb-4">
			<label class="mb-1 block text-gray-700">Selection Mode</label>
			<select bind:value={branchesToTest} class="w-full rounded border border-gray-300 p-2">
				<option value="All">All branches</option>
				<option value="Internal">Internal branches only</option>
				<option value="Leaves">Leaf branches only</option>
				<option value="Unlabeled">Unlabeled branches only</option>
				<option value="Custom">Custom selection</option>
				<option value="Interactive">Interactive tree selection</option>
			</select>
		</div>

		{#if branchesToTest === 'Custom'}
			<div class="mb-4">
				<label class="mb-1 block text-gray-700">Branch Names (comma-separated)</label>
				<input
					type="text"
					bind:value={customBranches}
					placeholder="e.g. Node1,Node2,Branch3"
					class="w-full rounded border border-gray-300 p-2"
				/>
				<p class="mt-1 text-sm text-gray-500">Or use a regex pattern:</p>
				<input
					type="text"
					bind:value={regexPattern}
					placeholder="e.g. /^human/i for case-insensitive match"
					class="mt-1 w-full rounded border border-gray-300 p-2"
				/>
			</div>
		{/if}

		{#if branchesToTest === 'Interactive' && selectedTreeData}
			<div class="mb-4">
				<p class="mb-2 text-sm text-gray-600">
					Click on branches in the tree below to select them for testing:
				</p>
				<div class="rounded border border-gray-300 p-4">
					<BranchSelector
						treeData={selectedTreeData}
						height={300}
						width={600}
						on:selectionChange={handleBranchSelectionChange}
					/>
				</div>
			</div>
		{/if}

		{#if taggedNewick && branchesToTest !== 'All'}
			<div class="mb-4">
				<label class="mb-1 block text-gray-700">Tagged Tree Preview</label>
				<textarea
					value={taggedNewick}
					readonly
					rows="3"
					class="w-full rounded border border-gray-300 bg-gray-50 p-2 font-mono text-sm"
				></textarea>
				<p class="mt-1 text-xs text-gray-500">
					Branches tagged with {'fg'} will be tested for positive selection
				</p>
			</div>
		{/if}
	</div>

	<div class="mb-4">
		<button
			class="w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
			on:click={() =>
				runMethod({
					code: gencodeid,
					srv: dsVariation,
					'multiple-hits': multipleHits,
					resample,
					ci: confidenceInterval ? 'Yes' : 'No',
					'site-multihit': siteMultihit,
					branches: branchesToTest,
					'tagged-newick': taggedNewick || selectedTreeData
				})}
		>
			Run FEL Analysis
		</button>
	</div>

	<div class="mt-6">
		<h5 class="text-lg font-semibold">Advanced Options</h5>
		<div class="mt-2 rounded-md border border-gray-300 bg-gray-50 p-4">
			<div class="mb-4">
				<p class="text-sm text-gray-600">
					[Advanced setting, will result in MUCH SLOWER run time] Perform parametric bootstrap
					resampling to derive site-level null LRT distributions up to this many replicates per
					site. Recommended use for small to medium (%lt 30 sequences) datasets.
				</p>
				<label class="mb-1 block text-gray-700">Resample?</label>
				<input
					type="number"
					bind:value={resample}
					placeholder="50"
					min="0"
					max="1000"
					name="resample"
					class="w-full rounded border border-gray-300 p-2"
				/>
			</div>

			<div class="mb-4">
				<p class="text-sm text-gray-600">
					Compute profile likelihood confidence intervals for each variable site
				</p>
				<label class="inline-flex items-center">
					<input
						type="checkbox"
						bind:checked={confidenceInterval}
						id="confidence-interval"
						name="confidence-interval"
						class="form-checkbox rounded text-indigo-600 focus:ring-indigo-500"
					/>
					<span class="ml-2">Yes?</span>
				</label>
			</div>
		</div>
	</div>
</div>

<style>
	/* Custom styles if needed can be added here */
</style>
