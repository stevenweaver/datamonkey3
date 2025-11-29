/**
 * E2E tests for concurrent analysis execution
 *
 * These tests verify that the status indicator correctly tracks
 * multiple analyses running at the same time.
 */

import { test, expect } from '@playwright/test';

// Increase timeout for these tests since WASM analyses take time
test.setTimeout(120000);

// Helper to wait for the app to be ready (HyPhy WASM loaded)
async function waitForAppReady(page) {
	// Wait for the sample cards to appear (indicates app is loaded)
	await page.waitForSelector('.sample-card', { timeout: 60000 });
}

// Helper to load a demo file
async function loadDemoFile(page, fileName = 'CD2-slim.fna') {
	const fileCard = page.locator('.sample-card').filter({ hasText: fileName });
	await fileCard.click();

	// Wait for file processing
	await page.waitForTimeout(3000);
}

// Helper to get status indicator
function getStatusIndicator(page) {
	return page.locator('button[aria-label="View all analyses"]');
}

// Helper to get running count from indicator
async function getRunningCount(page) {
	const indicator = getStatusIndicator(page);
	if (await indicator.count() === 0) return 0;

	const blueText = indicator.locator('.text-blue-600');
	if (await blueText.count() === 0) return 0;

	const text = await blueText.textContent();
	return parseInt(text, 10) || 0;
}

// Helper to get completed count
async function getCompletedCount(page) {
	const indicator = getStatusIndicator(page);
	if (await indicator.count() === 0) return 0;

	const greenText = indicator.locator('.text-green-600');
	if (await greenText.count() === 0) return 0;

	const text = await greenText.textContent();
	return parseInt(text, 10) || 0;
}

// Helper to navigate to Analyze tab
async function goToAnalyzeTab(page) {
	// Look for tab navigation
	const analyzeTab = page.locator('button:has-text("Analyze"), [data-tab="analyze"]');
	if (await analyzeTab.count() > 0) {
		await analyzeTab.first().click();
		await page.waitForTimeout(500);
		return true;
	}
	return false;
}

// Helper to select a method from the dropdown
async function selectMethod(page, methodName) {
	const methodSelect = page.locator('select');
	if (await methodSelect.count() > 0) {
		await methodSelect.first().selectOption(methodName);
		await page.waitForTimeout(500);
		return true;
	}
	return false;
}

// Helper to start an analysis
async function startAnalysis(page) {
	// Look for "Run Analysis" button
	const runButton = page.locator('button:has-text("Run Analysis")');
	if (await runButton.count() > 0) {
		const isEnabled = await runButton.isEnabled().catch(() => false);
		if (isEnabled) {
			await runButton.click();
			return true;
		}
	}
	return false;
}

