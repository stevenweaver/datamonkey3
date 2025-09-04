import TreeSourceSelector from '../lib/TreeSourceSelector.svelte';

export default {
	title: 'Components/TreeSourceSelector',
	component: TreeSourceSelector,
	parameters: {
		docs: {
			description: {
				component: 'A tree source selection component that allows users to choose between using an uploaded tree or inferring one automatically. Includes advanced options for tree generation methods and parameters.'
			}
		}
	},
	argTypes: {
		hasUploadedTree: {
			control: 'boolean',
			description: 'Whether an uploaded tree is available'
		},
		treeSource: {
			control: 'radio',
			options: ['uploaded', 'infer'],
			description: 'Selected tree source'
		},
		isGenerating: {
			control: 'boolean',
			description: 'Whether tree generation is in progress'
		},
		treeStatus: {
			control: 'select',
			options: ['ready', 'generating', 'available', 'error'],
			description: 'Current status of the tree'
		},
		showAdvancedOptions: {
			control: 'boolean',
			description: 'Whether advanced options are expanded'
		},
		selectedMethod: {
			control: 'select',
			options: ['nj', 'ml'],
			description: 'Tree building method'
		},
		substitutionModel: {
			control: 'select',
			options: ['JC69', 'K80', 'HKY', 'GTR'],
			description: 'Substitution model (ML only)'
		},
		bootstrapReps: {
			control: { type: 'number', min: 0, max: 1000 },
			description: 'Number of bootstrap replicates'
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
		advancedToggle: (event) => {
			console.log('Advanced options toggled:', event.detail);
		},
		advancedChange: (event) => {
			console.log('Advanced settings changed:', event.detail);
		}
	}
});

// Default state with tree upload available
export const Default = Template.bind({});
Default.args = {
	hasUploadedTree: true,
	treeSource: 'uploaded',
	isGenerating: false,
	treeStatus: 'available',
	showAdvancedOptions: false,
	selectedMethod: 'nj',
	substitutionModel: 'HKY',
	bootstrapReps: 100,
	disabled: false
};

// No uploaded tree available
export const NoUploadedTree = Template.bind({});
NoUploadedTree.args = {
	hasUploadedTree: false,
	treeSource: 'infer',
	isGenerating: false,
	treeStatus: 'ready',
	showAdvancedOptions: false,
	selectedMethod: 'nj',
	substitutionModel: 'HKY',
	bootstrapReps: 100,
	disabled: false
};

// Tree generation in progress
export const Generating = Template.bind({});
Generating.args = {
	hasUploadedTree: true,
	treeSource: 'infer',
	isGenerating: true,
	treeStatus: 'generating',
	showAdvancedOptions: true,
	selectedMethod: 'ml',
	substitutionModel: 'GTR',
	bootstrapReps: 500,
	disabled: false
};

// Advanced options expanded
export const AdvancedExpanded = Template.bind({});
AdvancedExpanded.args = {
	hasUploadedTree: true,
	treeSource: 'infer',
	isGenerating: false,
	treeStatus: 'ready',
	showAdvancedOptions: true,
	selectedMethod: 'nj',
	substitutionModel: 'HKY',
	bootstrapReps: 100,
	disabled: false
};

// Maximum Likelihood with advanced options
export const MaximumLikelihood = Template.bind({});
MaximumLikelihood.args = {
	hasUploadedTree: false,
	treeSource: 'infer',
	isGenerating: false,
	treeStatus: 'ready',
	showAdvancedOptions: true,
	selectedMethod: 'ml',
	substitutionModel: 'GTR',
	bootstrapReps: 1000,
	disabled: false
};

// Error state
export const ErrorState = Template.bind({});
ErrorState.args = {
	hasUploadedTree: true,
	treeSource: 'infer',
	isGenerating: false,
	treeStatus: 'error',
	showAdvancedOptions: true,
	selectedMethod: 'ml',
	substitutionModel: 'HKY',
	bootstrapReps: 100,
	disabled: false
};

// Disabled state
export const Disabled = Template.bind({});
Disabled.args = {
	hasUploadedTree: true,
	treeSource: 'uploaded',
	isGenerating: false,
	treeStatus: 'available',
	showAdvancedOptions: true,
	selectedMethod: 'nj',
	substitutionModel: 'HKY',
	bootstrapReps: 100,
	disabled: true
};

// Interactive playground
export const Interactive = Template.bind({});
Interactive.args = {
	hasUploadedTree: true,
	treeSource: 'uploaded',
	isGenerating: false,
	treeStatus: 'available',
	showAdvancedOptions: false,
	selectedMethod: 'nj',
	substitutionModel: 'HKY',
	bootstrapReps: 100,
	disabled: false
};
Interactive.parameters = {
	docs: {
		description: {
			story: 'Interactive playground - try toggling different options to see how the component behaves.'
		}
	}
};