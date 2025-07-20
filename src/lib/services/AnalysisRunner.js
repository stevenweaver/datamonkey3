/**
 * Legacy AnalysisRunner - Simplified stub for backward compatibility
 * 
 * This has been replaced by UnifiedAnalysisRunner for the new backend integration.
 * Keeping this minimal version to avoid breaking existing imports.
 */

import { analysisStore } from '../../stores/analyses';

// Simplified analysis runner for backward compatibility
class AnalysisRunner {
	constructor() {
		this.isRunning = false;
	}

	// Stub method for backward compatibility
	startAnalysis(analysisId) {
		console.log('AnalysisRunner.startAnalysis called - use UnifiedAnalysisRunner instead');
		return analysisId;
	}

	// Stub method for backward compatibility  
	async processNextAnalysis() {
		console.log('AnalysisRunner.processNextAnalysis called - use UnifiedAnalysisRunner instead');
		return null;
	}

	// Cleanup method
	destroy() {
		// No cleanup needed in stub
	}
}

// Create and export a singleton instance
export const analysisRunner = new AnalysisRunner();