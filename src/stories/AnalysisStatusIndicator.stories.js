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
	{ id: '1', status: 'running', method: 'FEL', startTime: new Date().toISOString() },
	{ id: '2', status: 'mounting', method: 'SLAC', startTime: new Date().toISOString() }
];

const completedAnalyses = [
	{ id: '3', status: 'completed', method: 'MEME', completedAt: new Date().toISOString() },
	{ id: '4', status: 'completed', method: 'BUSTED', completedAt: new Date().toISOString() },
	{ id: '5', status: 'completed', method: 'FEL', completedAt: new Date().toISOString() }
];

const failedAnalyses = [
	{ id: '6', status: 'error', method: 'FEL', completedAt: new Date().toISOString() },
	{ id: '7', status: 'error', method: 'SLAC', completedAt: new Date().toISOString() }
];

const mixedAnalyses = [...runningAnalyses, ...completedAnalyses, ...failedAnalyses];

// Mock datareader analyses that should be ignored
const withDatareaderAnalyses = [
	...mixedAnalyses,
	{ id: '8', status: 'running', method: 'datareader', startTime: new Date().toISOString() },
	{ id: '9', status: 'completed', method: 'datareader', completedAt: new Date().toISOString() }
];

// Export the default story configuration
export default {
	title: 'Progress Indicators/AnalysisStatusIndicator',
	component: AnalysisStatusIndicator,
	parameters: {
		docs: {
			description: {
				component: `
          ## Analysis Status Indicator
          
          A streamlined status indicator that displays in the navigation bar, showing:
          - Number of running analyses with a blue pulsing dot
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
			story: 'Shows all types of analyses with their respective indicators: 2 running, 3 completed today, and 2 failed.'
		}
	}
};

export const WithDatareader = (args) => {
	window.activeAnalyses = createMockStore(withDatareaderAnalyses);
	return Template.bind({})();
};
WithDatareader.parameters = {
	docs: {
		description: {
			story: 'Shows that datareader analyses are correctly filtered out and not displayed in the counts.'
		}
	}
};

export const NoAnalyses = (args) => {
	window.activeAnalyses = createMockStore([]);
	return Template.bind({})();
};
NoAnalyses.parameters = {
	docs: {
		description: {
			story: 'Component behavior when there are no analyses to display (indicator should be hidden).'
		}
	}
};
