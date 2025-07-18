/**
 * Specialized parser for HyPhy analysis output
 * Extracts structured information from the stdout of HyPhy analysis processes
 */

/**
 * Main parsing function that extracts structured data from raw HyPhy output
 * @param {string} output - The raw stdout from a HyPhy analysis process
 * @returns {Object} Structured data extracted from the output
 */
export function parseHyPhyOutput(output) {
	// Default result structure
	const result = {
		phase: detectPhase(output),
		progress: extractProgress(output),
		message: extractLatestMessage(output),
		errors: extractErrors(output),
		warnings: extractWarnings(output),
		parameters: extractParameters(output),
		results: extractResults(output),
		isComplete: isAnalysisComplete(output),
		hasFailed: hasAnalysisFailed(output)
	};

	return result;
}

/**
 * Detects the current phase of the analysis based on output patterns
 * @param {string} output - The raw stdout
 * @returns {string} The detected phase: 'initializing', 'mounting', 'running', 'processing', 'saving', 'completed', 'error'
 */
export function detectPhase(output) {
	const patterns = [
		{
			phase: 'initializing',
			regex: /Initializing|Setting up HyPhy|Loading analysis description|Parsing input/i
		},
		{
			phase: 'mounting',
			regex: /Reading (input|data) file|Processing input|Loading sequences|Loading trees/i
		},
		{
			phase: 'running',
			regex: /Running|Fitting|Optimizing|Evaluating|Analyzing|Computing|Iteration|Step/i
		},
		{
			phase: 'processing',
			regex:
				/Processing results|Generating output|Computing confidence intervals|Calculating p-values/i
		},
		{ phase: 'saving', regex: /Saving|Writing (to|results)|Finalizing|Rendering output/i },
		{ phase: 'completed', regex: /Analysis complete|Finished|Done|Completed successfully/i },
		{ phase: 'error', regex: /Error|Failed|Exception|Fatal/i }
	];

	// Check for phases in reverse order to prioritize later phases
	// This handles cases where early phase text still appears in the output
	for (let i = patterns.length - 1; i >= 0; i--) {
		const pattern = patterns[i];
		if (pattern.regex.test(output)) {
			return pattern.phase;
		}
	}

	// Default phase if no pattern matched
	return 'initializing';
}

/**
 * Extracts the current progress percentage from the output
 * @param {string} output - The raw stdout
 * @returns {number|null} Progress percentage (0-100) or null if not found
 */
export function extractProgress(output) {
	// Look for specific progress patterns
	const progressPatterns = [
		// Direct percentage pattern
		{ regex: /Progress:?\s*(\d+(?:\.\d+)?)%/i, transform: (match) => parseFloat(match[1]) },

		// Fraction pattern (e.g., "Step 3/10")
		{
			regex: /(?:Step|Iteration|Phase) (\d+)(?:\s+)?\/(?:\s+)?(\d+)/i,
			transform: (match) => {
				const current = parseInt(match[1], 10);
				const total = parseInt(match[2], 10);
				return total > 0 ? Math.round((current / total) * 100) : null;
			}
		},

		// Log likelihood pattern
		{
			regex: /Log L:\s*([-\d.]+)/i,
			transform: (match) => {
				// Convert log likelihood to a progress indicator
				// This is approximate and based on typical convergence patterns
				const logL = parseFloat(match[1]);
				if (isNaN(logL)) return null;

				// Log likelihood starts negative and approaches zero
				// Convert to a percentage based on typical ranges
				// This is very approximate
				if (logL < -1000) return 10;
				if (logL < -500) return 30;
				if (logL < -100) return 50;
				if (logL < -50) return 70;
				if (logL < -10) return 85;
				return 95; // Close to convergence
			}
		}
	];

	// Try each pattern in order
	for (const pattern of progressPatterns) {
		const match = output.match(pattern.regex);
		if (match) {
			const progress = pattern.transform(match);
			if (progress !== null) {
				return Math.min(Math.max(0, progress), 100); // Clamp to 0-100
			}
		}
	}

	// If we detect completion, return 100%
	if (isAnalysisComplete(output)) {
		return 100;
	}

	// If we detect an error, use progress from before the error
	if (hasAnalysisFailed(output)) {
		// Look for the last reported progress before the error
		const progressMatches = [...output.matchAll(/Progress:?\s*(\d+(?:\.\d+)?)%/gi)];
		if (progressMatches.length > 0) {
			const lastMatch = progressMatches[progressMatches.length - 1];
			return Math.min(Math.max(0, parseFloat(lastMatch[1])), 100);
		}
	}

	// Default progress based on phase if we can't detect it directly
	const phase = detectPhase(output);
	const phaseProgressMap = {
		initializing: 5,
		mounting: 15,
		running: 50,
		processing: 85,
		saving: 95,
		completed: 100,
		error: null
	};

	return phaseProgressMap[phase];
}

