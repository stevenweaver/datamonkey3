/**
 * Browser Automation Compatibility Helpers
 * 
 * These utilities help ensure proper event handling and timing
 * for browser automation tools like Browser MCP.
 */

/**
 * Wraps an async function to ensure proper completion signaling for browser automation
 * @param {Function} asyncFn - The async function to wrap
 * @param {number} delay - Delay in ms before executing (default: 10)
 * @returns {Function} Wrapped function that's browser automation friendly
 */
export function wrapForAutomation(asyncFn, delay = 10) {
	return function(event, ...args) {
		// Prevent default and stop propagation for proper event handling
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault();
			event.stopPropagation();
		}

		// Add visual feedback if possible
		const target = event?.target || event?.currentTarget;
		if (target) {
			target.style.pointerEvents = 'none';
			target.style.opacity = '0.7';
		}

		// Use setTimeout to ensure the event loop completes properly
		setTimeout(async () => {
			try {
				await asyncFn.call(this, event, ...args);
			} catch (error) {
				console.error('Error in automation-wrapped function:', error);
			} finally {
				// Restore button state
				if (target) {
					target.style.pointerEvents = '';
					target.style.opacity = '';
				}
			}
		}, delay);
	};
}

/**
 * Creates a delay that can be used in async operations
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after the delay
 */
export function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ensures DOM updates are completed before proceeding
 * @returns {Promise} Promise that resolves after DOM updates
 */
export function flushUpdates() {
	return new Promise(resolve => {
		requestAnimationFrame(() => {
			requestAnimationFrame(resolve);
		});
	});
}

/**
 * Adds automation-friendly attributes to an element
 * @param {HTMLElement} element - Element to enhance
 * @param {string} testId - Test ID for automation tools
 */
export function addAutomationAttributes(element, testId) {
	if (element && testId) {
		element.setAttribute('data-testid', testId);
		element.setAttribute('data-automation-ready', 'true');
	}
}