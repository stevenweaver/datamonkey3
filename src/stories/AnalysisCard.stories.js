import '../app.css';
import AnalysisCard from '../lib/AnalysisCard.svelte';
import { writable } from 'svelte/store';

// Create mock stores for the stories
const createFileStore = (files) => {
	return {
		files: files || []
	};
};

// Mock file data for reference
const mockFiles = [
	{
		id: 'file-123',
		filename: 'HIV1_env_sequences.fasta',
		name: 'HIV1_env_sequences.fasta',
		size: 125432,
		uploadedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
	},
	{
		id: 'file-456',
		filename: 'influenza_ha_sequences.fasta',
		name: 'influenza_ha_sequences.fasta',
		size: 89432,
		uploadedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
	}
];

// Mock analyses for different states
const runningAnalysis = {
	id: 'analysis-running-123',
	fileId: 'file-123',
	method: 'fel',
	status: 'running',
	createdAt: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
	result: null
};

const completedAnalysisFel = {
	id: 'analysis-completed-fel',
	fileId: 'file-123',
	method: 'fel',
	status: 'completed',
	createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
	completedAt: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
	result: {
		tested: {
			sites: [
				{ site: 42, p: 0.023, alpha: 0.15, beta: 0.85 },
				{ site: 67, p: 0.011, alpha: 0.12, beta: 0.92 },
				{ site: 89, p: 0.045, alpha: 0.18, beta: 0.78 },
				{ site: 102, p: 0.008, alpha: 0.11, beta: 0.95 },
				{ site: 134, p: 0.031, alpha: 0.14, beta: 0.82 }
			]
		}
	}
};

const completedAnalysisBusted = {
	id: 'analysis-completed-busted',
	fileId: 'file-456',
	method: 'busted',
	status: 'completed',
	createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
	completedAt: new Date(Date.now() - 6900000).toISOString(), // 1 hour 55 minutes ago
	result: {
		test_results: {
			p: 0.0023
		}
	}
};

const bustedNotSignificant = {
	id: 'analysis-busted-ns',
	fileId: 'file-123',
	method: 'busted',
	status: 'completed',
	createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
	completedAt: new Date(Date.now() - 86100000).toISOString(),
	result: {
		test_results: {
			p: 0.127
		}
	}
};

const errorAnalysis = {
	id: 'analysis-error-123',
	fileId: 'file-123',
	method: 'meme',
	status: 'error',
	createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
	result: null
};

const pendingAnalysis = {
	id: 'analysis-pending-123',
	fileId: 'file-456',
	method: 'slac',
	status: 'pending',
	createdAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
	result: null
};

const cancelledAnalysis = {
	id: 'analysis-cancelled-123',
	fileId: 'file-123',
	method: 'fubar',
	status: 'cancelled',
	createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
	result: null
};

const oldAnalysis = {
	id: 'analysis-old-123',
	fileId: 'file-123',
	method: 'fel',
	status: 'completed',
	createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
	completedAt: new Date(Date.now() - 86400000 * 8 + 3600000).toISOString(),
	result: {
		tested: {
			sites: [{ site: 23, p: 0.034, alpha: 0.16, beta: 0.81 }]
		}
	}
};

// Story configuration
export default {
	title: 'Progress Indicators/AnalysisCard',
	component: AnalysisCard,
	parameters: {
		docs: {
			description: {
				component: `
          ## Analysis Card Component
          
          Displays individual analysis results in both compact and detailed views with progress indicators.
          
          Features:
          - **Multiple Status States**: Running (with spinner), completed, error, cancelled, pending
          - **Result Previews**: Intelligent preview generation for different analysis methods  
          - **Loading Indicators**: Shows loading state while processing result previews
          - **Action Buttons**: Context-aware actions based on analysis status
          - **Time Display**: Smart relative time formatting (just now, 5 min ago, 2 days ago)
          - **Method Icons**: Visual method identification with SVG icons
          - **Compact Mode**: Streamlined view for list contexts
          
          The component includes progress indicators for various states and follows the premium design system.
        `
			}
		}
	},
	argTypes: {
		analysis: { control: 'object' },
		compact: { control: 'boolean' },
		selected: { control: 'boolean' }
	}
};

