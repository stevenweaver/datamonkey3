import { writable } from 'svelte/store';

export default {
	title: 'Components/FileManager',
	component: null,
	parameters: {
		docs: {
			description: {
				component: 'A comprehensive file management component with sorting, filtering, and batch operations.'
			}
		}
	},
	argTypes: {
		onSelectFile: { action: 'fileSelected' }
	}
};

// Mock stores for FileManager dependencies
const mockPersistentFileStore = writable({
	files: [
		{
			id: 'file-1',
			filename: 'sample.fasta',
			size: 2048,
			contentType: 'text/plain',
			createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
		},
		{
			id: 'file-2',
			filename: 'large_dataset.phylip',
			size: 15728640, // 15MB
			contentType: 'text/plain',
			createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
		},
		{
			id: 'file-3',
			filename: 'sequences.nexus',
			size: 512000,
			contentType: 'application/nexus',
			createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
		},
		{
			id: 'file-4',
			filename: 'analysis_results.csv',
			size: 1024,
			contentType: 'text/csv',
			createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
		}
	]
});

const mockCurrentFile = writable(null);
const mockAnalysisStore = writable({ analyses: [] });

const Template = ({ onSelectFile }) => ({
	Component: () => import('../lib/FileManager.svelte'),
	props: {
		onSelectFile: onSelectFile || (() => console.log('File selected'))
	}
});

export const WithFiles = Template.bind({});
WithFiles.args = {};

export const EmptyState = Template.bind({});
EmptyState.args = {};
// This would need custom mock stores with empty arrays

export const LoadingState = Template.bind({});
LoadingState.args = {};
// This would need to mock the loading state

export const SingleFile = Template.bind({});
SingleFile.args = {};
// This would need custom mock stores with single file

export const ManyFiles = Template.bind({});
ManyFiles.args = {};
// This would need custom mock stores with many files for testing performance