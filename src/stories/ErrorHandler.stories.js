import ErrorHandler from '../lib/ErrorHandler.svelte';

export default {
	title: 'Components/ErrorHandler',
	component: ErrorHandler,
	parameters: {
		docs: {
			description: {
				component: 'A comprehensive error handling component with dismissal, details, and suggestions.'
			}
		}
	},
	argTypes: {
		error: { control: 'object' },
		level: { 
			control: 'select',
			options: ['error', 'warning', 'info']
		},
		dismissable: { control: 'boolean' },
		autoDismiss: { control: 'boolean' },
		dismissAfter: { control: 'number' },
		showDetails: { control: 'boolean' },
		suggestions: { control: 'object' }
	}
};

const Template = (args) => ({
	Component: ErrorHandler,
	props: args
});

export const SimpleError = Template.bind({});
SimpleError.args = {
	error: 'File upload failed. Please try again.',
	level: 'error',
	dismissable: true,
	autoDismiss: false,
	dismissAfter: 5000,
	showDetails: false,
	suggestions: []
};

export const DetailedError = Template.bind({});
DetailedError.args = {
	error: {
		message: 'Invalid FASTA format detected',
		details: 'Line 15: Expected sequence identifier starting with ">" but found "ATGC". Please ensure all sequences have proper headers.'
	},
	level: 'error',
	dismissable: true,
	autoDismiss: false,
	dismissAfter: 5000,
	showDetails: true,
	suggestions: []
};

export const ErrorWithSuggestions = Template.bind({});
ErrorWithSuggestions.args = {
	error: 'Connection to server failed',
	level: 'error',
	dismissable: true,
	autoDismiss: false,
	dismissAfter: 5000,
	showDetails: false,
	suggestions: [
		{ label: 'Retry', action: 'retry' },
		{ label: 'Check network', action: 'network' },
		{ label: 'Use local mode', action: 'offline' }
	]
};

export const Warning = Template.bind({});
Warning.args = {
	error: 'Large file detected. Analysis may take longer than usual.',
	level: 'warning',
	dismissable: true,
	autoDismiss: false,
	dismissAfter: 5000,
	showDetails: false,
	suggestions: [
		{ label: 'Continue anyway', action: 'continue' },
		{ label: 'Split file', action: 'split' }
	]
};

export const Info = Template.bind({});
Info.args = {
	error: 'Analysis completed successfully. Results are ready for download.',
	level: 'info',
	dismissable: true,
	autoDismiss: true,
	dismissAfter: 3000,
	showDetails: false,
	suggestions: []
};

export const AutoDismiss = Template.bind({});
AutoDismiss.args = {
	error: 'File saved successfully',
	level: 'info',
	dismissable: true,
	autoDismiss: true,
	dismissAfter: 2000,
	showDetails: false,
	suggestions: []
};

export const NonDismissable = Template.bind({});
NonDismissable.args = {
	error: 'Critical system error. Please contact support.',
	level: 'error',
	dismissable: false,
	autoDismiss: false,
	dismissAfter: 5000,
	showDetails: false,
	suggestions: [
		{ label: 'Contact support', action: 'support' },
		{ label: 'Report bug', action: 'report' }
	]
};

export const ComplexError = Template.bind({});
ComplexError.args = {
	error: {
		message: 'Phylogenetic analysis failed',
		details: 'Error in tree construction: Maximum likelihood estimation failed to converge after 1000 iterations. This may be due to insufficient sequence variation or inappropriate substitution model selection. Consider using a different model or checking sequence alignment quality.'
	},
	level: 'error',
	dismissable: true,
	autoDismiss: false,
	dismissAfter: 5000,
	showDetails: true,
	suggestions: [
		{ label: 'Try different model', action: 'change_model' },
		{ label: 'Check alignment', action: 'check_alignment' },
		{ label: 'Use simpler method', action: 'simple_method' }
	]
};