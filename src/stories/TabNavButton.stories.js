import TabNavButton from '../lib/TabNavButton.svelte';

export default {
	title: 'Components/TabNavButton',
	component: TabNavButton,
	parameters: {
		docs: {
			description: {
				component: 'A navigation button component with directional styling and step indicators.'
			}
		}
	},
	argTypes: {
		direction: {
			control: 'select',
			options: ['forward', 'back']
		},
		label: { control: 'text' },
		disabled: { control: 'boolean' },
		tooltip: { control: 'text' },
		step: {
			control: 'select',
			options: [null, 1, 2, 3]
		}
	}
};

const Template = (args) => ({
	Component: TabNavButton,
	props: {
		...args,
		onClick: args.onClick || (() => console.log('Button clicked'))
	}
});

export const ForwardButton = Template.bind({});
ForwardButton.args = {
	direction: 'forward',
	label: 'Continue',
	disabled: false,
	tooltip: 'Proceed to next step',
	step: null
};

export const BackButton = Template.bind({});
BackButton.args = {
	direction: 'back',
	label: 'Back',
	disabled: false,
	tooltip: 'Return to previous step',
	step: null
};

export const WithStepNumber = Template.bind({});
WithStepNumber.args = {
	direction: 'forward',
	label: 'Upload Files',
	disabled: false,
	tooltip: 'Step 1: Upload your sequence files',
	step: 1
};

export const DisabledForward = Template.bind({});
DisabledForward.args = {
	direction: 'forward',
	label: 'Continue',
	disabled: true,
	tooltip: 'Complete current step to continue',
	step: null
};

export const DisabledBack = Template.bind({});
DisabledBack.args = {
	direction: 'back',
	label: 'Back',
	disabled: true,
	tooltip: 'Cannot go back from first step',
	step: null
};

export const StepTwo = Template.bind({});
StepTwo.args = {
	direction: 'forward',
	label: 'Select Method',
	disabled: false,
	tooltip: 'Step 2: Choose analysis method',
	step: 2
};

export const StepThree = Template.bind({});
StepThree.args = {
	direction: 'forward',
	label: 'Run Analysis',
	disabled: false,
	tooltip: 'Step 3: Execute analysis',
	step: 3
};

export const BackWithStep = Template.bind({});
BackWithStep.args = {
	direction: 'back',
	label: 'Previous Step',
	disabled: false,
	tooltip: 'Return to step 1',
	step: 2
};
