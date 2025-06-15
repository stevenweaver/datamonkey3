<!-- src/lib/MethodSelector.svelte -->
<script>
	import { writable } from 'svelte/store';
	
	export let methodConfig;
	export let runMethod = [];
	export let onConfigureMethod = null; // New prop for configuring a method
	
	// Method categorization
	const METHOD_CATEGORIES = {
		RECOMMENDED: {
			name: "Recommended Methods",
			description: "Commonly used analysis methods suitable for most datasets",
			methods: ["fel", "meme", "fubar"]
		},
		SELECTION: {
			name: "Selection Analysis",
			description: "Methods for detecting selection pressure at individual sites",
			methods: ["fel", "slac", "meme", "fubar", "absrel", "busted"]
		},
		RECOMBINATION: {
			name: "Recombination Detection",
			description: "Methods for identifying recombination events",
			methods: ["gard"]
		},
		SPECIALIZED: {
			name: "Specialized Analysis",
			description: "Methods for specific evolutionary patterns",
			methods: ["bgm", "fade", "relax", "multi-hit", "nrm", "contrast-fel"]
		}
	};
	
	// Method info with simplified descriptions
	const METHOD_INFO = {
		"fel": {
			name: "FEL",
			fullName: "Fixed Effects Likelihood",
			shortDescription: "Detect selection at individual sites",
			complexity: "medium",
			speed: "fast",
			tag: "recommended"
		},
		"meme": {
			name: "MEME",
			fullName: "Mixed Effects Model of Evolution",
			shortDescription: "Detect episodic selection at individual sites",
			complexity: "medium",
			speed: "medium",
			tag: "recommended"
		},
		"slac": {
			name: "SLAC",
			fullName: "Single-Likelihood Ancestor Counting",
			shortDescription: "Fast approximate method for detecting selection",
			complexity: "low",
			speed: "very fast",
			tag: "basic"
		},
		"fubar": {
			name: "FUBAR",
			fullName: "Fast Unconstrained Bayesian AppRoximation",
			shortDescription: "Bayesian approach to detect selection",
			complexity: "medium",
			speed: "medium",
			tag: "recommended"
		},
		"absrel": {
			name: "aBSREL",
			fullName: "adaptive Branch-Site Random Effects Likelihood",
			shortDescription: "Test for selection on specific branches",
			complexity: "high",
			speed: "slow",
			tag: "advanced"
		},
		"busted": {
			name: "BUSTED",
			fullName: "Branch-site Unrestricted Statistical Test for Episodic Diversification",
			shortDescription: "Test for gene-wide selection",
			complexity: "high",
			speed: "slow",
			tag: "advanced"
		},
		"gard": {
			name: "GARD",
			fullName: "Genetic Algorithm for Recombination Detection",
			shortDescription: "Detect recombination breakpoints",
			complexity: "high",
			speed: "very slow",
			tag: "specialized"
		},
		"bgm": {
			name: "BGM",
			fullName: "Bayesian Graphical Model",
			shortDescription: "Detect correlated substitution patterns",
			complexity: "very high",
			speed: "very slow",
			tag: "specialized"
		},
		"fade": {
			name: "FADE",
			fullName: "FUBAR Approach to Directional Evolution",
			shortDescription: "Detect directional selection",
			complexity: "high",
			speed: "slow",
			tag: "specialized"
		},
		"relax": {
			name: "RELAX",
			fullName: "Relaxation Test",
			shortDescription: "Test for relaxed or intensified selection",
			complexity: "high",
			speed: "slow",
			tag: "specialized"
		},
		"multi-hit": {
			name: "MULTI-HIT",
			fullName: "Multiple Hit Model",
			shortDescription: "Account for multiple substitutions",
			complexity: "high",
			speed: "slow",
			tag: "specialized"
		},
		"nrm": {
			name: "NRM",
			fullName: "Non-Reversible Model",
			shortDescription: "Directional evolution analysis",
			complexity: "high",
			speed: "slow",
			tag: "specialized"
		},
		"contrast-fel": {
			name: "Contrast-FEL",
			fullName: "Contrast Fixed Effects Likelihood",
			shortDescription: "Compare selection between groups",
			complexity: "high",
			speed: "medium",
			tag: "specialized"
		}
	};
	
	// Interface state management
	let showAllMethods = false;
	let searchQuery = "";
	let selectedCategory = "RECOMMENDED";
	let selectedMethods = writable([]);
	
	// Handle method selection
	function toggleMethodSelection(method) {
		$selectedMethods = $selectedMethods.includes(method)
			? $selectedMethods.filter(m => m !== method)
			: [...$selectedMethods, method];
	}
	
	// Clear all selected methods
	function clearSelection() {
		$selectedMethods = [];
	}
	
	// Run selected method
	function runMethodHandler(method) {
		console.log(`Running method: ${method}`);
		$selectedMethods = [method]; // Set as the only selected method
		runMethod(method);
	}
	
	// Configure method
	function configureMethodHandler(method) {
		console.log(`Configuring method: ${method}`);
		if (onConfigureMethod) {
			$selectedMethods = [method]; // Set as the only selected method
			onConfigureMethod(method);
		}
	}
	
	// Run all selected methods
	function runSelectedMethods() {
		console.log(`Running selected methods: ${$selectedMethods}`);
		// Implementation would depend on how multiple methods should be run
		if ($selectedMethods.length === 1) {
			runMethod($selectedMethods[0]);
		} else {
			// For multiple methods, additional logic would be needed
			// This is a placeholder for future implementation
			alert(`Running multiple methods (${$selectedMethods.length}) is not yet implemented`);
		}
	}
	
	// Filter methods based on search and category
	$: filteredMethods = Object.entries(methodConfig)
		.filter(([key, method]) => {
			// Filter by search query
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return key.toLowerCase().includes(query) || 
					method.description.toLowerCase().includes(query) ||
					(METHOD_INFO[key]?.fullName || "").toLowerCase().includes(query);
			}
			
			// Filter by selected category or show all
			if (showAllMethods) return true;
			
			return METHOD_CATEGORIES[selectedCategory].methods.includes(key);
		})
		.sort((a, b) => {
			// Sort by recommended tag first, then alphabetically
			const aInfo = METHOD_INFO[a[0]] || {};
			const bInfo = METHOD_INFO[b[0]] || {};
			
			if (aInfo.tag === "recommended" && bInfo.tag !== "recommended") return -1;
			if (aInfo.tag !== "recommended" && bInfo.tag === "recommended") return 1;
			
			return a[0].localeCompare(b[0]);
		});

	// Function to get method info if available
	function getMethodInfo(key) {
		return METHOD_INFO[key] || {
			name: key.toUpperCase(),
			fullName: key,
			shortDescription: "",
			complexity: "unknown",
			speed: "unknown",
			tag: ""
		};
	}
	
	// Function to get badge color based on tag
	function getBadgeColor(tag) {
		switch(tag) {
			case "recommended": return "bg-green-100 text-green-800 border-green-200";
			case "basic": return "bg-blue-100 text-blue-800 border-blue-200";
			case "advanced": return "bg-purple-100 text-purple-800 border-purple-200";
			case "specialized": return "bg-orange-100 text-orange-800 border-orange-200";
			default: return "bg-gray-100 text-gray-800 border-gray-200";
		}
	}
	
	// Function to get speed indicator
	function getSpeedIndicator(speed) {
		switch(speed) {
			case "very fast": return "⚡⚡ Very Fast";
			case "fast": return "⚡ Fast";
			case "medium": return "⏱️ Medium";
			case "slow": return "🐢 Slow";
			case "very slow": return "🐌 Very Slow";
			default: return "⏱️ Unknown";
		}
	}
