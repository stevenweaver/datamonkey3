import '../app.css';
import FormOptions from '../lib/FormGenerator.svelte';

export default {
	title: 'Form Analysis/FormOptions',
	component: FormOptions
};

const Template = (args) => ({
	Component: FormOptions,
	props: args
});

export const Default = Template.bind({});
Default.args = {
	runMethod: () => {
		console.log('Running Form Analysis:');
	}
};
