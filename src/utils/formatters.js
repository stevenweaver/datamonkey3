/**
 * Format a file size in bytes to a human-readable string
 * @param {number} bytes - File size in bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
