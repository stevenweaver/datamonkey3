import { writable } from 'svelte/store';
import io from 'socket.io-client';

// Store for backend connectivity status
export const backendConnectivity = writable({
	isConnected: false,
	isConnecting: false,
	serverUrl: 'http://localhost:7015',
	lastChecked: null,
	error: null
});

// Store the persistent socket instance
let persistentSocket = null;

// Function to initialize persistent backend connection
export function initializeBackendConnectivity(serverUrl = 'http://localhost:7015') {
	// Clean up existing socket if any
	if (persistentSocket) {
		persistentSocket.disconnect();
		persistentSocket = null;
	}

	backendConnectivity.update((state) => ({
		...state,
		isConnecting: true,
		error: null,
		serverUrl
	}));

	// Create persistent socket connection (like demo pages)
	persistentSocket = io(serverUrl, {
		timeout: 5000,
		reconnection: true,
		reconnectionDelay: 1000,
		reconnectionAttempts: 5
	});

	// Set up event handlers
	persistentSocket.on('connect', () => {
		console.log('✅ Backend connectivity: Connected to DataMonkey server');
		backendConnectivity.update((state) => ({
			...state,
			isConnected: true,
			isConnecting: false,
			lastChecked: new Date(),
			error: null
		}));
	});

	persistentSocket.on('disconnect', (reason) => {
		console.log('🔌 Backend connectivity: Disconnected from DataMonkey server', reason);
		backendConnectivity.update((state) => ({
			...state,
			isConnected: false,
			isConnecting: false,
			lastChecked: new Date(),
			error: `Disconnected: ${reason}`
		}));
	});

	persistentSocket.on('connect_error', (error) => {
		console.log('❌ Backend connectivity: Connection failed', error);
		backendConnectivity.update((state) => ({
			...state,
			isConnected: false,
			isConnecting: false,
			lastChecked: new Date(),
			error: error.message || 'Connection failed'
		}));
	});

	persistentSocket.on('reconnect', (attemptNumber) => {
		console.log('🔄 Backend connectivity: Reconnected after', attemptNumber, 'attempts');
		backendConnectivity.update((state) => ({
			...state,
			isConnected: true,
			isConnecting: false,
			lastChecked: new Date(),
			error: null
		}));
	});

	persistentSocket.on('reconnecting', (attemptNumber) => {
		console.log('🔄 Backend connectivity: Reconnecting attempt', attemptNumber);
		backendConnectivity.update((state) => ({
			...state,
			isConnected: false,
			isConnecting: true,
			error: `Reconnecting (attempt ${attemptNumber})`
		}));
	});

	persistentSocket.on('reconnect_error', (error) => {
		console.log('❌ Backend connectivity: Reconnection failed', error);
		backendConnectivity.update((state) => ({
			...state,
			isConnected: false,
			isConnecting: false,
			error: `Reconnection failed: ${error.message || error}`
		}));
	});

	persistentSocket.on('reconnect_failed', () => {
		console.log('❌ Backend connectivity: Reconnection failed after all attempts');
		backendConnectivity.update((state) => ({
			...state,
			isConnected: false,
			isConnecting: false,
			error: 'Connection failed after all retry attempts'
		}));
	});

	return persistentSocket;
}

// Function to get current connection status
export function getConnectionStatus() {
	return persistentSocket ? persistentSocket.connected : false;
}

// Function to manually reconnect
export function reconnectBackend() {
	if (persistentSocket) {
		persistentSocket.connect();
	}
}

// Function to disconnect
export function disconnectBackend() {
	if (persistentSocket) {
		persistentSocket.disconnect();
		persistentSocket = null;
	}
	backendConnectivity.update((state) => ({
		...state,
		isConnected: false,
		isConnecting: false,
		error: null
	}));
}