/**
 * Extracts the latest meaningful message from the output
 * @param {string} output - The raw stdout
 * @returns {string} The latest status message
 */
export function extractLatestMessage(output) {
	// Split by lines and reverse to find the latest meaningful message
	const lines = output.split('\n').filter((line) => line.trim().length > 0);

	// Skip lines that don't contain useful status information
	const skipPatterns = [
		/^\s*$/, // Empty lines
		/^[\d.]+$/, // Just numbers
		/^[<>+*-]+$/, // Just symbols
		/\[[\d:]+\]/, // Just timestamps
		/^\s*#/, // Comment lines
		/Log L:/i, // Log likelihood output
		/CPU time/i, // CPU time info
		/^\s*=/ // Divider lines
	];

	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i].trim();

		// Skip uninformative lines
		if (skipPatterns.some((pattern) => pattern.test(line))) {
			continue;
		}

		// Found a meaningful message
		return line;
	}

	// Default message
	return 'Processing analysis...';
}

/**
 * Extracts any error messages from the output
 * @param {string} output - The raw stdout
 * @returns {string[]} Array of error messages
 */
export function extractErrors(output) {
	const errors = [];
	const errorPatterns = [
		/Error:?\s*(.+)/i,
		/Exception:?\s*(.+)/i,
		/Fatal:?\s*(.+)/i,
		/Failed:?\s*(.+)/i
	];

	// Check each line for errors
	const lines = output.split('\n');
	for (const line of lines) {
		for (const pattern of errorPatterns) {
			const match = line.match(pattern);
			if (match && match[1]) {
				errors.push(match[1].trim());
			}
		}
	}

	return errors;
}

/**
 * Extracts any warning messages from the output
 * @param {string} output - The raw stdout
 * @returns {string[]} Array of warning messages
 */
export function extractWarnings(output) {
	const warnings = [];
	const warningPatterns = [/Warning:?\s*(.+)/i, /Caution:?\s*(.+)/i, /Note:?\s*(.+)/i];

	// Check each line for warnings
	const lines = output.split('\n');
	for (const line of lines) {
		for (const pattern of warningPatterns) {
			const match = line.match(pattern);
			if (match && match[1]) {
				warnings.push(match[1].trim());
			}
		}
	}

	return warnings;
}

/**
 * Extracts analysis parameters from the output
 * @param {string} output - The raw stdout
 * @returns {Object} Key-value pairs of parameters
 */
export function extractParameters(output) {
	const parameters = {};
	const parameterPatterns = [
		/([A-Za-z0-9\s_-]+):\s*([^,\n]+)/g,
		/Setting\s+([A-Za-z0-9\s_-]+)\s+to\s+([^,\n]+)/gi,
		/Using\s+([A-Za-z0-9\s_-]+):\s*([^,\n]+)/gi
	];

	// Extract parameters using each pattern
	for (const pattern of parameterPatterns) {
		const matches = [...output.matchAll(pattern)];
		for (const match of matches) {
			if (match[1] && match[2]) {
				const key = match[1].trim();
				const value = match[2].trim();
				parameters[key] = value;
			}
		}
	}

	return parameters;
}

/**
 * Extracts analysis results from the output if available
 * @param {string} output - The raw stdout
 * @returns {Object|null} Structured results or null if not available
 */
