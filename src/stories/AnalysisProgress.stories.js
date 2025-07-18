import '../app.css';
import EnhancedAnalysisProgress from '../lib/EnhancedAnalysisProgress.svelte';
import AnalysisProgressRams from '../lib/AnalysisProgressRams.svelte';
import { writable } from 'svelte/store';

// Create a mock store for the progress component
const createProgressStore = (data) => {
	return {
		subscribe: writable(data).subscribe
	};
};

// Base mock analysis for different progress states
const baseMockAnalysis = {
	id: 'analysis-123',
	status: 'running',
	progress: 45,
	method: 'FEL',
	fileName: 'HIV1_env.fasta',
	message: 'Analyzing codon 45 of 120...',
	startTime: new Date(Date.now() - 45000).toISOString(), // 45 seconds ago
	logs: [
		{
			time: new Date(Date.now() - 45000).toISOString(),
			status: 'initializing',
			message: 'Initializing FEL analysis...'
		},
		{
			time: new Date(Date.now() - 35000).toISOString(),
			status: 'mounting',
			message: 'Loading sequence data from HIV1_env.fasta...'
		},
		{
			time: new Date(Date.now() - 25000).toISOString(),
			status: 'running',
			message: 'Fitting nucleotide substitution model...'
		},
		{
			time: new Date(Date.now() - 15000).toISOString(),
			status: 'running',
			message: 'Analyzing codon 20 of 120...'
		},
		{
			time: new Date(Date.now() - 5000).toISOString(),
			status: 'running',
			message: 'Analyzing codon 45 of 120...'
		}
	]
};

// Create variations of the mock analysis for different states
const runningAnalysis = { ...baseMockAnalysis };

const processingAnalysis = {
	...baseMockAnalysis,
	status: 'processing',
	progress: 75,
	message: 'Processing results...',
	logs: [
		...baseMockAnalysis.logs,
		{
			time: new Date().toISOString(),
			status: 'processing',
			message: 'Processing results...'
		}
	]
};

const completedAnalysis = {
	...baseMockAnalysis,
	status: 'completed',
	progress: 100,
	message: 'Analysis completed successfully. Found 5 sites under selection.',
	completedAt: new Date().toISOString(),
	logs: [
		...baseMockAnalysis.logs,
		{
			time: new Date(Date.now() - 3000).toISOString(),
			status: 'processing',
			message: 'Processing results...'
		},
		{
			time: new Date().toISOString(),
			status: 'completed',
			message: 'Analysis completed successfully. Found 5 sites under selection.'
		}
	]
};

const errorAnalysis = {
	...baseMockAnalysis,
	status: 'error',
	progress: 60,
	message: 'Error: Failed to converge. Check input sequences for issues.',
	logs: [
		...baseMockAnalysis.logs,
		{
			time: new Date().toISOString(),
			status: 'error',
			message: 'Error: Failed to converge. Check input sequences for issues.'
		}
	]
};

// Story configuration for EnhancedAnalysisProgress
export default {
	title: 'Analysis/Progress Indicators',
	parameters: {
		docs: {
			description: {
				component: `
          ## Analysis Progress Indicators
          
          Displays the progress of running analyses with live updates, based on Dieter Rams design principles.
          Features include:
          - Clear status indicators
          - Progress visualization
          - Expandable logs
          - Elapsed time tracking
        `
			}
		}
	}
};

// Template for EnhancedAnalysisProgress
const EnhancedTemplate = (args) => ({
	Component: EnhancedAnalysisProgress,
	props: args
});

// Template for AnalysisProgressRams
const RamsTemplate = (args) => ({
	Component: AnalysisProgressRams,
	props: args
});

// Story variations for EnhancedAnalysisProgress
export const EnhancedRunning = (args) => {
	// Override the store with our mock for this story
	window.activeAnalysisProgress = createProgressStore(runningAnalysis);
	return EnhancedTemplate.bind({})();
};
EnhancedRunning.storyName = 'Enhanced - Running';
EnhancedRunning.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for a running analysis, showing real-time updates.'
		}
	}
};

export const EnhancedProcessing = (args) => {
	window.activeAnalysisProgress = createProgressStore(processingAnalysis);
	return EnhancedTemplate.bind({})();
};
EnhancedProcessing.storyName = 'Enhanced - Processing';
EnhancedProcessing.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for an analysis in the processing phase.'
		}
	}
};

export const EnhancedCompleted = (args) => {
	window.activeAnalysisProgress = createProgressStore(completedAnalysis);
	return EnhancedTemplate.bind({})();
};
EnhancedCompleted.storyName = 'Enhanced - Completed';
EnhancedCompleted.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for a completed analysis, showing results summary.'
		}
	}
};

export const EnhancedError = (args) => {
	window.activeAnalysisProgress = createProgressStore(errorAnalysis);
	return EnhancedTemplate.bind({})();
};
EnhancedError.storyName = 'Enhanced - Error';
EnhancedError.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for an analysis that encountered an error.'
		}
	}
};

// Story variations for AnalysisProgressRams
export const RamsRunning = (args) => {
	window.activeAnalysisProgress = createProgressStore(runningAnalysis);
	return RamsTemplate.bind({})();
};
RamsRunning.storyName = 'Rams - Running';
RamsRunning.parameters = {
	docs: {
		description: {
			story: 'Dieter Rams-inspired progress indicator for a running analysis.'
		}
	}
};

export const RamsProcessing = (args) => {
	window.activeAnalysisProgress = createProgressStore(processingAnalysis);
	return RamsTemplate.bind({})();
};
RamsProcessing.storyName = 'Rams - Processing';
RamsProcessing.parameters = {
	docs: {
		description: {
			story: 'Dieter Rams-inspired progress indicator for an analysis in the processing phase.'
		}
	}
};

export const RamsCompleted = (args) => {
	window.activeAnalysisProgress = createProgressStore(completedAnalysis);
	return RamsTemplate.bind({})();
};
RamsCompleted.storyName = 'Rams - Completed';
RamsCompleted.parameters = {
	docs: {
		description: {
			story: 'Dieter Rams-inspired progress indicator for a completed analysis.'
		}
	}
};

export const RamsError = (args) => {
	window.activeAnalysisProgress = createProgressStore(errorAnalysis);
	return RamsTemplate.bind({})();
};
RamsError.storyName = 'Rams - Error';
RamsError.parameters = {
	docs: {
		description: {
			story: 'Dieter Rams-inspired progress indicator for an analysis that encountered an error.'
		}
	}
};
