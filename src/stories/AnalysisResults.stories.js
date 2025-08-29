import AnalysisResultsDemo from './components/AnalysisResultsDemo.svelte';
import '../app.css';

export default {
	title: 'Analysis Results/Results Display',
	component: AnalysisResultsDemo,
	argTypes: {
		analysis: { control: 'object' },
		file: { control: 'object' },
		resultData: { control: 'object' },
		loading: { control: 'boolean' },
		error: { control: 'text' }
	},
	parameters: {
		docs: {
			description: {
				component:
					'Comprehensive display component for showing analysis results from various HyPhy methods including FEL, SLAC, MEME, BUSTED, and more. Uses hyphy-scope visualization components for interactive charts, plots, and data displays with fallback to manual table views for unsupported methods.'
			}
		}
	}
};

// Mock data
const mockFile = {
	filename: 'sequences.fasta',
	size: 1024,
	type: 'fasta'
};

const mockFelResults = {
	input: {
		file: 'sequences.fasta',
		tree: '(seq1:0.1,seq2:0.2)',
		sequences: 10,
		sites: 300
	},
	fits: [
		{
			model: 'Global MG94xREV',
			log_likelihood: -1234.56,
			parameters: 23,
			AIC: 2515.12
		},
		{
			model: 'Full adaptive model',
			log_likelihood: -1220.34,
			parameters: 45,
			AIC: 2530.68
		}
	],
	tested: {
		sites: [
			{ site_index: 1, p: 0.001, alpha: 0.5, beta: 2.1 },
			{ site_index: 2, p: 0.15, alpha: 1.2, beta: 0.8 },
			{ site_index: 3, p: 0.03, alpha: 2.8, beta: 0.4 },
			{ site_index: 4, p: 0.002, alpha: 0.3, beta: 3.2 },
			{ site_index: 5, p: 0.8, alpha: 0.9, beta: 1.1 },
			{ site_index: 6, p: 0.025, alpha: 0.4, beta: 2.8 }
		]
	}
};

const mockBustedResults = {
	input: {
		file: 'sequences.fasta',
		sequences: 8,
		sites: 250
	},
	fits: [
		{
			model: 'Unconstrained model',
			log_likelihood: -987.65,
			parameters: 15,
			AIC: 2005.3
		},
		{
			model: 'Constrained model',
			log_likelihood: -995.43,
			parameters: 12,
			AIC: 2014.86
		}
	],
	test_results: {
		'p-value': 0.001,
		'likelihood ratio': 15.56,
		'evidence for selection': 'Strong evidence'
	}
};

const mockDataReaderResults = {
	FILE_INFO: {
		type: 'FASTA nucleotide alignment',
		sequences: 12,
		sites: 450
	},
	FILE_PARTITION_INFO: {
		1: { sites: 300, sequences: 12, type: 'codon' },
		2: { sites: 150, sequences: 12, type: 'nucleotide' }
	}
};

const Template = (args) => ({
	Component: AnalysisResultsDemo,
	props: args
});

export const FelAnalysisCompleted = Template.bind({});
FelAnalysisCompleted.args = {
	analysis: {
		method: 'FEL',
		status: 'completed',
		createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
		completedAt: new Date().toISOString()
	},
	file: mockFile,
	resultData: mockFelResults
};
FelAnalysisCompleted.parameters = {
	docs: {
		description: {
			story:
				'Shows a completed FEL (Fixed Effects Likelihood) analysis using the hyphy-scope FelVisualization component, featuring interactive plots, model fits, and site-specific results with selection pressure indicators.'
		}
	}
};

export const BustedAnalysisCompleted = Template.bind({});
BustedAnalysisCompleted.args = {
	analysis: {
		method: 'BUSTED',
		status: 'completed',
		createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
		completedAt: new Date().toISOString()
	},
	file: mockFile,
	resultData: mockBustedResults
};
BustedAnalysisCompleted.parameters = {
	docs: {
		description: {
			story:
				'Shows a completed BUSTED analysis using the hyphy-scope BustedVisualization component with interactive model comparison and test results visualization.'
		}
	}
};