export function extractResults(output) {
	// Check if we have a JSON block in the output
	const jsonMatch = output.match(/```json\s*(\{[\s\S]+?\})\s*```/);
	if (jsonMatch && jsonMatch[1]) {
		try {
			return JSON.parse(jsonMatch[1]);
		} catch (e) {
			console.error('Failed to parse JSON results:', e);
		}
	}

	// Check for tabular results
	const results = {
		table: null,
		summary: null
	};

	// Look for table headers and rows
	const tableMatch = output.match(/(\|[-:]+\|[-:]+\|.*\|\n)(\|[^|]+\|[^|]+\|.*\|\n)+/);
	if (tableMatch) {
		results.table = tableMatch[0];
	}

	// Look for summary blocks
	const summaryMatch = output.match(/## Summary\s+([\s\S]+?)(?=##|$)/);
	if (summaryMatch && summaryMatch[1]) {
		results.summary = summaryMatch[1].trim();
	}

	return Object.keys(results).some((key) => results[key] !== null) ? results : null;
}

/**
 * Checks if the analysis has completed successfully
 * @param {string} output - The raw stdout
 * @returns {boolean} True if the analysis is complete
 */
export function isAnalysisComplete(output) {
	const completePatterns = [
		/Analysis complete/i,
		/Finished\s+successfully/i,
		/Done\s+processing/i,
		/Analysis has completed/i,
		/Results.*saved/i,
		/Total\s+execution\s+time/i
	];

	return completePatterns.some((pattern) => pattern.test(output));
}

/**
 * Checks if the analysis has failed
 * @param {string} output - The raw stdout
 * @returns {boolean} True if the analysis has failed
 */
export function hasAnalysisFailed(output) {
	const failurePatterns = [
		/Error:/i,
		/Exception:/i,
		/Fatal:/i,
		/Analysis\s+failed/i,
		/Execution\s+terminated/i,
		/Abnormal\s+termination/i
	];

	return failurePatterns.some((pattern) => pattern.test(output));
}

/**
 * Transforms HyPhy output into a structured set of log entries
 * @param {string} output - The raw stdout
 * @returns {Array} Array of log objects with time, status, message properties
 */
export function createStructuredLogs(output) {
	const logs = [];
	const now = new Date().toISOString();

	// Split output into logical chunks based on line breaks and meaningful units
	const lines = output.split('\n');
	let currentChunk = '';
	let currentStatus = 'running';

	// Process each line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// Detect if this line indicates a new phase or status
		const phaseChange = detectLinePhase(line);
		if (phaseChange) {
			// Save the previous chunk if it exists
			if (currentChunk) {
				logs.push({
					time: now,
					status: currentStatus,
					message: currentChunk.trim()
				});
			}

			// Start a new chunk with the detected phase
			currentStatus = phaseChange;
			currentChunk = line;
		} else {
			// Continue current chunk
			// Check if this line should be part of the same logical message
			if (shouldStartNewLogEntry(line, currentChunk)) {
				if (currentChunk) {
					logs.push({
						time: now,
						status: currentStatus,
						message: currentChunk.trim()
					});
				}
				currentChunk = line;
			} else {
				currentChunk += '\n' + line;
			}
		}
	}

	// Add the final chunk
	if (currentChunk) {
		logs.push({
			time: now,
			status: currentStatus,
			message: currentChunk.trim()
		});
	}

	return logs;
}

/**
 * Detects if a line indicates a phase change
 * @param {string} line - A single line of output
 * @returns {string|null} The phase name or null if not a phase change
 */
function detectLinePhase(line) {
	const phasePatterns = [
		{ phase: 'initializing', regex: /^Initializing|^Setting up|^Reading settings/i },
		{
			phase: 'mounting',
			regex: /^Reading (input|data)|^Loading sequences|^Processing input file/i
		},
		{ phase: 'running', regex: /^Running|^Fitting model|^Optimizing|^Evaluating|^Step \d+/i },
		{ phase: 'processing', regex: /^Processing results|^Generating output|^Computing confidence/i },
		{ phase: 'saving', regex: /^Saving|^Writing|^Output written/i },
		{ phase: 'completed', regex: /^Analysis complete|^Finished|^Done/i },
		{ phase: 'error', regex: /^Error|^Exception|^Fatal/i }
	];

	for (const pattern of phasePatterns) {
		if (pattern.regex.test(line)) {
			return pattern.phase;
		}
	}

	return null;
}

/**
 * Determines if a new line should start a new log entry
 * @param {string} newLine - The new line being processed
 * @param {string} currentChunk - The current accumulated chunk
 * @returns {boolean} True if should start a new entry
 */
