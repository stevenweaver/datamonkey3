<!-- AnalysisProgressWrapper.svelte - Wrapper for AnalysisProgress with mocked stores -->
<script>
	import { writable } from 'svelte/store';
	import { onDestroy, tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { marked } from 'marked';

	export let analysisId = null;
	export let mockActiveAnalysisProgress = null;
	export let mockAnalysisStore = null;

	// Create default mocks if not provided
	const defaultActiveAnalysisProgress = writable({
		id: null,
		status: null,
		progress: 0,
		message: '',
		logs: [],
		metadata: null
	});

	const defaultAnalysisStore = writable({
		analyses: [],
		currentAnalysisId: null,
		isLoading: false,
		error: null
	});

	// Use provided mocks or defaults - simulate the real stores
	const activeAnalysisProgress = mockActiveAnalysisProgress || defaultActiveAnalysisProgress;
	const analysisStore = mockAnalysisStore || defaultAnalysisStore;

	// Determine which progress to show - specific analysis or global active
	$: progressToShow = analysisId
		? getAnalysisProgress(analysisId, $analysisStore)
		: $activeAnalysisProgress;

	// Function to get progress for a specific analysis
	function getAnalysisProgress(id, store) {
		if (!id || !store?.analyses)
			return { id: null, status: null, progress: 0, message: '', logs: [] };

		const analysis = store.analyses.find((a) => a.id === id);
		if (!analysis) return { id: null, status: null, progress: 0, message: '', logs: [] };

		// For completed/error analyses, show static info
		if (analysis.status === 'completed' || analysis.status === 'error') {
			return {
				id: analysis.id,
				status: analysis.status,
				progress: analysis.status === 'completed' ? 100 : 0,
				message:
					analysis.status === 'completed' ? 'Analysis completed successfully' : 'Analysis failed',
				logs: [],
				metadata: {
					method: analysis.method,
					filename: analysis.fileId,
					startTime: new Date(analysis.createdAt).toISOString()
				}
			};
		}

		// For running analyses, use activeAnalysisProgress if it matches
		if ($activeAnalysisProgress.id === id) {
			return $activeAnalysisProgress;
		}

		// For pending analyses
		return {
			id: analysis.id,
			status: analysis.status,
			progress: 0,
			message: 'Analysis pending',
			logs: [],
			metadata: {
				method: analysis.method,
				filename: analysis.fileId,
				startTime: new Date(analysis.createdAt).toISOString()
			}
		};
	}

	// Configure marked for security and custom rendering
	marked.setOptions({
		gfm: true,
		breaks: true,
		headerIds: false,
		mangle: false
	});

	// Duration for which to show the completed message before hiding
	export let completedMessageDuration = 5000;

	// Auto-hide completed progress after a delay
	let showCompleted = false;
	let hideCompletedTimeout;

	// Progressive disclosure state
	let showLogs = true;

	// Estimated time tracking
	let elapsed = 0;
	let estimatedTimeRemaining = null;
	let timerInterval;

	// Calculate elapsed time based on actual analysis start time
	function calculateElapsed(progressData) {
		if (!progressData.id) return 0;

		let analysisStartTime = null;

		if (progressData.metadata?.startTime) {
			analysisStartTime = new Date(progressData.metadata.startTime);
		} else if (analysisId && $analysisStore.analyses) {
			const analysis = $analysisStore.analyses.find((a) => a.id === analysisId);
			if (analysis?.createdAt) {
				analysisStartTime = new Date(analysis.createdAt);
			}
		}

		if (!analysisStartTime) return 0;

		const now = new Date();
		return (now - analysisStartTime) / 1000;
	}

	// When progress changes, update timer
	$: if (progressToShow.id) {
		if (timerInterval) clearInterval(timerInterval);

		if (!['completed', 'error'].includes(progressToShow.status)) {
			elapsed = calculateElapsed(progressToShow);

			timerInterval = setInterval(() => {
				elapsed = calculateElapsed(progressToShow);
				estimatedTimeRemaining = null;
			}, 1000);
		} else {
			elapsed = calculateElapsed(progressToShow);
		}
	} else {
		clearInterval(timerInterval);
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
		previousStatus = progressToShow.status;
	}

	$: if (progressToShow.status === 'completed' || progressToShow.status === 'error') {
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

	// Sample logs for demo purposes
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
		}
	];

	// Get the last few logs, use sample logs for demo if none available
	$: displayedLogs =
		progressToShow.logs && progressToShow.logs.length > 0
			? progressToShow.logs.slice(-5)
			: sampleLogs;

	// Provide a job info accessor
	$: jobInfo =
		progressToShow && progressToShow.id
			? {
					id: progressToShow.id,
					method: progressToShow.metadata?.method || 'Analysis',
					filename: progressToShow.metadata?.filename || 'data file',
					startTime: progressToShow.metadata?.startTime || new Date().toISOString()
				}
			: null;

	// Get simplified status for display
	$: statusText =
		progressToShow.status === 'running'
			? 'Analysis in progress'
			: progressToShow.status === 'completed'
				? 'Analysis complete'
				: progressToShow.status === 'error'
					? 'Analysis failed'
					: 'Processing';

	// Process log message to extract structured information
	function parseLogMessage(message) {
		const hasCodeBlock = message.includes('```');
		const hasHeader = /^#+\s/.test(message);
		const hasList = /^[\s]*[*-]\s/.test(message);
		const hasFormatting =
			message.includes('**') ||
			message.includes('__') ||
			message.includes('*') ||
			message.includes('_') ||
			(message.includes('[') && message.includes(']('));

		const hasKeyValue = /:\s/.test(message);
		const hasNumbers = /\d+(\.\d+)?/.test(message);
		const hasPath = /\/\w+/.test(message);

		const isMarkdown =
			hasCodeBlock || hasHeader || hasList || hasFormatting || hasKeyValue || hasNumbers || hasPath;

		let enhancedMessage = message;

		if (isMarkdown && !hasCodeBlock && !hasHeader && !hasList && !hasFormatting) {
			enhancedMessage = enhancedMessage.replace(/(\w+):\s+([^,\n]+)(?=[,\n]|$)/g, '**$1**: $2');
			enhancedMessage = enhancedMessage.replace(/\b(\d+(\.\d+)?)\b(?!\s*:)/g, '`$1`');
			enhancedMessage = enhancedMessage.replace(/(\S+\/\S+)/g, '`$1`');
		}

		return {
			isMarkdown: true,
			html: marked.parse(enhancedMessage),
			plainText: message
		};
	}
