import '../app.css';
import AnalysisStatusIndicator from '../lib/AnalysisStatusIndicator.svelte';
import { writable } from 'svelte/store';

// Create a mock store for the stories
const createMockStore = (analyses) => {
	return {
		subscribe: writable(analyses).subscribe
	};
};

// Mock analyses for different states
const runningAnalyses = [
	{ id: '1', status: 'running', startTime: new Date().toISOString() },
	{ id: '2', status: 'mounting', startTime: new Date().toISOString() }
];

const completedAnalyses = [
	{ id: '3', status: 'completed', completedAt: new Date().getTime() },
	{ id: '4', status: 'completed', completedAt: new Date().getTime() }
];

const failedAnalyses = [{ id: '5', status: 'error', completedAt: new Date().getTime() }];

const mixedAnalyses = [...runningAnalyses, ...completedAnalyses, ...failedAnalyses];

// Export the default story configuration
export default {
	title: 'Analysis/StatusIndicator',
	component: AnalysisStatusIndicator,
	parameters: {
		docs: {
			description: {
				component: `
          ## Analysis Status Indicator
          
          A streamlined status indicator that displays in the navigation bar, showing:
          - Number of running analyses with a blue dot (⚡)
          - Number of completed analyses today with a green checkmark (✓)
          - Number of failed analyses with a warning symbol (⚠)
          
          This component follows Dieter Rams design principles:
          - Good Design Is Unobtrusive: Simple counter that doesn't distract
          - Good Design Is Honest: Shows exactly what's happening without decoration
          - Good Design Is As Little Design As Possible: Minimal UI with only essential information
        `
			}
		}
	},
	argTypes: {
		// Mock props for the stories
	}
};

// Create a template for all variants
const Template = (args) => ({
	Component: AnalysisStatusIndicator,
	props: args
});

// Export story variants
export const Running = (args) => {
	// Override the store with our mock for this story
	window.activeAnalyses = createMockStore(runningAnalyses);
	return Template.bind({})();
};
Running.parameters = {
	docs: {
		description: {
			story: 'Shows only running analyses with a blue pulsing dot.'
		}
	}
};

export const Completed = (args) => {
	window.activeAnalyses = createMockStore(completedAnalyses);
	return Template.bind({})();
};
Completed.parameters = {
	docs: {
		description: {
			story: 'Shows only completed analyses with a green checkmark.'
		}
	}
};

export const Failed = (args) => {
	window.activeAnalyses = createMockStore(failedAnalyses);
	return Template.bind({})();
};
Failed.parameters = {
	docs: {
		description: {
			story: 'Shows only failed analyses with a warning symbol.'
		}
	}
};

export const Mixed = (args) => {
	window.activeAnalyses = createMockStore(mixedAnalyses);
	return Template.bind({})();
};
Mixed.parameters = {
	docs: {
		description: {
			story: 'Shows all types of analyses with their respective indicators.'
		}
	}
};
