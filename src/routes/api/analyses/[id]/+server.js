/**
 * Individual Analysis API - Manage specific analysis by ID
 * GET /api/analyses/[id] - Get analysis status and results
 * PATCH /api/analyses/[id] - Update analysis status
 * DELETE /api/analyses/[id] - Cancel/delete analysis
 */

import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	try {
		const { id } = params;
		
		if (!id) {
			return json(
				{ error: 'Analysis ID is required' },
				{ status: 400 }
			);
		}

		// In real implementation, query database for analysis
		// For prototype, simulate based on ID patterns
		const analysis = await getAnalysisById(id);
		
		if (!analysis) {
			return json(
				{ error: 'Analysis not found' },
				{ status: 404 }
			);
		}

		// If backend job, poll backend server for current status
		if (analysis.processingLocation === 'backend' && analysis.backendJobId) {
			const backendStatus = await pollBackendStatus(analysis.backendJobId);
			analysis.backendStatus = backendStatus.status;
			analysis.progress = backendStatus.progress;
			analysis.message = backendStatus.message;
			analysis.logs = backendStatus.logs || analysis.logs;
			
			// Update local status based on backend status
			if (backendStatus.status === 'completed') {
				analysis.status = 'completed';
				analysis.completedAt = backendStatus.completedAt;
				analysis.result = backendStatus.result;
			} else if (backendStatus.status === 'error') {
				analysis.status = 'error';
				analysis.error = backendStatus.error;
			}
		}

		return json({
			success: true,
			analysis
		});

	} catch (error) {
		console.error('Error fetching analysis:', error);
		return json(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	try {
		const { id } = params;
		const updates = await request.json();
		
		if (!id) {
			return json(
				{ error: 'Analysis ID is required' },
				{ status: 400 }
			);
		}

		// Get current analysis
		const analysis = await getAnalysisById(id);
		if (!analysis) {
			return json(
				{ error: 'Analysis not found' },
				{ status: 404 }
			);
		}

		// Apply updates
		const updatedAnalysis = {
			...analysis,
			...updates,
			updatedAt: new Date().getTime()
		};

		// If this is a backend job and we're updating status, also update backend
		if (analysis.processingLocation === 'backend' && updates.status) {
			await updateBackendJobStatus(analysis.backendJobId, updates.status);
		}

		// Save updated analysis (in real implementation, save to database)
		console.log('Analysis updated:', updatedAnalysis);

		return json({
			success: true,
			analysis: updatedAnalysis,
			message: 'Analysis updated successfully'
		});

	} catch (error) {
		console.error('Error updating analysis:', error);
		return json(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params }) {
	try {
		const { id } = params;
		
		if (!id) {
			return json(
				{ error: 'Analysis ID is required' },
				{ status: 400 }
			);
		}

		// Get analysis to check if it's backend job
		const analysis = await getAnalysisById(id);
		if (!analysis) {
			return json(
				{ error: 'Analysis not found' },
				{ status: 404 }
			);
		}

		// If backend job, cancel on backend server
		if (analysis.processingLocation === 'backend' && analysis.backendJobId) {
			await cancelBackendJob(analysis.backendJobId);
		}

		// Delete from local storage (in real implementation, delete from database)
		console.log('Analysis deleted:', id);

		return json({
			success: true,
			message: 'Analysis deleted successfully'
		});

	} catch (error) {
		console.error('Error deleting analysis:', error);
		return json(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}

/**
 * Get analysis by ID (prototype implementation)
 */
async function getAnalysisById(id) {
	// This would query actual database in real implementation
	// For prototype, return mock data based on ID pattern
	
	if (id.startsWith('backend-')) {
		return {
			id,
			fileId: 'file-456',
			method: 'busted',
			status: 'running',
			processingLocation: 'backend',
			backendJobId: `job-${id}`,
			createdAt: Date.now() - 120000, // 2 minutes ago
			progress: 45,
			message: 'Processing phylogenetic analysis...',
			logs: [
				{ time: new Date(Date.now() - 120000).toISOString(), message: 'Job submitted to queue', status: 'queued' },
				{ time: new Date(Date.now() - 90000).toISOString(), message: 'Analysis started', status: 'running' },
				{ time: new Date(Date.now() - 30000).toISOString(), message: 'Processing trees...', status: 'running' }
			]
		};
	} else {
		return {
			id,
			fileId: 'file-123',
			method: 'fel',
			status: 'completed',
			processingLocation: 'local',
			createdAt: Date.now() - 300000, // 5 minutes ago
			completedAt: Date.now() - 60000, // 1 minute ago
			progress: 100,
			message: 'Analysis completed successfully',
			result: {
				// Mock result data
				tested: { sites: 150 },
				positive_sites: 12,
				log_likelihood: -1234.56
			}
		};
	}
}

/**
 * Poll backend server for job status
 */
async function pollBackendStatus(backendJobId) {
	const backendServerUrl = process.env.VITE_DATAMONKEY_SERVER_URL;
	
	if (!backendServerUrl) {
		throw new Error('Backend server URL not configured');
	}

	try {
		// In real implementation, make HTTP request to backend
		// For prototype, simulate progressive status updates
		
		console.log(`[PROTOTYPE] Polling backend status for job: ${backendJobId}`);
		
		// Simulate different statuses based on time
		const elapsed = Date.now() % 180000; // 3 minute cycle
		
		if (elapsed < 30000) {
			return {
				status: 'queued',
				progress: 0,
				message: 'Job queued on backend server',
				queuePosition: 2
			};
		} else if (elapsed < 150000) {
			const progress = Math.floor((elapsed - 30000) / 1200); // Progress over 2 minutes
			return {
				status: 'running',
				progress: Math.min(progress, 95),
				message: `Processing analysis... (${Math.min(progress, 95)}% complete)`,
				logs: [
					{ time: new Date().toISOString(), message: 'Backend processing in progress', status: 'running' }
				]
			};
		} else {
			return {
				status: 'completed',
				progress: 100,
				message: 'Analysis completed successfully',
				completedAt: new Date().toISOString(),
				result: {
					tested: { sites: 200 },
					positive_sites: 15,
					log_likelihood: -2345.67,
					backend_processed: true
				}
			};
		}

	} catch (error) {
		console.error('Backend status poll failed:', error);
		return {
			status: 'error',
			progress: 0,
			message: 'Failed to get status from backend server',
			error: error.message
		};
	}
}

/**
 * Update backend job status
 */
async function updateBackendJobStatus(backendJobId, status) {
	const backendServerUrl = process.env.VITE_DATAMONKEY_SERVER_URL;
	
	if (!backendServerUrl) {
		console.warn('Backend server URL not configured, skipping backend status update');
		return;
	}

	console.log(`[PROTOTYPE] Would update backend job ${backendJobId} status to: ${status}`);
	
	// In real implementation:
	// await fetch(`${backendServerUrl}/jobs/${backendJobId}`, {
	//   method: 'PATCH',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify({ status })
	// });
}

/**
 * Cancel backend job
 */
async function cancelBackendJob(backendJobId) {
	const backendServerUrl = process.env.VITE_DATAMONKEY_SERVER_URL;
	
	if (!backendServerUrl) {
		console.warn('Backend server URL not configured, skipping backend job cancellation');
		return;
	}

	console.log(`[PROTOTYPE] Would cancel backend job: ${backendJobId}`);
	
	// In real implementation:
	// await fetch(`${backendServerUrl}/jobs/${backendJobId}`, {
	//   method: 'DELETE'
	// });
}