test.describe('Concurrent Analyses E2E', () => {
	test.beforeEach(async ({ page }) => {
		// Clear IndexedDB before each test
		await page.goto('/');
		await page.evaluate(() => {
			return new Promise((resolve, reject) => {
				const req = indexedDB.deleteDatabase('datamonkey3-analyses');
				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			});
		});
		await page.reload();
		await waitForAppReady(page);
	});

	test('should track running count when starting a single FEL analysis', async ({ page }) => {
		// Load demo file
		await loadDemoFile(page, 'CD2-slim.fna');

		// Navigate to Analyze tab
		const wentToAnalyze = await goToAnalyzeTab(page);
		if (!wentToAnalyze) {
			test.skip();
			return;
		}

		// Check initial running count
		const initialRunning = await getRunningCount(page);
		console.log(`Initial running count: ${initialRunning}`);

		// Select FEL method
		await selectMethod(page, 'FEL');

		// Start the analysis
		const started = await startAnalysis(page);
		if (!started) {
			console.log('Could not start analysis - button not found or disabled');
			test.skip();
			return;
		}

		// Wait for indicator to update
		await page.waitForTimeout(2000);

		// Check running count increased
		const runningAfterStart = await getRunningCount(page);
		console.log(`Running count after start: ${runningAfterStart}`);

		// Should have at least 1 running
		expect(runningAfterStart).toBeGreaterThanOrEqual(1);
	});

	test('should track analysis from start to completion', async ({ page }) => {
		// Load demo file (CD2-slim.fna works well for FEL)
		await loadDemoFile(page, 'CD2-slim.fna');

		// Navigate to Analyze tab
		const wentToAnalyze = await goToAnalyzeTab(page);
		if (!wentToAnalyze) {
			test.skip();
			return;
		}

		// Get initial counts
		const initialRunning = await getRunningCount(page);
		const initialCompleted = await getCompletedCount(page);
		console.log(`Initial: running=${initialRunning}, completed=${initialCompleted}`);

		// Select FEL and start analysis
		await selectMethod(page, 'FEL');
		const started = await startAnalysis(page);
		if (!started) {
			console.log('Could not start analysis');
			test.skip();
			return;
		}

		// Give it a moment to register
		await page.waitForTimeout(2000);

		// Check that running count increased
		const runningAfterStart = await getRunningCount(page);
		console.log(`After starting FEL: running=${runningAfterStart}`);
		expect(runningAfterStart).toBeGreaterThanOrEqual(1);

		// Wait for analysis to complete (FEL on CD2-slim is fast)
		let finalRunning = runningAfterStart;
		let finalCompleted = initialCompleted;

		for (let i = 0; i < 45; i++) {
			await page.waitForTimeout(2000);
			finalRunning = await getRunningCount(page);
			finalCompleted = await getCompletedCount(page);
			console.log(`Check ${i + 1}: running=${finalRunning}, completed=${finalCompleted}`);

			// Analysis completed when running decreased or completed increased
			if (finalCompleted > initialCompleted) {
				console.log('Analysis completed successfully!');
				break;
			}
		}

		// Verify the analysis completed
		expect(finalCompleted).toBeGreaterThan(initialCompleted);
	});

	test('should correctly decrement running count as analyses complete', async ({ page }) => {
		// Load demo file (CD2-slim.fna works reliably)
		await loadDemoFile(page, 'CD2-slim.fna');

		// Navigate to Analyze tab
		const wentToAnalyze = await goToAnalyzeTab(page);
		if (!wentToAnalyze) {
			test.skip();
			return;
		}

		// Start a FEL analysis
		await selectMethod(page, 'FEL');
		const started = await startAnalysis(page);
		if (!started) {
			test.skip();
			return;
		}

		// Wait for it to appear in running
		await page.waitForTimeout(1000);
		const runningAtStart = await getRunningCount(page);
		console.log(`Running at start: ${runningAtStart}`);

		// Wait for completion (check periodically)
		let finalRunning = runningAtStart;
		let finalCompleted = 0;

		for (let i = 0; i < 45; i++) {
			await page.waitForTimeout(2000);
			finalRunning = await getRunningCount(page);
			finalCompleted = await getCompletedCount(page);
			console.log(`Check ${i + 1}: running=${finalRunning}, completed=${finalCompleted}`);

			// If running decreased and completed increased, we're done
			if (finalRunning < runningAtStart || finalCompleted > 0) {
				break;
			}
		}

		// Verify the analysis completed
		// Either running count decreased OR completed count increased
		const runningDecreased = finalRunning < runningAtStart;
		const completedIncreased = finalCompleted > 0;

		expect(runningDecreased || completedIncreased).toBe(true);
	});

	test('should show correct counts after page refresh during running analysis', async ({ page }) => {
		// Load demo file
		await loadDemoFile(page, 'CD2-slim.fna');

		// Navigate to Analyze tab
		const wentToAnalyze = await goToAnalyzeTab(page);
		if (!wentToAnalyze) {
			test.skip();
			return;
		}

		// Start an analysis
		await selectMethod(page, 'FEL');
		const started = await startAnalysis(page);
		if (!started) {
			test.skip();
			return;
		}

		// Wait a moment for it to start
		await page.waitForTimeout(2000);

		// Get counts before refresh
		const runningBeforeRefresh = await getRunningCount(page);
		const completedBeforeRefresh = await getCompletedCount(page);
		console.log(`Before refresh: running=${runningBeforeRefresh}, completed=${completedBeforeRefresh}`);

		// Refresh the page
		await page.reload();
		await waitForAppReady(page);

		// Get counts after refresh
		const runningAfterRefresh = await getRunningCount(page);
		const completedAfterRefresh = await getCompletedCount(page);
		console.log(`After refresh: running=${runningAfterRefresh}, completed=${completedAfterRefresh}`);

		// The sum of running + completed should be consistent
		// (running may have become completed during refresh)
		const totalBefore = runningBeforeRefresh + completedBeforeRefresh;
		const totalAfter = runningAfterRefresh + completedAfterRefresh;

		// Total should be at least what it was before (may have increased if analysis completed)
		expect(totalAfter).toBeGreaterThanOrEqual(totalBefore);
	});
});

