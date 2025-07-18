<script>
	import { treeStore } from '../stores/tree';

	// Props
	export let onGenerateClick = () => {};

	// Reactive variables
	$: hasAnyTree = $treeStore && ($treeStore.nj || $treeStore.usertree);
</script>

{#if !hasAnyTree}
	<div
		class="mb-premium-lg rounded-premium border border-accent-copper bg-accent-pearl p-premium-md"
	>
		<div class="flex items-start">
			<div class="mr-premium-md flex-shrink-0">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-accent-copper"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>
			<div class="flex-1">
				<h3 class="mb-premium-xs text-premium-title font-semibold text-text-rich">
					Phylogenetic Tree Required
				</h3>
				<p class="mb-premium-sm text-premium-body text-text-slate">
					A phylogenetic tree is required for evolutionary analysis. Please generate a tree before
					proceeding.
				</p>
				<div class="mb-premium-sm">
					<div
						class="flex items-center rounded-premium-sm border border-amber-200 bg-amber-50 p-premium-xs text-premium-caption text-amber-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4 flex-shrink-0"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clip-rule="evenodd"
							/>
						</svg>
						<span>Note: Tree generation is currently simulated (development preview)</span>
					</div>
				</div>
				<button
					type="button"
					on:click={onGenerateClick}
					class="inline-flex transform items-center rounded-premium-sm bg-brand-gradient px-premium-md py-premium-sm text-premium-body font-medium text-white shadow-sm transition-all duration-premium hover:scale-[0.98] hover:bg-brand-deep hover:shadow active:scale-[0.96]"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-premium-xs h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
					Generate Tree Now
				</button>
			</div>
		</div>
	</div>
{/if}
