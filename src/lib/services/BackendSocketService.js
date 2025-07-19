/**
 * BackendSocketService - Socket.IO client for communicating with datamonkey-js-server
 * 
 * Handles connection, job submission, status updates, and results retrieval
 * for analyses processed on the backend server.
 */

import { io } from 'socket.io-client';
import { DATAMONKEY_SERVER_URL } from '../config/env.js';
import { browser } from '$app/environment';

export class BackendSocketService {
	constructor() {
		this.socket = null;
		this.connectionState = 'disconnected'; // 'disconnected', 'connecting', 'connected', 'error'
		this.activeJobs = new Map(); // Track active jobs and their callbacks
		this.connectionPromise = null;
	}

	/**
	 * Connect to the backend server
	 */
	async connect() {
		if (!browser) {
			throw new Error('Socket.IO connection only available in browser');
		}

		if (this.connectionState === 'connected') {
			return this.socket;
		}

		if (this.connectionPromise) {
			return this.connectionPromise;
		}

		this.connectionPromise = new Promise((resolve, reject) => {
			try {
				this.connectionState = 'connecting';

				this.socket = io(DATAMONKEY_SERVER_URL, {
					autoConnect: true,
					timeout: 10000, // 10 second timeout
					transports: ['websocket', 'polling'] // Try websocket first, fallback to polling
				});

				// Connection successful
				this.socket.on('connect', () => {
					console.log('Connected to datamonkey-js-server:', DATAMONKEY_SERVER_URL);
					this.connectionState = 'connected';
					resolve(this.socket);
				});

				// Server confirms connection
				this.socket.on('connected', () => {
					console.log('Server confirmed connection');
				});

				// Connection failed
				this.socket.on('connect_error', (error) => {
					console.error('Failed to connect to datamonkey-js-server:', error);
					this.connectionState = 'error';
					reject(new Error(`Connection failed: ${error.message}`));
				});

				// Disconnection
				this.socket.on('disconnect', (reason) => {
					console.log('Disconnected from datamonkey-js-server:', reason);
					this.connectionState = 'disconnected';
					this.connectionPromise = null;
				});

				// Setup job event listeners
				this._setupJobEventListeners();

			} catch (error) {
				this.connectionState = 'error';
				this.connectionPromise = null;
				reject(error);
			}
		});

		return this.connectionPromise;
	}

	/**
	 * Submit FEL analysis job to backend
	 */
	async submitFelAnalysis(analysisId, fileContent, options = {}) {
		await this.connect();

		return new Promise((resolve, reject) => {
			try {
				// Prepare job parameters
				const jobParams = {
					analysis_type: 'fel',
					genetic_code: options.geneticCode || 'Universal',
					...options.additionalParams
				};

				console.log('Submitting FEL analysis to backend:', { analysisId, jobParams });

				// Setup job tracking
				this.activeJobs.set(analysisId, {
					resolve,
					reject,
					startTime: Date.now(),
					method: 'fel'
				});

				// Create a mock stream for file content (in real implementation, would use socket.io-stream)
				// For now, we'll send as a regular event with file content
				this.socket.emit('fel:spawn', {
					jobId: analysisId,
					fileContent,
					params: jobParams
				});

				// Set timeout for job submission (2 minutes)
				setTimeout(() => {
					if (this.activeJobs.has(analysisId)) {
						this.activeJobs.delete(analysisId);
						reject(new Error('Job submission timeout'));
					}
				}, 120000);

			} catch (error) {
				this.activeJobs.delete(analysisId);
				reject(error);
			}
		});
	}

	/**
	 * Cancel a running job
	 */
	async cancelJob(analysisId) {
		if (!this.socket || this.connectionState !== 'connected') {
			throw new Error('Not connected to backend server');
		}

		console.log('Cancelling job:', analysisId);
		this.socket.emit('fel:cancel', { jobId: analysisId });
		
		// Clean up local tracking
		this.activeJobs.delete(analysisId);
	}

	/**
	 * Check if server is available
	 */
	async isServerAvailable() {
		try {
			if (this.connectionState === 'connected') {
				return true;
			}

			// Try to connect with a short timeout
			const originalTimeout = this.socket?.timeout;
			await this.connect();
			return this.connectionState === 'connected';

		} catch (error) {
			console.warn('Backend server availability check failed:', error);
			return false;
		}
	}

	/**
	 * Disconnect from server
	 */
	disconnect() {
		if (this.socket) {
			console.log('Disconnecting from datamonkey-js-server');
			this.socket.disconnect();
			this.socket = null;
		}
		this.connectionState = 'disconnected';
		this.connectionPromise = null;
		this.activeJobs.clear();
	}

	/**
	 * Get connection status
	 */
	getConnectionState() {
		return {
			state: this.connectionState,
			connected: this.connectionState === 'connected',
			activeJobs: Array.from(this.activeJobs.keys()),
			serverUrl: DATAMONKEY_SERVER_URL
		};
	}

	/**
	 * Setup event listeners for job status updates
	 */
	_setupJobEventListeners() {
		if (!this.socket) return;

		// Status updates from server
		this.socket.on('status update', (data) => {
			console.log('Status update received:', data);
			
			const jobId = data.jobId || data.id;
			if (jobId && this.activeJobs.has(jobId)) {
				const job = this.activeJobs.get(jobId);
				
				// Notify progress via callback if provided
				if (job.onProgress) {
					job.onProgress({
						status: data.status || 'running',
						progress: data.progress || 0,
						message: data.message || 'Processing...',
						logs: data.logs || []
					});
				}
			}
		});

		// Job completion
		this.socket.on('completed', (data) => {
			console.log('Job completed:', data);
			
			const jobId = data.jobId || data.id;
			if (jobId && this.activeJobs.has(jobId)) {
				const job = this.activeJobs.get(jobId);
				job.resolve({
					success: true,
					result: data.result || data,
					completedAt: new Date().toISOString(),
					message: 'Analysis completed successfully'
				});
				this.activeJobs.delete(jobId);
			}
		});

		// Job error
		this.socket.on('script error', (data) => {
			console.error('Job error:', data);
			
			const jobId = data.jobId || data.id;
			if (jobId && this.activeJobs.has(jobId)) {
				const job = this.activeJobs.get(jobId);
				job.reject(new Error(data.error || data.message || 'Analysis failed'));
				this.activeJobs.delete(jobId);
			}
		});

		// Generic error handling
		this.socket.on('error', (error) => {
			console.error('Socket error:', error);
		});
	}

	/**
	 * Add progress callback to an active job
	 */
	addProgressCallback(analysisId, callback) {
		const job = this.activeJobs.get(analysisId);
		if (job) {
			job.onProgress = callback;
		}
	}

	/**
	 * Get list of supported analysis methods
	 */
	getSupportedMethods() {
		// For now, just FEL as requested
		return ['fel'];
	}
}

// Export singleton instance
export const backendSocketService = new BackendSocketService();