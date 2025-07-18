<!-- src/lib/FelOptions.svelte -->
<script>
	export let runMethod; // Function to be called to run the FEL analysis
	let gencodeid = 'Universal'; // Default to Universal code
	let dsVariation = '2'; // Default to Yes
	let multipleHits = 'None'; // Default option
	let siteMultihit = 'Estimate'; // Default option
	let resample = 0; // Default value for resampling
	let confidenceInterval = false; // Default for checkbox
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
					'site-multihit': siteMultihit
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
