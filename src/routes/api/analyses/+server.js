/**
 * Analysis API - Main endpoint for creating and managing analyses
 * POST /api/analyses - Create new analysis job
 * GET /api/analyses - List analyses (optional)
 */

import { json } from '@sveltejs/kit';
import { backendSocketService } from '../../../lib/services/BackendSocketService';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, fetch, url }) {
	try {
		const body = await request.json();
		const { fileId, method, options = {}, processingLocation = 'local' } = body;

		// Validate required fields
		if (!fileId || !method) {
			return json(
				{ error: 'Missing required fields: fileId and method are required' },
				{ status: 400 }
			);
		}

		// Generate analysis ID
		const analysisId = crypto.randomUUID();
		
		// Create base analysis object
		const analysis = {
			id: analysisId,
			fileId,
			method,
			status: 'pending',
			processingLocation,
			createdAt: new Date().getTime(),
			options: options || {}
		};

		if (processingLocation === 'backend') {
			// Submit to backend datamonkey-js-server via Socket.IO
			try {
				await backendSocketService.connect();
				
				// For now, we'll just mark it as submitted
				// The actual job submission will happen in the UnifiedAnalysisRunner
				analysis.backendJobId = analysisId; // Use analysis ID as job ID
				analysis.backendStatus = 'submitted';
			} catch (error) {
				console.error('Backend connection failed:', error);
				// Fall back to local processing
				analysis.processingLocation = 'local';
				analysis.fallbackReason = 'Backend server unavailable';
			}
		}

		// Save analysis to storage (this would be database in real implementation)
		// For now, we'll simulate this since IndexedDB is client-side only
		console.log('Analysis created:', analysis);

		return json({
			success: true,
			analysis,
			message: `Analysis ${analysisId} created successfully for ${processingLocation} processing`
		});

	} catch (error) {
		console.error('Error creating analysis:', error);
		return json(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		// In a real implementation, this would query the database
		// For prototype, return mock data
		const analyses = [
			{
				id: 'example-1',
				fileId: 'file-123',
				method: 'fel',
				status: 'completed',
				processingLocation: 'local',
				createdAt: Date.now() - 300000, // 5 minutes ago
				completedAt: Date.now() - 60000 // 1 minute ago
			}
		];

		return json({
			success: true,
			analyses,
			count: analyses.length
		});

	} catch (error) {
		console.error('Error fetching analyses:', error);
		return json(
			{ error: 'Internal server error', details: error.message },
			{ status: 500 }
		);
	}
}

/**
 * Submit analysis to backend datamonkey-js-server
 * This is a prototype implementation - would need actual server integration
 */
async function submitToBackendServer(analysis, options) {
	// This would make actual HTTP requests to datamonkey-js-server
	// For prototype, we'll simulate the response
	
	const backendServerUrl = process.env.VITE_DATAMONKEY_SERVER_URL;
	
	if (!backendServerUrl) {
		throw new Error('Backend server URL not configured');
	}

	try {
		// Simulated backend job submission
		// In reality, this would:
		// 1. Upload file to backend server
		// 2. Submit job with parameters  
		// 3. Return job ID and initial status
		
		const mockBackendJob = {
			id: `backend-${crypto.randomUUID()}`,
			status: 'queued',
			submittedAt: new Date().toISOString(),
			estimatedDuration: estimateBackendDuration(analysis.method),
			queuePosition: Math.floor(Math.random() * 5) + 1
		};

		console.log(`[PROTOTYPE] Would submit to ${backendServerUrl}/analyses:`, {
			analysisId: analysis.id,
			method: analysis.method,
			fileId: analysis.fileId,
			options
		});

		return mockBackendJob;

	} catch (error) {
		console.error('Backend submission failed:', error);
		throw new Error(`Failed to submit job to backend server: ${error.message}`);
	}
}

/**
 * Estimate backend processing duration based on method
 */
function estimateBackendDuration(method) {
	const durations = {
		slac: 30000,     // 30 seconds
		fel: 60000,      // 1 minute
		meme: 300000,    // 5 minutes
		fubar: 600000,   // 10 minutes
		absrel: 1800000, // 30 minutes
		busted: 1200000, // 20 minutes
		gard: 3600000,   // 1 hour
		bgm: 7200000     // 2 hours
	};
	
	return durations[method.toLowerCase()] || 600000; // Default 10 minutes
}