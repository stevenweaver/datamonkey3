import '../app.css';
import AnalysisHistoryWrapper from './AnalysisHistoryWrapper.svelte';
import { writable } from 'svelte/store';

// Mock file data
const mockFiles = [
	{
		id: 'file-123',
		filename: 'HIV1_env_sequences.fasta',
		name: 'HIV1_env_sequences.fasta',
		size: 125432,
		uploadedAt: new Date(Date.now() - 86400000).toISOString()
	},
	{
		id: 'file-456',
		filename: 'influenza_ha_sequences.fasta',
		name: 'influenza_ha_sequences.fasta',
		size: 89432,
		uploadedAt: new Date(Date.now() - 3600000).toISOString()
	},
	{
		id: 'file-789',
		filename: 'sars_cov2_spike.fasta',
		name: 'sars_cov2_spike.fasta',
		size: 45231,
		uploadedAt: new Date(Date.now() - 172800000).toISOString()
	}
];

// Mock analyses data for different scenarios
const mixedAnalyses = [
	{
		id: 'analysis-1',
		fileId: 'file-123',
		method: 'fel',
		status: 'running',
		createdAt: new Date(Date.now() - 120000).getTime(), // 2 minutes ago
		result: null
	},
	{
		id: 'analysis-2',
		fileId: 'file-123',
		method: 'slac',
		status: 'completed',
		createdAt: new Date(Date.now() - 3600000).getTime(), // 1 hour ago
		completedAt: new Date(Date.now() - 3300000).toISOString(),
		result: { tested: { sites: [{ site: 42, p: 0.023, alpha: 0.15, beta: 0.85 }] } }
	},
	{
		id: 'analysis-3',
		fileId: 'file-456',
		method: 'meme',
		status: 'completed',
		createdAt: new Date(Date.now() - 7200000).getTime(), // 2 hours ago
		completedAt: new Date(Date.now() - 6900000).toISOString(),
		result: { tested: { sites: [{ site: 67, p: 0.011, alpha: 0.12, beta: 0.92 }] } }
	},
	{
		id: 'analysis-4',
		fileId: 'file-456',
		method: 'busted',
		status: 'error',
		createdAt: new Date(Date.now() - 1800000).getTime(), // 30 minutes ago
		result: null
	},
	{
		id: 'analysis-5',
		fileId: 'file-789',
		method: 'fubar',
		status: 'pending',
		createdAt: new Date(Date.now() - 60000).getTime(), // 1 minute ago
		result: null
	},
	{
		id: 'analysis-6',
		fileId: 'file-123',
		method: 'relax',
		status: 'cancelled',
		createdAt: new Date(Date.now() - 600000).getTime(), // 10 minutes ago
		result: null
	}
];

const currentFileAnalyses = mixedAnalyses.filter((a) => a.fileId === 'file-123');

const runningAnalyses = [
	{
		id: 'analysis-running-1',
		fileId: 'file-123',
		method: 'fel',
		status: 'running',
		createdAt: new Date(Date.now() - 120000).getTime(),
		result: null
	},
	{
		id: 'analysis-running-2',
		fileId: 'file-456',
		method: 'slac',
		status: 'pending',
		createdAt: new Date(Date.now() - 60000).getTime(),
		result: null
	}
];

const completedAnalyses = [
	{
		id: 'analysis-completed-1',
		fileId: 'file-123',
		method: 'fel',
		status: 'completed',
		createdAt: new Date(Date.now() - 3600000).getTime(),
		completedAt: new Date(Date.now() - 3300000).toISOString(),
		result: { tested: { sites: [{ site: 42, p: 0.023, alpha: 0.15, beta: 0.85 }] } }
	},
	{
		id: 'analysis-completed-2',
		fileId: 'file-456',
		method: 'busted',
		status: 'completed',
		createdAt: new Date(Date.now() - 7200000).getTime(),
		completedAt: new Date(Date.now() - 6900000).toISOString(),
		result: { test_results: { p: 0.0023 } }
	}
];