function shouldStartNewLogEntry(newLine, currentChunk) {
	// Headers or section markers usually indicate a new logical section
	if (/^#{1,3}\s/.test(newLine)) return true;

	// Numbered steps usually indicate a new logical section
	if (/^Step \d+/.test(newLine)) return true;

	// Progress indicators usually indicate a new logical section
	if (/Progress:?\s*\d+%/.test(newLine)) return true;

	// Timestamp lines usually indicate a new logical section
	if (/^\[\d{2}:\d{2}:\d{2}\]/.test(newLine)) return true;

	// If line starts with a capital letter and current chunk has substantial content
	if (/^[A-Z]/.test(newLine) && currentChunk.length > 50) return true;

	// Line has a table header or separator
	if (/^\|[-:]+\|/.test(newLine)) return true;

	// Default - keep adding to current chunk
	return false;
}

/**
 * Extracts the most likely model name from HyPhy output
 * @param {string} output - The raw stdout
 * @returns {string|null} The model name or null if not found
 */
export function extractModelName(output) {
	const modelPatterns = [
		/Using model:\s*([A-Za-z0-9.+_-]+)/i,
		/Model:\s*([A-Za-z0-9.+_-]+)/i,
		/selected model:\s*([A-Za-z0-9.+_-]+)/i
	];

	for (const pattern of modelPatterns) {
		const match = output.match(pattern);
		if (match && match[1]) {
			return match[1].trim();
		}
	}

	return null;
}

/**
 * Creates Markdown-formatted log entry from raw HyPhy output
 * @param {string} output - The raw stdout chunk to format
 * @returns {string} Markdown-formatted log entry
 */
export function formatHyPhyOutputAsMarkdown(output) {
	let markdown = '';

	// Extract meaningful parts of the output
	const phase = detectPhase(output);
	const progress = extractProgress(output);
	const errors = extractErrors(output);
	const warnings = extractWarnings(output);
	const modelName = extractModelName(output);

	// Build a structured markdown output
	// Start with a header based on the phase
	if (phase === 'initializing') {
		markdown += '## Initializing Analysis\n\n';
	} else if (phase === 'mounting') {
		markdown += '## Preparing Input Data\n\n';
	} else if (phase === 'running') {
		markdown += '## Running Analysis\n\n';
	} else if (phase === 'processing') {
		markdown += '## Processing Results\n\n';
	} else if (phase === 'saving') {
		markdown += '## Saving Results\n\n';
	} else if (phase === 'completed') {
		markdown += '## Analysis Complete\n\n';
	} else if (phase === 'error') {
		markdown += '## Analysis Error\n\n';
	}

	// Add model information if available
	if (modelName) {
		markdown += `**Model:** ${modelName}\n\n`;
	}

	// Add progress information if available
	if (progress !== null) {
		markdown += `**Progress:** ${progress}%\n\n`;
	}

	// Add warnings if any
	if (warnings.length > 0) {
		markdown += '### Warnings\n\n';
		for (const warning of warnings) {
			markdown += `> ⚠️ ${warning}\n`;
		}
		markdown += '\n';
	}

	// Add errors if any
	if (errors.length > 0) {
		markdown += '### Errors\n\n';
		for (const error of errors) {
			markdown += `> ❌ ${error}\n`;
		}
		markdown += '\n';
	}

	// Add raw output in a code block if it contains important details
	if (output.includes('|') || output.includes('=')) {
		const codeBlock = output
			.split('\n')
			.filter((line) => line.trim().length > 0)
			.join('\n');

		markdown += '```\n' + codeBlock + '\n```\n';
	} else {
		// Otherwise just add the main message
		markdown += extractLatestMessage(output) + '\n';
	}

	return markdown.trim();
}

/**
 * Maps HyPhy output to our UI phase states
 * @param {string} output - The raw HyPhy output
 * @returns {Object} Object with UI state information
 */
export function mapToUIState(output) {
	const parsedData = parseHyPhyOutput(output);

	// Create markdown logs from the output
	const formattedLog = formatHyPhyOutputAsMarkdown(output);

	return {
		status: parsedData.phase,
		progress: parsedData.progress || 0,
		message: parsedData.message,
		logs: [
			{
				time: new Date().toISOString(),
				status: parsedData.phase,
				message: formattedLog
			}
		],
		errors: parsedData.errors,
		warnings: parsedData.warnings,
		isComplete: parsedData.isComplete,
		hasFailed: parsedData.hasFailed
	};
}

// Export a named object for components that import it as a named import
export const hyphyOutputParser = {
	parseHyPhyOutput,
	detectPhase,
	extractProgress,
	extractLatestMessage,
	extractErrors,
	extractWarnings,
	extractParameters,
	extractResults,
	isAnalysisComplete,
	hasAnalysisFailed,
	createStructuredLogs,
	formatHyPhyOutputAsMarkdown,
	mapToUIState
};

// Export as default for components that import it as a default import
export default hyphyOutputParser;
