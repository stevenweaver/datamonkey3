/**
 * A utility to parse HyPhy command line output into structured data
 * for use with the UI components.
 */
export const hyphyOutputParser = {
  /**
   * Maps raw HyPhy output text to structured UI state
   * @param {string} output - Raw output from HyPhy
   * @returns {Object} Structured data for UI components
   */
  mapToUIState(output) {
    if (!output) return { status: 'initializing', progress: 0, message: 'Initializing...' };
    
    // Normalize line endings and split into lines
    const lines = output.replace(/\r\n/g, '\n').split('\n');
    
    // Extract state information
    const state = {
      status: this.determineStatus(lines),
      progress: this.extractProgress(lines),
      message: this.extractMainMessage(lines)
    };
    
    return state;
  },
  
  /**
   * Determine the current analysis status based on output content
   * @param {string[]} lines - Output lines
   * @returns {string} Status identifier
   */
  determineStatus(lines) {
    const text = lines.join(' ').toLowerCase();
    
    if (text.includes('analysis complete') || text.includes('results summary')) {
      return 'completed';
    }
    
    if (text.includes('error:') || text.includes('failed:') || text.includes('exception')) {
      return 'error';
    }
    
    if (text.includes('parsing') || text.includes('loading')) {
      return 'initializing';
    }
    
    if (text.includes('reading input') || text.includes('found') && text.includes('sequences')) {
      return 'mounting';
    }
    
    if (text.includes('processing results') || text.includes('computing statistics')) {
      return 'processing';
    }
    
    if (text.includes('saving') || text.includes('writing')) {
      return 'saving';
    }
    
    // Default to running
    return 'running';
  },
  
  /**
   * Extract progress percentage from output
   * @param {string[]} lines - Output lines
   * @returns {number} Progress percentage (0-100)
   */
  extractProgress(lines) {
    // Try to find progress indicators
    for (const line of lines) {
      // Look for explicit progress percentage
      const progressMatch = line.match(/progress:\s*(\d+)%/i);
      if (progressMatch && progressMatch[1]) {
        return parseInt(progressMatch[1], 10);
      }
      
      // Look for step indicators (e.g., "Step 25/100")
      const stepMatch = line.match(/step\s*(\d+)\/(\d+)/i);
      if (stepMatch && stepMatch[1] && stepMatch[2]) {
        const current = parseInt(stepMatch[1], 10);
        const total = parseInt(stepMatch[2], 10);
        return Math.round((current / total) * 100);
      }
    }
    
    // Check for completed language
    if (lines.join(' ').toLowerCase().includes('analysis complete')) {
      return 100;
    }
    
    // If we can't determine progress, return a default
    return 0;
  },
  
  /**
   * Extract the main message to display in the UI
   * @param {string[]} lines - Output lines
   * @returns {string} Main message for display
   */
  extractMainMessage(lines) {
    // For error states, find the error message
    const errorLine = lines.find(line => 
      line.toLowerCase().includes('error:') || 
      line.toLowerCase().includes('failed:')
    );
    
    if (errorLine) {
      return errorLine.trim();
    }
    
    // For completion, return the results summary
    if (lines.join(' ').toLowerCase().includes('analysis complete')) {
      const summaryLines = [];
      let inSummary = false;
      
      for (const line of lines) {
        if (line.toLowerCase().includes('results summary')) {
          inSummary = true;
          summaryLines.push(line.trim());
          continue;
        }
        
        if (inSummary && line.trim().startsWith('-')) {
          summaryLines.push(line.trim());
        }
      }
      
      if (summaryLines.length > 0) {
        return summaryLines.join(' ');
      }
      
      return 'Analysis completed successfully';
    }
    
    // For normal progress, look for the most relevant message
    // Prioritize lines with progress or step information
    for (const line of lines) {
      if (line.toLowerCase().includes('step') || line.toLowerCase().includes('progress')) {
        return line.trim();
      }
    }
    
    // If no special cases match, use the last line as the most recent info
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim()) {
        return lines[i].trim();
      }
    }
    
    return 'Processing...';
  },
  
  /**
   * Parse structured HyPhy JSON output
   * @param {Object} jsonOutput - JSON output from HyPhy
   * @returns {Object} Processed results for display
   */
  parseResults(jsonOutput) {
    if (!jsonOutput) return null;
    
    // This is a stub implementation
    // In a real implementation, this would parse the structured JSON output
    // and extract relevant information for display
    
    return {
      summary: jsonOutput.summary || 'No summary available',
      sites: jsonOutput.sites || [],
      charts: jsonOutput.charts || []
    };
  }
};