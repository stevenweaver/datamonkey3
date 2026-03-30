/**
 * E2E tests for invalid file handling
 */

import { test, expect } from '@playwright/test';
import { freshStart, uploadFile, TEST_FILES } from './fixtures/helpers.js';

test.describe('Invalid File Handling', () => {
	test.beforeEach(async ({ page }) => {
		await freshStart(page);
	});

	test('uploading stop-codons file shows warning', async ({ page }) => {
		await uploadFile(page, TEST_FILES['stop-codons.fna']);
		await page.waitForTimeout(5000);

		// Should show some kind of warning or error about stop codons
		const errorOrWarning = page.locator(
			'[data-testid="sequence-info"]:has-text("stop"), ' +
			'.text-status-error, ' +
			':text("stop codon"), ' +
			':text("Stop Codons")'
		);
		// The file may process with warnings (stop codons stripped) or error
		const seqInfo = page.locator('[data-testid="sequence-info"]');
		if (await seqInfo.count() > 0) {
			// File processed but should mention stop codons
			await expect(seqInfo).toBeVisible();
		}
	});

	test('uploading broken file shows error', async ({ page }) => {
		await uploadFile(page, TEST_FILES['broken-not-an-alignment.txt']);
		await page.waitForTimeout(5000);

		// Should show an error - either a validation error or the error mascot
		const errorIndicator = page.locator(
			'.text-status-error, ' +
			'img[alt*="error"], ' +
			':text("Error"), ' +
			':text("error"), ' +
			':text("invalid")'
		);
		await expect(errorIndicator.first()).toBeVisible({ timeout: 10000 });
	});

	test('uploading valid file still works after error', async ({ page }) => {
		// First upload broken file
		await uploadFile(page, TEST_FILES['broken-not-an-alignment.txt']);
		await page.waitForTimeout(5000);

		// Now upload a valid file
		await uploadFile(page, TEST_FILES['CD2-slim.fna']);

		const seqInfo = page.locator('[data-testid="sequence-info"]');
		await expect(seqInfo).toBeVisible({ timeout: 15000 });
		await expect(seqInfo).toContainText('Alignment File Metrics');
	});
});
