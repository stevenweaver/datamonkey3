import '../app.css';
import BackendConnectivityIndicator from '../lib/BackendConnectivityIndicator.svelte';
import { writable } from 'svelte/store';

// Create a mock store for the connectivity status
const createConnectivityStore = (data) => {
	return {
		subscribe: writable(data).subscribe
	};
};

// Mock connectivity states
const connectedState = {
	isConnected: true,
	isConnecting: false,
	serverUrl: 'https://datamonkey.temple.edu',
	lastChecked: new Date(),
	error: null
};

const connectingState = {
	isConnected: false,
	isConnecting: true,
	serverUrl: 'https://datamonkey.temple.edu',
	lastChecked: null,
	error: null
};

const disconnectedState = {
	isConnected: false,
	isConnecting: false,
	serverUrl: 'https://datamonkey.temple.edu',
	lastChecked: new Date(Date.now() - 60000), // 1 minute ago
	error: 'Connection refused'
};

const disconnectedNoErrorState = {
	isConnected: false,
	isConnecting: false,
	serverUrl: 'https://datamonkey.temple.edu',
	lastChecked: new Date(Date.now() - 30000), // 30 seconds ago
	error: null
};

// Story configuration
export default {
	title: 'Progress Indicators/BackendConnectivityIndicator',
	component: BackendConnectivityIndicator,
	parameters: {
		docs: {
			description: {
				component: `
          ## Backend Connectivity Indicator
          
          Shows the connection status to the DataMonkey server with a visual indicator.
          
          Features:
          - **Green dot**: Connected to server
          - **Yellow pulsing dot**: Connecting to server
          - **Red dot**: Disconnected from server
          - **Hover tooltip**: Shows server URL and last checked time
          - **Error details**: When disconnected, shows the error reason
          
          This component follows Dieter Rams design principles by being unobtrusive and honest about the connection state.
        `
			}
		}
	}
};

// Template for all stories
const Template = (args) => ({
	Component: BackendConnectivityIndicator,
	props: args
});

// Story variants
export const Connected = (args) => {
	// Override the store with our mock for this story
	window.backendConnectivity = createConnectivityStore(connectedState);
	return Template.bind({})();
};
Connected.parameters = {
	docs: {
		description: {
			story: 'Shows a green dot when successfully connected to the DataMonkey server.'
		}
	}
};

export const Connecting = (args) => {
	window.backendConnectivity = createConnectivityStore(connectingState);
	return Template.bind({})();
};
Connecting.parameters = {
	docs: {
		description: {
			story: 'Shows a yellow pulsing dot while attempting to connect to the server.'
		}
	}
};

export const DisconnectedWithError = (args) => {
	window.backendConnectivity = createConnectivityStore(disconnectedState);
	return Template.bind({})();
};
DisconnectedWithError.parameters = {
	docs: {
		description: {
			story: 'Shows a red dot when disconnected from the server with an error message.'
		}
	}
};

export const DisconnectedNoError = (args) => {
	window.backendConnectivity = createConnectivityStore(disconnectedNoErrorState);
	return Template.bind({})();
};
DisconnectedNoError.parameters = {
	docs: {
		description: {
			story: 'Shows a red dot when disconnected from the server without a specific error.'
		}
	}
};