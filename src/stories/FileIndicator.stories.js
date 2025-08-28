import '../app.css';
import FileIndicatorWrapper from './FileIndicatorWrapper.svelte';
import { writable } from 'svelte/store';

// Mock file data
const mockFile = {
	id: 'file-123',
	filename: 'HIV1_env_sequences.fasta',
	name: 'HIV1_env_sequences.fasta',
	size: 125432,
	uploadedAt: new Date().toISOString()
};

const mockLargeFile = {
	id: 'file-456',
	filename: 'complete_genome_dataset.fasta',
	name: 'complete_genome_dataset.fasta',
	size: 5242880, // 5MB
	uploadedAt: new Date().toISOString()
};

const mockSmallFile = {
	id: 'file-789',
	filename: 'test_sequences.fna',
	name: 'test_sequences.fna',
	size: 2048,
	uploadedAt: new Date().toISOString()
};

// Mock metrics data
const mockMetrics = {
	FILE_INFO: {
		sequences: 25,
		sites: 450
	}
};

const mockLargeMetrics = {
	FILE_INFO: {
		sequences: 150,
		sites: 1200
	}
};

const mockSmallMetrics = {
	FILE_INFO: {
		sequences: 5,
		sites: 50
	}
};

// Story configuration
export default {
	title: 'Progress Indicators/FileIndicator',
	component: FileIndicatorWrapper,
	parameters: {
		docs: {
			description: {
				component: `
          ## File Indicator
          
          Displays information about the currently loaded file for analysis.
          
          Features:
          - **File name**: Shows the name of the loaded file
          - **Sequence count**: Number of sequences in the alignment
          - **Site count**: Number of sites/positions in the alignment
          - **File size**: Human-readable file size (B, KB, MB, GB)
          - **Valid status**: Confirms the file is valid for analysis
          
          The component uses a clean, card-based design with clear iconography and follows the premium design system.
        `
			}
		}
	}
};

// Story variants
export const StandardFile = () => {
	const mockCurrentFile = writable(mockFile);
	const mockFileMetricsStore = writable(mockMetrics);
	
	return {
		Component: FileIndicatorWrapper,
		props: {
			mockCurrentFile,
			mockFileMetricsStore
		}
	};
};
StandardFile.parameters = {
	docs: {
		description: {
			story: 'Shows a standard FASTA file with typical sequence and site counts.'
		}
	}
};

export const LargeFile = () => {
	const mockCurrentFile = writable(mockLargeFile);
	const mockFileMetricsStore = writable(mockLargeMetrics);
	
	return {
		Component: FileIndicatorWrapper,
		props: {
			mockCurrentFile,
			mockFileMetricsStore
		}
	};
};
LargeFile.parameters = {
	docs: {
		description: {
			story: 'Shows a large dataset with many sequences and sites.'
		}
	}
};

export const SmallFile = () => {
	const mockCurrentFile = writable(mockSmallFile);
	const mockFileMetricsStore = writable(mockSmallMetrics);
	
	return {
		Component: FileIndicatorWrapper,
		props: {
			mockCurrentFile,
			mockFileMetricsStore
		}
	};
};
SmallFile.parameters = {
	docs: {
		description: {
			story: 'Shows a small test file with minimal data.'
		}
	}
};

export const NoMetrics = () => {
	const mockCurrentFile = writable(mockFile);
	const mockFileMetricsStore = writable(null);
	
	return {
		Component: FileIndicatorWrapper,
		props: {
			mockCurrentFile,
			mockFileMetricsStore
		}
	};
};
NoMetrics.parameters = {
	docs: {
		description: {
			story: 'Shows the indicator when file metrics are not yet loaded (uses fallback values).'
		}
	}
};

export const FallbackFile = () => {
	// Show without filename property (uses fallback)
	const fileWithoutFilename = { ...mockFile };
	delete fileWithoutFilename.filename;
	const mockCurrentFile = writable(fileWithoutFilename);
	const mockFileMetricsStore = writable(mockMetrics);
	
	return {
		Component: FileIndicatorWrapper,
		props: {
			mockCurrentFile,
			mockFileMetricsStore
		}
	};
};
FallbackFile.parameters = {
	docs: {
		description: {
			story: 'Shows the component using the fallback filename when the file object lacks a filename property.'
		}
	}
};