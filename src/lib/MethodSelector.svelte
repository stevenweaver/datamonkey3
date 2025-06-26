<!-- src/lib/MethodSelector.svelte -->
<script>
	import { writable } from 'svelte/store';
	import AnalysisProgressRams from './AnalysisProgressRams.svelte';
	
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
					(METHOD_INFO[key.toLowerCase()]?.fullName || "").toLowerCase().includes(query);
			}
			
			// Filter by selected category or show all
			if (showAllMethods) return true;
			
			return METHOD_CATEGORIES[selectedCategory].methods.includes(key.toLowerCase());
		})
		.sort((a, b) => {
			// Sort by recommended tag first, then alphabetically
			const aInfo = METHOD_INFO[a[0].toLowerCase()] || {};
			const bInfo = METHOD_INFO[b[0].toLowerCase()] || {};
			
			if (aInfo.tag === "recommended" && bInfo.tag !== "recommended") return -1;
			if (aInfo.tag !== "recommended" && bInfo.tag === "recommended") return 1;
			
			return a[0].localeCompare(b[0]);
		});

	// Function to get method info if available
	function getMethodInfo(key) {
		return METHOD_INFO[key.toLowerCase()] || {
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
			case "recommended": return "bg-accent-copper text-white border-accent-copper";
			case "basic": return "bg-brand-muted text-white border-brand-muted";
			case "advanced": return "bg-brand-deep text-white border-brand-deep";
			case "specialized": return "bg-accent-warm text-white border-accent-warm";
			default: return "bg-text-silver text-white border-text-silver";
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

<div class="method-selector bg-white p-premium-xl rounded-premium shadow-premium">
	<!-- Header and Controls -->
	<div class="mb-premium-xl flex flex-col gap-premium-md">
		<div class="flex items-center justify-between">
			<h3 class="text-premium-header font-semibold text-text-rich">Analysis Methods</h3>
			
			<!-- Method selection counter -->
			{#if $selectedMethods.length > 0}
				<div class="flex items-center gap-premium-sm">
					<span class="text-premium-meta font-medium text-brand-royal">
						{$selectedMethods.length} method{$selectedMethods.length > 1 ? 's' : ''} selected
					</span>
					<button 
						class="text-premium-meta text-text-silver hover:text-brand-royal transition-all duration-premium"
						on:click={clearSelection}
					>
						Clear
					</button>
				</div>
			{/if}
		</div>
		
		<!-- Search and filtering -->
		<div class="flex gap-premium-md">
			<div class="relative flex-1">
				<input 
					type="text" 
					placeholder="Search methods..." 
					bind:value={searchQuery} 
					class="w-full rounded-premium-sm border border-border-platinum pl-10 py-premium-sm px-premium-md text-premium-body"
				/>
				<svg class="absolute left-3 top-2.5 h-5 w-5 text-text-silver" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
			</div>
			
			<!-- Category selector -->
			<div class="flex gap-premium-sm">
				{#each Object.keys(METHOD_CATEGORIES) as category}
					<button 
						class="text-premium-meta px-premium-md py-premium-xs rounded-premium-xl font-medium tracking-premium-wide transition-all duration-premium {selectedCategory === category ? 'bg-brand-royal text-white' : 'bg-brand-whisper text-text-slate hover:bg-brand-ghost hover:text-brand-royal'}"
						on:click={() => { selectedCategory = category; showAllMethods = false; }}
					>
						{METHOD_CATEGORIES[category].name.split(' ')[0]}
					</button>
				{/each}
				<button 
					class="text-premium-meta px-premium-md py-premium-xs rounded-premium-xl font-medium tracking-premium-wide transition-all duration-premium {showAllMethods ? 'bg-brand-royal text-white' : 'bg-brand-whisper text-text-slate hover:bg-brand-ghost hover:text-brand-royal'}"
					on:click={() => showAllMethods = true}
				>
					All
				</button>
			</div>
		</div>
	</div>
	
	<!-- Category description -->
	{#if !showAllMethods && !searchQuery}
		<div class="mb-premium-md rounded-premium bg-brand-whisper p-premium-md text-premium-body text-text-slate">
			<p>{METHOD_CATEGORIES[selectedCategory].description}</p>
		</div>
	{/if}
	
	<!-- Analysis Progress -->
	<div class="mb-premium-xl">
		<AnalysisProgressRams />
	</div>

	<!-- Method cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-premium-md">
		{#each filteredMethods as [key, method]}
			{@const methodInfo = getMethodInfo(key)}
			{@const isSelected = $selectedMethods.includes(key)}
			<div
				class="relative flex flex-col rounded-premium border {isSelected ? 'border-brand-royal ring-2 ring-brand-muted' : 'border-border-platinum'} bg-white p-premium-md shadow-premium transition-all duration-premium hover:shadow-premium-hover"
				on:click={() => toggleMethodSelection(key)}
			>
				<!-- Selection indicator -->
				{#if isSelected}
					<div class="absolute right-premium-sm top-premium-sm flex h-6 w-6 items-center justify-center rounded-full bg-brand-royal text-white">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
						</svg>
					</div>
				{/if}
				
				<!-- Method header -->
				<div class="mb-premium-sm flex items-start justify-between">
					<div>
						<h4 class="text-premium-title font-semibold text-text-rich">{methodInfo.name}</h4>
						<p class="text-premium-caption text-text-silver">{methodInfo.fullName}</p>
					</div>
					{#if methodInfo.tag}
						<span class="ml-premium-sm rounded-premium-xl border px-premium-sm py-0.5 text-premium-caption font-medium tracking-premium-badge {getBadgeColor(methodInfo.tag)}">
							{methodInfo.tag}
						</span>
					{/if}
				</div>
				
				<!-- Method info -->
				<div class="mb-premium-md flex-1">
					<p class="text-premium-body text-text-slate">{methodInfo.shortDescription || method.description.substring(0, 100)}</p>
					
					<div class="mt-premium-sm flex flex-wrap gap-premium-sm">
						<span class="inline-flex items-center rounded-premium-sm bg-brand-whisper px-premium-sm py-premium-xs text-premium-caption text-text-slate">
							{getSpeedIndicator(methodInfo.speed)}
						</span>
					</div>
				</div>
				
				<!-- Action buttons -->
				<div class="mt-auto flex gap-premium-sm">
					{#if method.options && method.options.length > 0 && onConfigureMethod}
						<button 
							class="flex-1 rounded-premium-sm bg-white border border-brand-royal px-premium-md py-premium-sm text-premium-body font-medium text-brand-royal hover:bg-brand-whisper transition-all duration-premium"
							on:click|stopPropagation={() => configureMethodHandler(key)}
						>
							Configure
						</button>
					{/if}
					<button 
						class="flex-1 rounded-premium-sm bg-brand-gradient px-premium-md py-premium-sm text-premium-body font-medium text-white hover:bg-brand-deep transition-all duration-premium shadow-sm hover:shadow transform hover:scale-[0.98] active:scale-[0.96]"
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
		<div class="mt-premium-xl rounded-premium bg-brand-whisper p-premium-md shadow-premium">
			<div class="flex items-center justify-between">
				<div>
					<h4 class="text-premium-body font-semibold text-text-rich">Selected Methods ({$selectedMethods.length})</h4>
					<p class="text-premium-meta text-text-slate">
						{$selectedMethods.map(m => METHOD_INFO[m.toLowerCase()]?.name || m.toUpperCase()).join(', ')}
					</p>
				</div>
				<div class="flex gap-premium-sm">
					<button 
						class="rounded-premium-sm border border-border-platinum bg-white px-premium-md py-premium-sm text-premium-body font-medium text-text-slate hover:bg-brand-whisper transition-all duration-premium"
						on:click={clearSelection}
					>
						Clear
					</button>
					<button 
						class="rounded-premium-sm bg-brand-gradient px-premium-md py-premium-sm text-premium-body font-medium text-white hover:bg-brand-deep transition-all duration-premium shadow-sm hover:shadow transform hover:scale-[0.98] active:scale-[0.96]"
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
	<div class="mt-premium-xl rounded-premium border border-border-platinum bg-brand-whisper p-premium-md">
		<h4 class="text-premium-body font-semibold text-text-rich">Need help choosing?</h4>
		<p class="mb-premium-md text-premium-meta text-text-slate">
			Not sure which method to use? Here are some common scenarios:
		</p>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-premium-md text-premium-meta">
			<button 
				class="rounded-premium bg-white p-premium-sm text-left shadow-premium hover:bg-brand-whisper transition-all duration-premium"
				on:click={() => { 
					selectedCategory = "RECOMMENDED"; 
					showAllMethods = false; 
					searchQuery = "";
				}}
			>
				<span class="font-medium text-text-rich">Detection of selection at individual sites</span>
				<span class="block text-text-slate">Use FEL or MEME</span>
			</button>
			<button 
				class="rounded-premium bg-white p-premium-sm text-left shadow-premium hover:bg-brand-whisper transition-all duration-premium"
				on:click={() => { 
					showAllMethods = false; 
					searchQuery = "gard";
				}}
			>
				<span class="font-medium text-text-rich">Detection of recombination</span>
				<span class="block text-text-slate">Use GARD</span>
			</button>
			<button 
				class="rounded-premium bg-white p-premium-sm text-left shadow-premium hover:bg-brand-whisper transition-all duration-premium"
				on:click={() => { 
					showAllMethods = false; 
					searchQuery = "absrel";
				}}
			>
				<span class="font-medium text-text-rich">Detection of selection on specific branches</span>
				<span class="block text-text-slate">Use aBSREL</span>
			</button>
			<button 
				class="rounded-premium bg-white p-premium-sm text-left shadow-premium hover:bg-brand-whisper transition-all duration-premium"
				on:click={() => { 
					showAllMethods = false; 
					searchQuery = "busted";
				}}
			>
				<span class="font-medium text-text-rich">Gene-wide tests for selection</span>
				<span class="block text-text-slate">Use BUSTED</span>
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