export const DataReaderResults = Template.bind({});
DataReaderResults.args = {
	analysis: {
		method: 'datareader',
		status: 'completed',
		createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
		completedAt: new Date().toISOString()
	},
	file: mockFile,
	resultData: mockDataReaderResults
};
DataReaderResults.parameters = {
	docs: {
		description: {
			story:
				'Shows DataReader results displaying file information and partition details for uploaded sequences.'
		}
	}
};

export const SlacAnalysisCompleted = Template.bind({});
SlacAnalysisCompleted.args = {
	analysis: {
		method: 'SLAC',
		status: 'completed',
		createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
		completedAt: new Date().toISOString()
	},
	file: mockFile,
	resultData: {
		input: { file: 'alignment.fasta', sequences: 6, sites: 200 },
		tested: {
			sites: [
				{ site_index: 1, p: 0.045, alpha: 1.8, beta: 0.6 },
				{ site_index: 2, p: 0.12, alpha: 0.9, beta: 1.1 },
				{ site_index: 3, p: 0.003, alpha: 0.2, beta: 4.5 },
				{ site_index: 4, p: 0.8, alpha: 1.0, beta: 1.0 },
				{ site_index: 5, p: 0.01, alpha: 3.2, beta: 0.1 }
			]
		}
	}
};
SlacAnalysisCompleted.parameters = {
	docs: {
		description: {
			story:
				'Shows a completed SLAC analysis with site-specific selection results and alpha/beta parameters.'
		}
	}
};

export const MemeAnalysisCompleted = Template.bind({});
MemeAnalysisCompleted.args = {
	analysis: {
		method: 'MEME',
		status: 'completed',
		createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
		completedAt: new Date().toISOString()
	},
	file: mockFile,
	resultData: {
		input: { file: 'meme_data.fasta', sequences: 15, sites: 400 },
		fits: [{ model: 'General model', log_likelihood: -2345.67, parameters: 38, AIC: 4767.34 }],
		tested: {
			sites: [
				{ site_index: 1, p: 0.001, alpha: 0.1, beta: 5.2 },
				{ site_index: 2, p: 0.6, alpha: 1.1, beta: 0.9 },
				{ site_index: 3, p: 0.02, alpha: 0.3, beta: 8.1 }
			]
		}
	}
};
MemeAnalysisCompleted.parameters = {
	docs: {
		description: {
			story:
				'Shows a completed MEME analysis detecting episodic positive selection with site results.'
		}
	}
};

export const AnalysisRunning = Template.bind({});
AnalysisRunning.args = {
	analysis: {
		method: 'FUBAR',
		status: 'running',
		createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
	},
	file: mockFile,
	resultData: {}
};
AnalysisRunning.parameters = {
	docs: {
		description: {
			story: 'Shows an analysis currently running with a loading indicator and status message.'
		}
	}
};

export const AnalysisPending = Template.bind({});
AnalysisPending.args = {
	analysis: {
		method: 'aBSREL',
		status: 'pending',
		createdAt: new Date().toISOString()
	},
	file: mockFile,
	resultData: {}
};
AnalysisPending.parameters = {
	docs: {
		description: {
			story: 'Shows an analysis in pending state waiting to be processed.'
		}
	}
};

export const GenericAnalysisResults = Template.bind({});
GenericAnalysisResults.args = {
	analysis: {
		method: 'CUSTOM',
		status: 'completed',
		createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
		completedAt: new Date().toISOString()
	},
	file: mockFile,
	resultData: {
		custom_field: 'Custom analysis result',
		parameters: {
			substitution_model: 'HKY85',
			branch_lengths: 'optimized',
			significance_level: 0.05
		},
		output: {
			total_sites_tested: 156,
			significant_sites: 12,
			positive_selection_sites: 8,
			negative_selection_sites: 4
		}
	}
};
GenericAnalysisResults.parameters = {
	docs: {
		description: {
			story:
				'Shows a generic analysis result that falls back to JSON display for custom or unsupported methods.'
		}
	}
};

export const LoadingState = Template.bind({});
LoadingState.args = {
	loading: true
};
LoadingState.parameters = {
	docs: {
		description: {
			story: 'Shows the loading state while analysis data is being fetched from the server.'
		}
	}
};

export const ErrorState = Template.bind({});
ErrorState.args = {
	error: 'Analysis not found or could not be loaded from the server'
};
ErrorState.parameters = {
	docs: {
		description: {
			story: 'Shows error state when analysis data cannot be loaded or is corrupted.'
		}
	}
};
