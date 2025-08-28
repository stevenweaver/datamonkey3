import FileManager from '../lib/FileManager.svelte';
import { writable } from 'svelte/store';

export default {
	title: 'Components/FileManager',
	component: FileManager,
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

const Template = (args) => ({
	Component: FileManager,
	props: args
});

export const WithFiles = Template.bind({});
WithFiles.args = {
	onSelectFile: (file) => console.log('File selected:', file)
};

export const EmptyState = Template.bind({});
EmptyState.args = {
	onSelectFile: (file) => console.log('File selected:', file)
};

export const LoadingState = Template.bind({});
LoadingState.args = {
	onSelectFile: (file) => console.log('File selected:', file)
};

export const SingleFile = Template.bind({});
SingleFile.args = {
	onSelectFile: (file) => console.log('File selected:', file)
};

export const ManyFiles = Template.bind({});
ManyFiles.args = {
	onSelectFile: (file) => console.log('File selected:', file)
};