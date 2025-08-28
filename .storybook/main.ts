import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'],

    addons: [
        '@storybook/addon-svelte-csf',
        '@chromatic-com/storybook',
        '@storybook/addon-docs'
    ],

    framework: {
		name: '@storybook/sveltekit',
		options: {}
	}
};
export default config;