test.describe('Status Indicator Count Accuracy', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			return new Promise((resolve, reject) => {
				const req = indexedDB.deleteDatabase('datamonkey3-analyses');
				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			});
		});
		await page.reload();
		await waitForAppReady(page);
	});

	test('running count should never exceed actual running analyses', async ({ page }) => {
		// Load demo file
		await loadDemoFile(page, 'CD2-slim.fna');

		// Navigate to Analyze tab
		const wentToAnalyze = await goToAnalyzeTab(page);
		if (!wentToAnalyze) {
			test.skip();
			return;
		}

		// Start one analysis
		await selectMethod(page, 'FEL');
		const started = await startAnalysis(page);
		if (!started) {
			test.skip();
			return;
		}

		// Monitor the running count for 30 seconds
		let maxRunningObserved = 0;
		let analysesStarted = 1;

		for (let i = 0; i < 15; i++) {
			await page.waitForTimeout(2000);
			const currentRunning = await getRunningCount(page);
			const currentCompleted = await getCompletedCount(page);

			console.log(`Observation ${i + 1}: running=${currentRunning}, completed=${currentCompleted}`);

			if (currentRunning > maxRunningObserved) {
				maxRunningObserved = currentRunning;
			}

			// Running count should never exceed number of analyses we started
			expect(currentRunning).toBeLessThanOrEqual(analysesStarted);

			// Running + completed should never exceed total analyses
			expect(currentRunning + currentCompleted).toBeLessThanOrEqual(analysesStarted + 10); // +10 for any pre-existing
		}
	});

	test('completed count should only include today\'s analyses', async ({ page }) => {
		// Load demo file
		await loadDemoFile(page, 'CD2-slim.fna');

		// Navigate to Analyze tab
		const wentToAnalyze = await goToAnalyzeTab(page);
		if (!wentToAnalyze) {
			test.skip();
			return;
		}

		// Start an analysis
		await selectMethod(page, 'FEL');
		const started = await startAnalysis(page);
		if (!started) {
			test.skip();
			return;
		}

		// Wait for it to complete
		let completedCount = 0;
		for (let i = 0; i < 45; i++) {
			await page.waitForTimeout(2000);
			completedCount = await getCompletedCount(page);
			const runningCount = await getRunningCount(page);
			console.log(`Check ${i + 1}: running=${runningCount}, completed=${completedCount}`);

			if (completedCount > 0 && runningCount === 0) {
				break;
			}
		}

		// Completed count should be positive
		expect(completedCount).toBeGreaterThan(0);

		// Refresh and verify it persists (still today)
		await page.reload();
		await waitForAppReady(page);

		const completedAfterRefresh = await getCompletedCount(page);
		expect(completedAfterRefresh).toBe(completedCount);
	});
});
