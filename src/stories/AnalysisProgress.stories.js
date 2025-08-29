import '../app.css';
// Import AnalysisProgressWrapper instead of the direct component
import AnalysisProgressWrapper from './AnalysisProgressWrapper.svelte';
import { writable } from 'svelte/store';

// Base mock analysis for different progress states
const baseMockAnalysis = {
	id: 'analysis-123',
	status: 'running',
	progress: 45,
	method: 'FEL',
	fileName: 'HIV1_env.fasta',
	message:
		'## Running Analysis\nMethod: FEL (Fixed Effects Likelihood)\nAnalyzing codon 45 of 120...',
	metadata: {
		method: 'FEL',
		filename: 'HIV1_env.fasta',
		startTime: new Date(Date.now() - 45000).toISOString()
	},
	logs: [
		{
			time: new Date(Date.now() - 45000).toISOString(),
			status: 'initializing',
			message:
				'## Initializing Analysis\nMethod: **FEL** (Fixed Effects Likelihood)\nPreparing analysis environment...'
		},
		{
			time: new Date(Date.now() - 35000).toISOString(),
			status: 'running',
			message:
				'## Loading Input Data\nReading sequence alignment from file.\n**Summary:**\n- Format: FASTA\n- Sequences: 25\n- Sites: 450'
		},
		{
			time: new Date(Date.now() - 25000).toISOString(),
			status: 'running',
			message: 'Fitting nucleotide substitution model...\nModel parameters: **GTR+G4**'
		},
		{
			time: new Date(Date.now() - 15000).toISOString(),
			status: 'running',
			message: '### Site-by-site analysis\nAnalyzing codon `20` of `120`\nLikelihood: `-6245.3`'
		},
		{
			time: new Date(Date.now() - 5000).toISOString(),
			status: 'running',
			message: '### Site-by-site analysis\nAnalyzing codon `45` of `120`\nLikelihood: `-6189.7`'
		}
	]
};

// Create variations of the mock analysis for different states
const runningAnalysis = { ...baseMockAnalysis };

const processingAnalysis = {
	...baseMockAnalysis,
	status: 'processing',
	progress: 75,
	message: '## Processing Results\nGenerating output files and visualizations...',
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
	message:
		'## Analysis Complete\n**Found 5 sites under positive selection**\n- Site 42: p = 0.023\n- Site 67: p = 0.011\n- Site 89: p = 0.045\n- Site 102: p = 0.008\n- Site 134: p = 0.031',
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
	message:
		'## Analysis Failed\n**Error:** Failed to converge during optimization\n\nPossible causes:\n- Sequences may be too divergent\n- Insufficient variation in the data\n- Numerical instability in likelihood calculations',
	logs: [
		...baseMockAnalysis.logs,
		{
			time: new Date().toISOString(),
			status: 'error',
			message: 'Error: Failed to converge. Check input sequences for issues.'
		}
	]
};

// Mock analysis in store format
const mockAnalysisInStore = {
	id: 'analysis-123',
	fileId: 'file-456',
	method: 'FEL',
	status: 'running',
	createdAt: new Date(Date.now() - 45000).toISOString(),
	results: null
};

// Story configuration for AnalysisProgress
export default {
	title: 'Progress Indicators/AnalysisProgress',
	component: AnalysisProgressWrapper,
	parameters: {
		docs: {
			description: {
				component: `
          ## Analysis Progress Component
          
          Displays the progress of running analyses with live updates, based on Dieter Rams design principles.
          
          Features:
          - **Indeterminate progress bar**: Shows activity without misleading percentages
          - **Markdown-formatted logs**: Rich formatting for analysis output
          - **Expandable details**: Progressive disclosure of log information
          - **Elapsed time tracking**: Shows how long the analysis has been running
          - **Status indicators**: Clear visual feedback for running, completed, and error states
          
          The component avoids showing dishonest progress percentages and instead uses an animated indicator for running analyses.
        `
			}
		}
	}
};

// Template for AnalysisProgress - simplified
const Template = (args) => ({
	Component: AnalysisProgressWrapper,
	props: args
});

// Story variations with inline mocks
export const Running = () => {
	const mockActiveAnalysisProgress = writable(runningAnalysis);
	const mockAnalysisStore = writable({ analyses: [mockAnalysisInStore] });

	return {
		Component: AnalysisProgressWrapper,
		props: {
			analysisId: 'analysis-123',
			mockActiveAnalysisProgress,
			mockAnalysisStore
		}
	};
};
Running.storyName = 'Running';
Running.parameters = {
	docs: {
		description: {
			story:
				'Progress indicator for a running analysis, showing real-time updates with an indeterminate progress animation.'
		}
	}
};

export const Processing = () => {
	const mockActiveAnalysisProgress = writable(processingAnalysis);
	const mockAnalysisStore = writable({
		analyses: [{ ...mockAnalysisInStore, status: 'processing' }]
	});

	return {
		Component: AnalysisProgressWrapper,
		props: {
			analysisId: 'analysis-123',
			mockActiveAnalysisProgress,
			mockAnalysisStore
		}
	};
};
Processing.storyName = 'Processing';
Processing.parameters = {
	docs: {
		description: {
			story: 'Progress indicator for an analysis in the processing phase, generating final outputs.'
		}
	}
};

export const Completed = () => {
	const mockActiveAnalysisProgress = writable(completedAnalysis);
	const mockAnalysisStore = writable({
		analyses: [{ ...mockAnalysisInStore, status: 'completed' }]
	});

	return {
		Component: AnalysisProgressWrapper,
		props: {
			analysisId: 'analysis-123',
			mockActiveAnalysisProgress,
			mockAnalysisStore
		}
	};
};
Completed.storyName = 'Completed';
Completed.parameters = {
	docs: {
		description: {
			story:
				'Progress indicator for a completed analysis, showing results summary with Markdown formatting.'
		}
	}
};

export const Error = () => {
	const mockActiveAnalysisProgress = writable(errorAnalysis);
	const mockAnalysisStore = writable({ analyses: [{ ...mockAnalysisInStore, status: 'error' }] });

	return {
		Component: AnalysisProgressWrapper,
		props: {
			analysisId: 'analysis-123',
			mockActiveAnalysisProgress,
			mockAnalysisStore
		}
	};
};
Error.storyName = 'Error';
Error.parameters = {
	docs: {
		description: {
			story:
				'Progress indicator for an analysis that encountered an error, with detailed error information.'
		}
	}
};

export const GlobalProgress = () => {
	const mockActiveAnalysisProgress = writable(runningAnalysis);
	const mockAnalysisStore = writable({ analyses: [mockAnalysisInStore] });

	return {
		Component: AnalysisProgressWrapper,
		props: {
			mockActiveAnalysisProgress,
			mockAnalysisStore
		}
	};
};
GlobalProgress.storyName = 'Global Progress';
GlobalProgress.parameters = {
	docs: {
		description: {
			story:
				'Progress indicator showing the global active analysis without specifying a particular analysis ID.'
		}
	}
};

export const NoActiveAnalysis = () => {
	const mockActiveAnalysisProgress = writable({
		id: null,
		status: null,
		progress: 0,
		message: '',
		logs: []
	});
	const mockAnalysisStore = writable({ analyses: [] });

	return {
		Component: AnalysisProgressWrapper,
		props: {
			mockActiveAnalysisProgress,
			mockAnalysisStore
		}
	};
};
NoActiveAnalysis.storyName = 'No Active Analysis';
NoActiveAnalysis.parameters = {
	docs: {
		description: {
			story: 'Component behavior when there is no active analysis to display.'
		}
	}
};
