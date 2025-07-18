import DesignTokensComponent from './DesignTokens.svelte';

export default {
	title: 'Design System/Design Tokens',
	component: DesignTokensComponent,
	parameters: {
		layout: 'fullscreen'
	}
};

const Template = (args) => ({
	Component: DesignTokensComponent,
	props: args
});

export const Overview = Template.bind({});
Overview.args = {};