// Template for all stories
const Template = (args) => ({
	Component: AnalysisCard,
	props: args
});

// Story variants showing different progress/loading states
export const RunningAnalysis = (args) => {
	// Mock the persistent file store
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: runningAnalysis,
		compact: false,
		selected: false
	});
};
RunningAnalysis.parameters = {
	docs: {
		description: {
			story:
				'Shows a running analysis with animated spinner in the status badge and progress indicators.'
		}
	}
};

export const PendingAnalysis = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: pendingAnalysis,
		compact: false,
		selected: false
	});
};
PendingAnalysis.parameters = {
	docs: {
		description: {
			story: 'Shows an analysis in pending state with spinner animation.'
		}
	}
};

export const CompletedWithResults = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: completedAnalysisFel,
		compact: false,
		selected: false
	});
};
CompletedWithResults.parameters = {
	docs: {
		description: {
			story: 'Shows a completed FEL analysis with result preview showing positive selection sites.'
		}
	}
};

export const CompletedBustedSignificant = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: completedAnalysisBusted,
		compact: false,
		selected: false
	});
};
CompletedBustedSignificant.parameters = {
	docs: {
		description: {
			story: 'Shows a completed BUSTED analysis with significant positive selection detected.'
		}
	}
};

export const CompletedBustedNotSignificant = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: bustedNotSignificant,
		compact: false,
		selected: false
	});
};
CompletedBustedNotSignificant.parameters = {
	docs: {
		description: {
			story: 'Shows a completed BUSTED analysis with no significant selection detected.'
		}
	}
};

export const ErrorAnalysis = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: errorAnalysis,
		compact: false,
		selected: false
	});
};
ErrorAnalysis.parameters = {
	docs: {
		description: {
			story: 'Shows an analysis that encountered an error during execution.'
		}
	}
};

export const CancelledAnalysis = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: cancelledAnalysis,
		compact: false,
		selected: false
	});
};
CancelledAnalysis.parameters = {
	docs: {
		description: {
			story: 'Shows an analysis that was cancelled by the user.'
		}
	}
};

export const OldAnalysis = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: oldAnalysis,
		compact: false,
		selected: false
	});
};
OldAnalysis.parameters = {
	docs: {
		description: {
			story: 'Shows an older analysis with full date formatting instead of relative time.'
		}
	}
};

export const SelectedCard = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: completedAnalysisFel,
		compact: false,
		selected: true
	});
};
SelectedCard.parameters = {
	docs: {
		description: {
			story: 'Shows a selected analysis card with highlighted border and background.'
		}
	}
};

export const CompactMode = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: runningAnalysis,
		compact: true,
		selected: false
	});
};
CompactMode.parameters = {
	docs: {
		description: {
			story: 'Shows the compact version of the card suitable for list views.'
		}
	}
};

export const CompactSelected = (args) => {
	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: completedAnalysisFel,
		compact: true,
		selected: true
	});
};
CompactSelected.parameters = {
	docs: {
		description: {
			story: 'Shows a compact selected card without action buttons or result preview.'
		}
	}
};

export const LoadingPreview = (args) => {
	// Create an analysis that will trigger loading state
	const loadingAnalysis = {
		...completedAnalysisFel,
		id: 'analysis-loading-preview'
	};

	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: loadingAnalysis,
		compact: false,
		selected: false
	});
};
LoadingPreview.parameters = {
	docs: {
		description: {
			story: 'Shows the card while result preview is loading (demonstrates isLoading state).'
		}
	}
};

export const NoFileInfo = (args) => {
	// Create an analysis with no matching file
	const analysisNoFile = {
		...runningAnalysis,
		fileId: 'nonexistent-file-id'
	};

	window.persistentFileStore = createFileStore(mockFiles);
	return Template.bind({})({
		analysis: analysisNoFile,
		compact: false,
		selected: false
	});
};
NoFileInfo.parameters = {
	docs: {
		description: {
			story: 'Shows how the card handles missing file information gracefully.'
		}
	}
};
