import '../app.css';
import AnalysisProgress from '../lib/AnalysisProgress.svelte';
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

// Story configuration for AnalysisProgress
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

// Template for AnalysisProgress
const Template = (args) => ({
	Component: AnalysisProgress,
	props: args
});

// Story variations
export const Running = (args) => {
	// Override the store with our mock for this story
	window.activeAnalysisProgress = createProgressStore(runningAnalysis);
	return Template.bind({})();
};
Running.storyName = 'Running';
Running.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for a running analysis, showing real-time updates.'
		}
	}
};

export const Processing = (args) => {
	window.activeAnalysisProgress = createProgressStore(processingAnalysis);
	return Template.bind({})();
};
Processing.storyName = 'Processing';
Processing.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for an analysis in the processing phase.'
		}
	}
};

export const Completed = (args) => {
	window.activeAnalysisProgress = createProgressStore(completedAnalysis);
	return Template.bind({})();
};
Completed.storyName = 'Completed';
Completed.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for a completed analysis, showing results summary.'
		}
	}
};

export const Error = (args) => {
	window.activeAnalysisProgress = createProgressStore(errorAnalysis);
	return Template.bind({})();
};
Error.storyName = 'Error';
Error.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for an analysis that encountered an error.'
		}
	}
};

