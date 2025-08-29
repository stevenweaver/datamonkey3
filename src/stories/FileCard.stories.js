export default {
	title: 'Components/FileCard',
	component: null,
	parameters: {
		docs: {
			description: {
				component: 'A file card component for displaying file information with actions and details.'
			}
		}
	},
	argTypes: {
		file: { control: 'object' },
		isActive: { control: 'boolean' },
		showDetails: { control: 'boolean' },
		preview: { control: 'text' }
	}
};

const mockFastaFile = {
	id: 'file-1',
	filename: 'sample.fasta',
	size: 2048,
	contentType: 'text/plain',
	createdAt: new Date().toISOString()
};

const mockLargeFile = {
	id: 'file-2',
	filename: 'large_dataset.phylip',
	size: 15728640, // 15MB
	contentType: 'text/plain',
	createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
};

const mockOldFile = {
	id: 'file-3',
	filename: 'old_analysis.nexus',
	size: 512000,
	contentType: 'application/nexus',
	createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
};

const Template = ({ file, isActive, showDetails, preview }) => ({
	Component: () => import('../lib/FileCard.svelte'),
	props: {
		file,
		isActive,
		showDetails,
		preview
	}
});

export const Default = Template.bind({});
Default.args = {
	file: mockFastaFile,
	isActive: false,
	showDetails: false,
	preview: null
};

export const ActiveFile = Template.bind({});
ActiveFile.args = {
	file: mockFastaFile,
	isActive: true,
	showDetails: false,
	preview: null
};

export const WithDetails = Template.bind({});
WithDetails.args = {
	file: mockFastaFile,
	isActive: false,
	showDetails: true,
	preview: null
};

export const WithPreview = Template.bind({});
WithPreview.args = {
	file: mockFastaFile,
	isActive: false,
	showDetails: true,
	preview: '>sequence1\nATGCGTAGCTAGCTAGCTAGC\n>sequence2\nGCTAGCTAGCTAGCTAGCTAG'
};

export const LargeFile = Template.bind({});
LargeFile.args = {
	file: mockLargeFile,
	isActive: false,
	showDetails: false,
	preview: null
};

export const OldFile = Template.bind({});
OldFile.args = {
	file: mockOldFile,
	isActive: false,
	showDetails: true,
	preview: null
};

export const ActiveWithDetails = Template.bind({});
ActiveWithDetails.args = {
	file: mockFastaFile,
	isActive: true,
	showDetails: true,
	preview: '>seq1\nATGCGTAGCTAGCTAGCTAGC\n>seq2\nGCTAGCTAGCTAGCTAGCTAG\n>seq3\nTAGCTAGCTAGCTAGCTAGC'
};
