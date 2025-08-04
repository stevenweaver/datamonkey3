import { writable } from 'svelte/store';
import io from 'socket.io-client';

// Store for backend connectivity status
export const backendConnectivity = writable({
	isConnected: false,
	isChecking: false,
	serverUrl: 'http://localhost:7015',
	lastChecked: null,
	error: null
});

// Store the current socket instance
let currentSocket = null;

// Function to check backend connectivity
export function checkBackendConnectivity(serverUrl = 'http://localhost:7015') {
	backendConnectivity.update((state) => ({
		...state,
		isChecking: true,
		error: null
	}));

	// Clean up existing socket
	if (currentSocket) {
		currentSocket.disconnect();
		currentSocket = null;
	}

	// Create new socket connection (similar to demo pages)
	currentSocket = io(serverUrl, {
		timeout: 5000,
		forceNew: true
	});

	// Set up event handlers
	currentSocket.on('connect', () => {
		console.log('✅ Backend connectivity check: Connected to DataMonkey server');
		backendConnectivity.update((state) => ({
			...state,
			isConnected: true,
			isChecking: false,
			lastChecked: new Date(),
			error: null
		}));
		// Keep connection alive for a moment to ensure it's stable, then disconnect
		setTimeout(() => {
			if (currentSocket) {
				currentSocket.disconnect();
			}
		}, 1000);
	});

	currentSocket.on('connect_error', (error) => {
		console.log('❌ Backend connectivity check: Connection failed', error);
		backendConnectivity.update((state) => ({
			...state,
			isConnected: false,
			isChecking: false,
			lastChecked: new Date(),
			error: error.message || 'Connection failed'
		}));
	});

	currentSocket.on('disconnect', () => {
		// Only update if we're not in the middle of checking
		// (since we disconnect intentionally after successful check)
		backendConnectivity.update((state) => {
			if (!state.isChecking) {
				return {
					...state,
					isConnected: false
				};
			}
			return state;
		});
	});

	// Connection happens automatically with the new socket

	// Timeout fallback
	setTimeout(() => {
		backendConnectivity.update((state) => {
			if (state.isChecking) {
				if (currentSocket) {
					currentSocket.disconnect();
				}
				return {
					...state,
					isConnected: false,
					isChecking: false,
					lastChecked: new Date(),
					error: 'Connection timeout'
				};
			}
			return state;
		});
	}, 5000);
}

// Function to start periodic connectivity checks
export function startPeriodicConnectivityCheck(intervalMs = 30000) {
	// Check immediately
	checkBackendConnectivity();

	// Then check periodically
	return setInterval(() => {
		checkBackendConnectivity();
	}, intervalMs);
}

// Function to stop periodic checks
export function stopPeriodicConnectivityCheck(intervalId) {
	if (intervalId) {
		clearInterval(intervalId);
	}
	if (currentSocket) {
		currentSocket.disconnect();
		currentSocket = null;
	}
}