</script>

{#if progressToShow.id && (progressToShow.status !== 'completed' || showCompleted)}
	<div
		class="analysis-progress mt-6 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
	>
		<!-- Essential information - always visible -->
		<div class="p-5">
			<!-- Status and time information in single row -->
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center">
					<span class={`mr-2 text-lg font-medium ${getStatusColorClass(progressToShow.status)}`}>
						{statusText}
					</span>
				</div>

				<div class="flex items-center text-sm text-gray-600">
					<span>
						{formatTime(elapsed)}
					</span>
				</div>
			</div>

			<!-- Progress indicator -->
			<div class="my-4 flex items-center">
				{#if progressToShow.status === 'completed'}
					<!-- Completed progress bar -->
					<div class="relative mr-3 h-2 flex-grow overflow-hidden rounded-full bg-gray-100">
						<div class="absolute left-0 top-0 h-full w-full rounded-full bg-green-500"></div>
					</div>
					<span class="w-12 text-right text-sm font-medium text-green-600">Done</span>
				{:else if progressToShow.status === 'error'}
					<!-- Error progress bar -->
					<div class="relative mr-3 h-2 flex-grow overflow-hidden rounded-full bg-gray-100">
						<div class="absolute left-0 top-0 h-full w-1/5 rounded-full bg-red-500"></div>
					</div>
					<span class="w-12 text-right text-sm font-medium text-red-600">Error</span>
				{:else}
					<!-- Running progress animation -->
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

			<!-- Job details and latest output -->
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
				{#if progressToShow.message}
					{@const parsedMessage = parseLogMessage(progressToShow.message)}
					<div class="message-preview text-sm text-gray-600">
						{#if parsedMessage.isMarkdown}
							<div class="markdown-content">
								{@html parsedMessage.html}
							</div>
						{:else}
							{progressToShow.message}
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

		<!-- Log output (collapsible) -->
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

					{#if progressToShow.logs.length === 0}
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

	/* Markdown content styling */
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

	:global(.markdown-content > :first-child) {
		margin-top: 0;
	}

	:global(.markdown-content > :last-child) {
		margin-bottom: 0;
	}
</style>
