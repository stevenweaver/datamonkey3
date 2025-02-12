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
