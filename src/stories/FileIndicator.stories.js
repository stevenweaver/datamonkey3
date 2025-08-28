import '../app.css';
import FileIndicator from '../lib/FileIndicator.svelte';
import { writable } from 'svelte/store';

// Create mock stores for the file indicator
const createFileStore = (file) => {
	return {
		subscribe: writable(file).subscribe
	};
};

const createMetricsStore = (metrics) => {
	return {
		subscribe: writable(metrics).subscribe
	};
};

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
	component: FileIndicator,
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

// Template for all stories
const Template = (args) => ({
	Component: FileIndicator,
	props: args
});

// Story variants
export const StandardFile = (args) => {
	// Override the stores with our mocks for this story
	window.currentFile = createFileStore(mockFile);
	window.fileMetricsStore = createMetricsStore(mockMetrics);
	return Template.bind({})();
};
StandardFile.parameters = {
	docs: {
		description: {
			story: 'Shows a standard FASTA file with typical sequence and site counts.'
		}
	}
};

export const LargeFile = (args) => {
	window.currentFile = createFileStore(mockLargeFile);
	window.fileMetricsStore = createMetricsStore(mockLargeMetrics);
	return Template.bind({})();
};
LargeFile.parameters = {
	docs: {
		description: {
			story: 'Shows a large dataset with many sequences and sites.'
		}
	}
};

export const SmallFile = (args) => {
	window.currentFile = createFileStore(mockSmallFile);
	window.fileMetricsStore = createMetricsStore(mockSmallMetrics);
	return Template.bind({})();
};
SmallFile.parameters = {
	docs: {
		description: {
			story: 'Shows a small test file with minimal data.'
		}
	}
};

export const NoMetrics = (args) => {
	window.currentFile = createFileStore(mockFile);
	window.fileMetricsStore = createMetricsStore(null);
	return Template.bind({})();
};
NoMetrics.parameters = {
	docs: {
		description: {
			story: 'Shows the indicator when file metrics are not yet loaded (uses fallback values).'
		}
	}
};

export const FallbackFile = (args) => {
	// Show without filename property (uses fallback)
	const fileWithoutFilename = { ...mockFile };
	delete fileWithoutFilename.filename;
	window.currentFile = createFileStore(fileWithoutFilename);
	window.fileMetricsStore = createMetricsStore(mockMetrics);
	return Template.bind({})();
};
FallbackFile.parameters = {
	docs: {
		description: {
			story: 'Shows the component using the fallback filename when the file object lacks a filename property.'
		}
	}
};