</script>

<div class="method-selector bg-white p-6 rounded-lg shadow-md">
	<!-- Header and Controls -->
	<div class="mb-6 flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h3 class="text-xl font-bold">Analysis Methods</h3>
			
			<!-- Method selection counter -->
			{#if $selectedMethods.length > 0}
				<div class="flex items-center gap-2">
					<span class="text-sm font-medium text-indigo-700">
						{$selectedMethods.length} method{$selectedMethods.length > 1 ? 's' : ''} selected
					</span>
					<button 
						class="text-sm text-gray-500 hover:text-gray-700"
						on:click={clearSelection}
					>
						Clear
					</button>
				</div>
			{/if}
		</div>
		
		<!-- Search and filtering -->
		<div class="flex gap-4">
			<div class="relative flex-1">
				<input 
					type="text" 
					placeholder="Search methods..." 
					bind:value={searchQuery} 
					class="w-full rounded-md border border-gray-300 pl-10 py-2 pr-3 text-sm"
				/>
				<svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
			</div>
			
			<!-- Category selector -->
			<div class="flex gap-2">
				{#each Object.keys(METHOD_CATEGORIES) as category}
					<button 
						class="text-sm px-3 py-1 rounded-full {selectedCategory === category ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
						on:click={() => { selectedCategory = category; showAllMethods = false; }}
					>
						{METHOD_CATEGORIES[category].name.split(' ')[0]}
					</button>
				{/each}
				<button 
					class="text-sm px-3 py-1 rounded-full {showAllMethods ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
					on:click={() => showAllMethods = true}
				>
					All
				</button>
			</div>
		</div>
	</div>
	
	<!-- Category description -->
	{#if !showAllMethods && !searchQuery}
		<div class="mb-4 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
			<p>{METHOD_CATEGORIES[selectedCategory].description}</p>
		</div>
	{/if}
	
	<!-- Method cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each filteredMethods as [key, method]}
			{@const methodInfo = getMethodInfo(key)}
			{@const isSelected = $selectedMethods.includes(key)}
			<div
				class="relative flex flex-col rounded-lg border {isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} bg-white p-4 shadow-sm transition-all hover:shadow-md"
				on:click={() => toggleMethodSelection(key)}
			>
				<!-- Selection indicator -->
				{#if isSelected}
					<div class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					</div>
				{/if}
				
				<!-- Method header -->
				<div class="mb-2 flex items-start justify-between">
					<div>
						<h4 class="font-bold text-gray-900">{methodInfo.name}</h4>
						<p class="text-xs text-gray-500">{methodInfo.fullName}</p>
					</div>
					{#if methodInfo.tag}
						<span class="ml-2 rounded-full border px-2 py-0.5 text-xs font-medium {getBadgeColor(methodInfo.tag)}">
							{methodInfo.tag}
						</span>
					{/if}
				</div>
				
				<!-- Method info -->
				<div class="mb-4 flex-1">
					<p class="text-sm text-gray-700">{methodInfo.shortDescription || method.description.substring(0, 100)}</p>
					
					<div class="mt-2 flex flex-wrap gap-2">
						<span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600">
							{getSpeedIndicator(methodInfo.speed)}
						</span>
					</div>
				</div>
				
				<!-- Action buttons -->
				<div class="mt-auto flex gap-2">
					{#if method.options && method.options.length > 0 && onConfigureMethod}
						<button 
							class="flex-1 rounded bg-white border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
							on:click|stopPropagation={() => configureMethodHandler(key)}
						>
							Configure
						</button>
					{/if}
					<button 
						class="flex-1 rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
						on:click|stopPropagation={() => runMethodHandler(key)}
					>
						Run
					</button>
				</div>
			</div>
		{/each}
	</div>
	
	<!-- Action panel for selected methods -->
	{#if $selectedMethods.length > 0}
		<div class="mt-6 rounded-lg bg-gray-50 p-4 shadow-sm">
			<div class="flex items-center justify-between">
				<div>
					<h4 class="font-medium">Selected Methods ({$selectedMethods.length})</h4>
					<p class="text-sm text-gray-500">
						{$selectedMethods.map(m => METHOD_INFO[m]?.name || m.toUpperCase()).join(', ')}
					</p>
				</div>
				<div class="flex gap-2">
					<button 
						class="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
						on:click={clearSelection}
					>
						Clear
					</button>
					<button 
						class="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
						on:click={runSelectedMethods}
						disabled={$selectedMethods.length === 0}
					>
						{$selectedMethods.length > 1 ? 'Run Selected Methods' : 'Run Method'}
					</button>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Help me choose wizard (simplified version) -->
	<div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
		<h4 class="font-medium">Need help choosing?</h4>
		<p class="mb-3 text-sm text-gray-600">
			Not sure which method to use? Here are some common scenarios:
		</p>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
			<button 
				class="rounded bg-white p-2 text-left shadow-sm hover:bg-gray-50"
				on:click={() => { 
					selectedCategory = "RECOMMENDED"; 
					showAllMethods = false; 
					searchQuery = "";
				}}
			>
				<span class="font-medium">Detection of selection at individual sites</span>
				<span class="block text-gray-500">Use FEL or MEME</span>
			</button>
			<button 
				class="rounded bg-white p-2 text-left shadow-sm hover:bg-gray-50"
				on:click={() => { 
					showAllMethods = false; 
					searchQuery = "gard";
				}}
			>
				<span class="font-medium">Detection of recombination</span>
				<span class="block text-gray-500">Use GARD</span>
			</button>
			<button 
				class="rounded bg-white p-2 text-left shadow-sm hover:bg-gray-50"
				on:click={() => { 
					showAllMethods = false; 
					searchQuery = "absrel";
				}}
			>
				<span class="font-medium">Detection of selection on specific branches</span>
				<span class="block text-gray-500">Use aBSREL</span>
			</button>
			<button 
				class="rounded bg-white p-2 text-left shadow-sm hover:bg-gray-50"
				on:click={() => { 
					showAllMethods = false; 
					searchQuery = "busted";
				}}
			>
				<span class="font-medium">Gene-wide tests for selection</span>
				<span class="block text-gray-500">Use BUSTED</span>
			</button>
		</div>
	</div>
</div>

<style>
	/* Add any additional custom styles here */
	:global(.method-selector) {
		max-width: 1200px;
		margin: 0 auto;
	}
</style>