<!-- src/lib/EnhancedAnalysisProgress.svelte -->
<script>
	import { activeAnalysisProgress } from '../stores/analyses';
	import { onDestroy, tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { marked } from 'marked';

	// Configure marked for security and custom rendering
	marked.setOptions({
		gfm: true, // GitHub Flavored Markdown
		breaks: true, // Convert \n to <br>
		headerIds: false, // Don't add IDs to headers (for security)
		mangle: false // Don't mangle email links
	});

	// Duration for which to show the completed message before hiding
	export let completedMessageDuration = 5000; // 5 seconds

	// Auto-hide completed progress after a delay
	let showCompleted = false;
	let hideCompletedTimeout;

	// Progressive disclosure state
	let showLogs = true; // Default to showing logs

	// Estimated time tracking
	let startTime = null;
	let elapsed = 0;
	let estimatedTimeRemaining = null;
	let timerInterval;

	// When active analysis progress changes, update timer
	$: if ($activeAnalysisProgress.id) {
		// If we have a new analysis or state changed to running, start/reset the timer
		if (
			!startTime ||
			($activeAnalysisProgress.status === 'running' &&
				['initializing', 'mounting'].includes(previousStatus))
		) {
			startTime = new Date();
			elapsed = 0;

			// Clear any existing interval
			if (timerInterval) clearInterval(timerInterval);

			// Start a new timer interval
			timerInterval = setInterval(() => {
				elapsed = (new Date() - startTime) / 1000; // elapsed time in seconds

				// We don't have reliable progress information, so we'll display the time
				// but not attempt to estimate remaining time as that would be dishonest
				estimatedTimeRemaining = null;
			}, 1000);
		}

		// If analysis is completed or errored, clear the interval
		if (['completed', 'error'].includes($activeAnalysisProgress.status)) {
			clearInterval(timerInterval);
		}
	} else {
		// If no active analysis, clear the timer
		clearInterval(timerInterval);
		startTime = null;
		elapsed = 0;
		estimatedTimeRemaining = null;
	}

	// Format time for display (converts seconds to mm:ss)
	function formatTime(seconds) {
		if (!seconds && seconds !== 0) return '--:--';

		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	// Track previous status to detect changes
	let previousStatus = null;
	$: {
		previousStatus = $activeAnalysisProgress.status;
	}

	$: if (
		$activeAnalysisProgress.status === 'completed' ||
		$activeAnalysisProgress.status === 'error'
	) {
		showCompleted = true;
		clearTimeout(hideCompletedTimeout);
		hideCompletedTimeout = setTimeout(() => {
			showCompleted = false;
		}, completedMessageDuration);
	}

	// Clean up timeout and interval on component destruction
	onDestroy(() => {
		clearTimeout(hideCompletedTimeout);
		clearInterval(timerInterval);
	});

	// Get appropriate text color class based on status
	function getStatusColorClass(status) {
		switch (status) {
			case 'completed':
				return 'text-green-600';
			case 'error':
				return 'text-red-600';
			case 'running':
			case 'processing':
				return 'text-blue-600';
			default:
				return 'text-gray-700';
		}
	}

	// Format timestamp for display
	function formatTimestamp(isoString) {
		try {
			const date = new Date(isoString);
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		} catch (e) {
			return '';
		}
	}

	// Sample logs for demo purposes (these will only be used if no real logs exist)
	const sampleLogs = [
		{
			message:
				'## Loading Input Data\nReading sequence alignment from file. **Summary:** - Format: FASTA - Sequences: 14 - Sites: 1380',
			status: 'running',
			time: new Date().toISOString()
		},
		{
			message: 'Sequence data loaded successfully.\nAlignment has 14 sequences and 1380 sites',
			status: 'running',
			time: new Date().toISOString()
		},
		{
			message:
				'## Running Analysis\nMethod: FEL (Fixed Effects Likelihood)\nFitting nucleotide substitution model...',
			status: 'running',
			time: new Date().toISOString()
		},
		{
			message: 'Model parameters: alpha = 0.402, beta = 1.27\nLikelihood: -6245.3',
			status: 'running',
			time: new Date().toISOString()
		}
	];

	// Get the last few logs, use sample logs for demo if none available
	$: displayedLogs =
		$activeAnalysisProgress.logs && $activeAnalysisProgress.logs.length > 0
			? $activeAnalysisProgress.logs.slice(-5)
			: sampleLogs;

	// Provide a job info accessor
	$: jobInfo =
		$activeAnalysisProgress && $activeAnalysisProgress.id
			? {
					id: $activeAnalysisProgress.id,
					method: $activeAnalysisProgress.metadata?.method || 'Analysis',
					filename: $activeAnalysisProgress.metadata?.filename || 'data file',
					startTime: $activeAnalysisProgress.metadata?.startTime || new Date().toISOString()
				}
			: null;

	// Get simplified status for display
	$: statusText =
		$activeAnalysisProgress.status === 'running'
			? 'Analysis in progress'
			: $activeAnalysisProgress.status === 'completed'
				? 'Analysis complete'
				: $activeAnalysisProgress.status === 'error'
					? 'Analysis failed'
					: 'Processing';

	// Process log message to extract structured information
	function parseLogMessage(message) {
		// Always treat messages as potential Markdown to benefit from formatting
		// For the output preview, this creates a more consistent look

		// Check if message contains markdown formatting
		const hasCodeBlock = message.includes('```');
		const hasHeader = /^#+\s/.test(message);
		const hasList = /^[\s]*[*-]\s/.test(message);
		const hasFormatting =
			message.includes('**') ||
			message.includes('__') ||
			message.includes('*') ||
			message.includes('_') ||
			(message.includes('[') && message.includes(']('));

		// Common patterns in analysis output that should be enhanced
		const hasKeyValue = /:\s/.test(message); // Key: Value patterns
		const hasNumbers = /\d+(\.\d+)?/.test(message); // Numerical values
		const hasPath = /\/\w+/.test(message); // File paths

		// If message has markdown-compatible content or can benefit from formatting,
		// process it with marked
		const isMarkdown =
			hasCodeBlock || hasHeader || hasList || hasFormatting || hasKeyValue || hasNumbers || hasPath;

		// For honest representation, enhance the content formatting when beneficial
		let enhancedMessage = message;

		// If it's not already Markdown but could benefit from formatting,
		// apply some light enhancements
		if (isMarkdown && !hasCodeBlock && !hasHeader && !hasList && !hasFormatting) {
			// Enhance key-value pairs
			enhancedMessage = enhancedMessage.replace(/(\w+):\s+([^,\n]+)(?=[,\n]|$)/g, '**$1**: $2');

			// Highlight numerical values
			enhancedMessage = enhancedMessage.replace(/\b(\d+(\.\d+)?)\b(?!\s*:)/g, '`$1`');

			// Highlight file paths
			enhancedMessage = enhancedMessage.replace(/(\S+\/\S+)/g, '`$1`');
		}

		return {
			isMarkdown: true, // Always use Markdown processing for consistent formatting
			html: marked.parse(enhancedMessage),
			plainText: message
		};
	}

	// We're not trying to extract phases or progress percentages from logs
	// as these would be unreliable and potentially dishonest
</script>

{#if $activeAnalysisProgress.id && ($activeAnalysisProgress.status !== 'completed' || showCompleted)}
	<div
		class="analysis-progress mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
	>
		<!-- Essential information - always visible -->
		<div class="p-5">
			<!-- Status and time information in single row -->
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center">
					<span
						class={`mr-2 text-lg font-medium ${getStatusColorClass($activeAnalysisProgress.status)}`}
					>
						{statusText}
					</span>
				</div>

				<div class="flex items-center text-sm text-gray-600">
					<span>
						{formatTime(elapsed)}
					</span>
				</div>
			</div>

			<!-- Progress indicator - uses an animation rather than a dishonest percentage -->
			<div class="my-4 flex items-center">
				{#if $activeAnalysisProgress.status === 'completed'}
					<!-- Completed progress bar -->
					<div class="relative mr-3 h-2 flex-grow overflow-hidden rounded-full bg-gray-100">
						<div class="absolute left-0 top-0 h-full w-full rounded-full bg-green-500"></div>
					</div>
					<span class="w-12 text-right text-sm font-medium text-green-600">Done</span>
				{:else if $activeAnalysisProgress.status === 'error'}
					<!-- Error progress bar -->
					<div class="relative mr-3 h-2 flex-grow overflow-hidden rounded-full bg-gray-100">
						<div class="absolute left-0 top-0 h-full w-1/5 rounded-full bg-red-500"></div>
					</div>
					<span class="w-12 text-right text-sm font-medium text-red-600">Error</span>
				{:else}
					<!-- Running progress animation - indeterminate to avoid dishonest percentages -->
					<div class="relative mr-3 h-2 flex-grow overflow-hidden rounded-full bg-gray-100">
						<div
							class="progress-pulse absolute left-0 top-0 h-full w-1/3 rounded-full bg-blue-500"
						></div>
					</div>
					<span
						class="flex w-12 items-center justify-end text-right text-sm font-medium text-blue-600"
					>
						<span class="pulse-animation mr-1 h-2 w-2 rounded-full bg-blue-500"></span>
					</span>
				{/if}
			</div>

			<!-- Job details and latest output with Markdown formatting -->
			<div class="mb-3 mt-2">
				<!-- Job identifier details -->
				{#if jobInfo}
					<div class="mb-2 flex items-center text-xs text-gray-500">
						<span class="font-mono">{jobInfo.id.substring(0, 8)}</span>
						{#if jobInfo.method}
							<span class="mx-1">•</span>
							<span class="font-semibold">{jobInfo.method}</span>
						{/if}
						{#if jobInfo.filename}
							<span class="mx-1">•</span>
							<span class="max-w-xs truncate">{jobInfo.filename}</span>
						{/if}
					</div>
				{/if}

				<!-- Latest output with Markdown formatting -->
				{#if $activeAnalysisProgress.message}
					{@const parsedMessage = parseLogMessage($activeAnalysisProgress.message)}
					<div class="message-preview text-sm text-gray-600">
						{#if parsedMessage.isMarkdown}
							<div class="markdown-content">
								{@html parsedMessage.html}
							</div>
						{:else}
							{$activeAnalysisProgress.message}
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Toggle button for additional information -->
		<div class="flex border-t border-gray-100 bg-gray-50 text-sm">
			<button
				class="flex-1 py-2 text-center transition-colors hover:bg-gray-100"
				class:text-blue-600={showLogs}
				class:font-medium={showLogs}
				on:click={() => (showLogs = !showLogs)}
			>
				{showLogs ? 'Hide' : 'Show'} Details
			</button>
		</div>

		<!-- Log output with Markdown support (collapsible) -->
		{#if showLogs}
			<div
				transition:slide={{ duration: 200, easing: quintOut }}
				class="border-t border-gray-100 bg-gray-50 p-4"
			>
				<div class="rounded border border-gray-200 bg-white p-2">
					{#each displayedLogs as log}
						{@const parsedLog = parseLogMessage(log.message)}
						<div class="mb-4 border-b border-gray-100 pb-3 last:mb-0 last:border-0 last:pb-0">
							<div class={`${getStatusColorClass(log.status)} markdown-content`}>
								{@html parsedLog.html}
							</div>
						</div>
					{/each}

					{#if $activeAnalysisProgress.logs.length === 0}
						<p class="text-center text-gray-500">No logs available</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.analysis-progress {
		transition: all 0.2s ease-in-out;
	}

	/* Animation for indeterminate progress */
	.progress-pulse {
		animation: progress-pulse 2s ease-in-out infinite;
		transform-origin: 0% 50%;
	}

	@keyframes progress-pulse {
		0% {
			transform: translateX(-100%);
		}
		50% {
			transform: translateX(100%);
		}
		100% {
			transform: translateX(300%);
		}
	}

	/* Animation for the pulsing indicator */
	.pulse-animation {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.05);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Message preview styling */
	.message-preview {
		max-height: 4.5em;
		overflow: hidden;
		position: relative;
		line-height: 1.5;
	}

	.message-preview::after {
		content: '';
		position: absolute;
		bottom: 0;
		right: 0;
		left: 0;
		height: 1.5em;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
		pointer-events: none;
	}

	/* Specific styles for markdown content in the preview */
	.message-preview .markdown-content {
		font-size: 0.85rem;
	}

	.message-preview .markdown-content h1,
	.message-preview .markdown-content h2,
	.message-preview .markdown-content h3 {
		font-size: 0.9rem;
		margin: 0.2rem 0;
		display: inline-block;
		margin-right: 0.5rem;
	}

	.message-preview .markdown-content p {
		margin: 0.1rem 0;
		display: inline;
	}

	.message-preview .markdown-content code {
		font-size: 0.8rem;
		padding: 0.05rem 0.15rem;
	}

	.message-preview .markdown-content ul,
	.message-preview .markdown-content ol {
		margin: 0.2rem 0;
		padding-left: 1.2rem;
	}

	/* Markdown content styling for coherent document flow */
	:global(.markdown-content) {
		font-size: 0.9rem;
		line-height: 1.5;
	}

	:global(.markdown-content h1) {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0.75rem 0 0.5rem;
		color: #333;
	}

	:global(.markdown-content h2) {
		font-size: 1rem;
		font-weight: 600;
		margin: 0.6rem 0 0.4rem;
		color: #444;
	}

	:global(.markdown-content h3) {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0.5rem 0 0.3rem;
		color: #555;
	}

	:global(.markdown-content p) {
		margin: 0.4rem 0;
		color: inherit;
	}

	:global(.markdown-content ul, .markdown-content ol) {
		margin: 0.4rem 0;
		padding-left: 1.5rem;
	}

	:global(.markdown-content li) {
		margin: 0.2rem 0;
	}

	:global(.markdown-content code) {
		background-color: #f0f0f0;
		padding: 0.1rem 0.2rem;
		border-radius: 3px;
		font-family: monospace;
		font-size: 0.85rem;
	}

	:global(.markdown-content pre) {
		background-color: #f5f5f5;
		padding: 0.5rem;
		border-radius: 4px;
		overflow-x: auto;
		margin: 0.4rem 0;
	}

	:global(.markdown-content pre code) {
		background-color: transparent;
		padding: 0;
		line-height: 1.4;
		display: block;
		white-space: pre;
	}

	:global(.markdown-content a) {
		color: #3b82f6;
		text-decoration: none;
	}

	:global(.markdown-content a:hover) {
		text-decoration: underline;
	}

	:global(.markdown-content blockquote) {
		border-left: 3px solid #e5e7eb;
		padding-left: 0.75rem;
		color: #6b7280;
		margin: 0.4rem 0;
		font-style: italic;
	}

	/* Ensure adjacent markdown elements flow naturally */
	:global(.markdown-content > :first-child) {
		margin-top: 0;
	}

	:global(.markdown-content > :last-child) {
		margin-bottom: 0;
	}
</style>
