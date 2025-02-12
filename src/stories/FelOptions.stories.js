import "../app.css";
import FelOptions from "../lib/FelOptions.svelte";

export default {
	title: "FEL Analysis/FelOptions",
	component: FelOptions,
};

const Template = (args) => ({
	Component: FelOptions,
	props: args,
});

export const Default = Template.bind({});
Default.args = {
	runMethod: (options) => {
		console.log("Running FEL Analysis with options:", options);
	},
};

// Add additional stories to showcase different states if needed

export const WithEmail = Template.bind({});
WithEmail.args = {
	runFEL: (options) => {
		console.log("Running FEL Analysis with options:", options);
	},
};

export const WithAdvancedOptions = Template.bind({});
WithAdvancedOptions.args = {
	runMethod: (options) => {
		console.log("Running FEL Analysis with options:", options);
		// Example values to demo advanced options
		return {
			resample: 100,
			confidenceInterval: true,
		};
	},
};