// Story configuration
export default {
	title: 'Progress Indicators/AnalysisHistory',
	component: AnalysisHistoryWrapper,
	parameters: {
		docs: {
			description: {
				component: `
          ## Analysis History Component
          
          Displays a list of analysis results with comprehensive progress indicators and state management.
          
          Features:
          - **Loading State**: Animated spinner while loading analyses from storage
          - **Error Handling**: Clear error messages with styled error states
          - **Empty State**: Informative message when no analyses are available
          - **Progress Indicators**: Shows running, pending, completed, error, and cancelled states
          - **File Grouping**: Groups analyses by file when not filtering
          - **Filtering**: Option to show only analyses for the current file
          - **Scrollable Lists**: Handles long lists with maximum height and scrolling
          - **Interactive Cards**: Each analysis is clickable with action buttons
          - **Compact Mode**: Streamlined view for smaller spaces
          
          The component manages complex async operations with proper loading and error states.
        `
			}
		}
	},
	argTypes: {
		onSelectAnalysis: { action: 'analysis-selected' },
		filterByCurrentFile: { control: 'boolean' },
		compact: { control: 'boolean' },
		redirectToResults: { control: 'boolean' }
	}
};

// Story variants showing different states
export const LoadingState = () => {
	const mockAnalysisStore = writable({
		analyses: [],
		isLoading: true,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: false,
			redirectToResults: false
		}
	};
};
LoadingState.parameters = {
	docs: {
		description: {
			story: 'Shows the loading state with animated spinner while analyses are being loaded.'
		}
	}
};

export const ErrorState = () => {
	const mockAnalysisStore = writable({
		analyses: [],
		isLoading: false,
		error: 'Failed to connect to server',
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: false,
			redirectToResults: false
		}
	};
};
ErrorState.parameters = {
	docs: {
		description: {
			story: 'Shows the error state when loading analyses fails.'
		}
	}
};

export const EmptyState = () => {
	const mockAnalysisStore = writable({
		analyses: [],
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: false,
			redirectToResults: false
		}
	};
};
EmptyState.parameters = {
	docs: {
		description: {
			story: 'Shows the empty state when no analyses are available.'
		}
	}
};

export const MixedAnalyses = () => {
	const mockAnalysisStore = writable({
		analyses: mixedAnalyses,
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: false,
			redirectToResults: false
		}
	};
};
MixedAnalyses.parameters = {
	docs: {
		description: {
			story:
				'Shows mixed analyses grouped by file with different status indicators (running, completed, error, cancelled).'
		}
	}
};

export const FilteredByFile = () => {
	const mockAnalysisStore = writable({
		analyses: mixedAnalyses,
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(mockFiles[0]); // Set first file as current

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: true,
			compact: false,
			redirectToResults: false
		}
	};
};
FilteredByFile.parameters = {
	docs: {
		description: {
			story: 'Shows analyses filtered by the current file, without file grouping headers.'
		}
	}
};

export const CompactMode = () => {
	const mockAnalysisStore = writable({
		analyses: mixedAnalyses,
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: true,
			redirectToResults: false
		}
	};
};
CompactMode.parameters = {
	docs: {
		description: {
			story: 'Shows the compact view suitable for smaller spaces or sidebar usage.'
		}
	}
};

export const RunningAnalyses = () => {
	const mockAnalysisStore = writable({
		analyses: runningAnalyses,
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: false,
			redirectToResults: false
		}
	};
};
RunningAnalyses.parameters = {
	docs: {
		description: {
			story: 'Shows only running and pending analyses with animated progress indicators.'
		}
	}
};

export const CompletedAnalyses = () => {
	const mockAnalysisStore = writable({
		analyses: completedAnalyses,
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: false,
			redirectToResults: false
		}
	};
};
CompletedAnalyses.parameters = {
	docs: {
		description: {
			story: 'Shows only completed analyses with result previews and export options.'
		}
	}
};

export const WithRedirect = () => {
	const mockAnalysisStore = writable({
		analyses: completedAnalyses,
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(null);

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: false,
			compact: false,
			redirectToResults: true
		}
	};
};
WithRedirect.parameters = {
	docs: {
		description: {
			story: 'Shows the component configured to redirect to Results tab when selecting an analysis.'
		}
	}
};

export const EmptyCurrentFile = () => {
	const mockAnalysisStore = writable({
		analyses: mixedAnalyses,
		isLoading: false,
		error: null,
		currentAnalysisId: null
	});
	const mockPersistentFileStore = writable({ files: mockFiles });
	const mockCurrentFile = writable(mockFiles[2]); // File with no analyses

	return {
		Component: AnalysisHistoryWrapper,
		props: {
			mockAnalysisStore,
			mockPersistentFileStore,
			mockCurrentFile,
			onSelectAnalysis: (id) => console.log('Selected analysis:', id),
			filterByCurrentFile: true,
			compact: false,
			redirectToResults: false
		}
	};
};
EmptyCurrentFile.parameters = {
	docs: {
		description: {
			story:
				'Shows empty state with specific message when filtering by current file but no analyses exist for it.'
		}
	}
};
