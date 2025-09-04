import TreeSourceSelector from '../lib/TreeSourceSelector.svelte';

export default {
	title: 'Components/TreeSourceSelector',
	component: TreeSourceSelector,
	parameters: {
		docs: {
			description: {
				component:
					'A tree source selection component that allows users to choose between using an uploaded tree, the neighbor-joining tree from alignment metrics, or uploading a different tree.'
			}
		}
	},
	argTypes: {
		hasUploadedTree: {
			control: 'boolean',
			description: 'Whether an uploaded tree is available'
		},
		hasInferredTree: {
			control: 'boolean',
			description: 'Whether a neighbor-joining tree from alignment metrics is available'
		},
		treeSource: {
			control: 'radio',
			options: ['uploaded', 'inferred', 'upload-new'],
			description: 'Selected tree source'
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the component is disabled'
		}
	}
};

const Template = (args) => ({
	Component: TreeSourceSelector,
	props: args,
	on: {
		treeSourceChange: (event) => {
			console.log('Tree source changed:', event.detail);
		},
		fileUploaded: (event) => {
			console.log('File uploaded:', event.detail);
		}
	}
});

// Default state with all options available
export const Default = Template.bind({});
Default.args = {
	hasUploadedTree: true,
	hasInferredTree: true,
	treeSource: 'inferred',
	disabled: false
};

// No uploaded tree, only NJ tree from metrics
export const OnlyInferredTree = Template.bind({});
OnlyInferredTree.args = {
	hasUploadedTree: false,
	hasInferredTree: true,
	treeSource: 'inferred',
	disabled: false
};

// User selected uploaded tree
export const UsingUploadedTree = Template.bind({});
UsingUploadedTree.args = {
	hasUploadedTree: true,
	hasInferredTree: true,
	treeSource: 'uploaded',
	disabled: false
};

// User wants to upload a different tree
export const UploadDifferentTree = Template.bind({});
UploadDifferentTree.args = {
	hasUploadedTree: true,
	hasInferredTree: true,
	treeSource: 'upload-new',
	disabled: false
};

// No inferred tree available (edge case)
export const NoInferredTree = Template.bind({});
NoInferredTree.args = {
	hasUploadedTree: true,
	hasInferredTree: false,
	treeSource: 'uploaded',
	disabled: false
};

// Disabled state
export const Disabled = Template.bind({});
Disabled.args = {
	hasUploadedTree: true,
	hasInferredTree: true,
	treeSource: 'inferred',
	disabled: true
};

// Interactive playground
export const Interactive = Template.bind({});
Interactive.args = {
	hasUploadedTree: true,
	hasInferredTree: true,
	treeSource: 'inferred',
	disabled: false
};
Interactive.parameters = {
	docs: {
		description: {
			story: 'Interactive playground - try different combinations to see how the component behaves.'
		}
	}
};
