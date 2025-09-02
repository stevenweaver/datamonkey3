/**
 * IndexedDB Storage Utility
 *
 * Provides functionality for storing and retrieving files and analysis results
 * in the browser's IndexedDB storage.
 */

// Database configuration
const DB_NAME = 'fasta-validation-db';
const DB_VERSION = 2; // Increment version for schema changes
const FILES_STORE = 'files';
const ANALYSES_STORE = 'analyses';

// Initialize the database
async function initDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = (event) => {
			console.error('IndexedDB error:', event.target.error);
			reject(event.target.error);
		};

		request.onsuccess = (event) => {
			const db = event.target.result;
			resolve(db);
		};

		request.onupgradeneeded = (event) => {
			const db = event.target.result;

			// Delete existing stores to start fresh (alpha version, no migration needed)
			if (db.objectStoreNames.contains(FILES_STORE)) {
				db.deleteObjectStore(FILES_STORE);
			}
			if (db.objectStoreNames.contains(ANALYSES_STORE)) {
				db.deleteObjectStore(ANALYSES_STORE);
			}

			// Create simplified stores (no indexes for small datasets)
			db.createObjectStore(FILES_STORE, { keyPath: 'id' });
			db.createObjectStore(ANALYSES_STORE, { keyPath: 'id' });
		};
	});
}

/**
 * File Storage Operations
 */
export const fileStorage = {
	/**
	 * Save a file to IndexedDB
	 * @param {File} file - The file object to save
	 * @param {Object} metadata - Additional metadata about the file
	 * @returns {Promise<string>} - The ID of the saved file
	 */
	async saveFile(file, metadata = {}) {
		try {
			const db = await initDB();

			// Check if a file with the same name already exists
			const existingFile = await this.findFileByName(file.name);

			// If file exists and we're not forcing a new save, update it
			if (existingFile && !metadata.forceNew) {
				// Update the existing file
				return this.updateFile(existingFile.id, {
					...existingFile,
					type: file.type,
					size: file.size,
					content: await file.arrayBuffer(),
					updatedAt: new Date().getTime(),
					...metadata
				});
			}

			// Create new file
			const id = crypto.randomUUID();

			// Convert file to ArrayBuffer for storage
			const arrayBuffer = await file.arrayBuffer();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([FILES_STORE], 'readwrite');
				const store = transaction.objectStore(FILES_STORE);

				const fileRecord = {
					id,
					filename: file.name,
					type: file.type,
					size: file.size,
					content: arrayBuffer,
					createdAt: new Date().getTime(),
					...metadata
				};

				const request = store.add(fileRecord);

				request.onsuccess = () => {
					resolve(id);
				};

				request.onerror = (event) => {
					console.error('Error saving file:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in saveFile:', error);
			throw error;
		}
	},

	/**
	 * Get a file from IndexedDB by ID
	 * @param {string} id - The ID of the file to retrieve
	 * @returns {Promise<Object>} - The file object with content
	 */
	async getFile(id) {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([FILES_STORE], 'readonly');
				const store = transaction.objectStore(FILES_STORE);
				const request = store.get(id);

				request.onsuccess = (event) => {
					if (event.target.result) {
						resolve(event.target.result);
					} else {
						reject(new Error('File not found'));
					}
				};

				request.onerror = (event) => {
					console.error('Error retrieving file:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in getFile:', error);
			throw error;
		}
	},

	/**
	 * Get all files from IndexedDB
	 * @returns {Promise<Array>} - Array of file objects (without content)
	 */
	async getAllFiles() {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([FILES_STORE], 'readonly');
				const store = transaction.objectStore(FILES_STORE);
				const request = store.getAll();

				request.onsuccess = (event) => {
					// Return files without the content to save memory
					const files = event.target.result.map((file) => {
						const { content, ...fileWithoutContent } = file;
						return fileWithoutContent;
					});

					resolve(files);
				};

				request.onerror = (event) => {
					console.error('Error retrieving files:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in getAllFiles:', error);
			throw error;
		}
	},

	/**
	 * Delete a file from IndexedDB
	 * @param {string} id - The ID of the file to delete
	 * @returns {Promise<boolean>} - True if successful
	 */
	async deleteFile(id) {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([FILES_STORE], 'readwrite');
				const store = transaction.objectStore(FILES_STORE);
				const request = store.delete(id);

				request.onsuccess = () => {
					resolve(true);
				};

				request.onerror = (event) => {
					console.error('Error deleting file:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in deleteFile:', error);
			throw error;
		}
	},

	/**
	 * Update an existing file in IndexedDB
	 * @param {string} id - The ID of the file to update
	 * @param {Object} fileData - The updated file data
	 * @returns {Promise<boolean>} - True if successful
	 */
	async updateFile(id, fileData) {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([FILES_STORE], 'readwrite');
				const store = transaction.objectStore(FILES_STORE);
				const request = store.put(fileData); // put will update if the ID exists

				request.onsuccess = () => {
					resolve(true);
				};

				request.onerror = (event) => {
					console.error('Error updating file:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in updateFile:', error);
			throw error;
		}
	},

	/**
	 * Find a file by name in IndexedDB
	 * @param {string} filename - The name of the file to find
	 * @returns {Promise<Object|null>} - The file record or null if not found
	 */
	async findFileByName(filename) {
		try {
			const allFiles = await this.getAllFiles();
			const matchingFiles = allFiles.filter(file => file.filename === filename);
			
			if (matchingFiles.length > 0) {
				// Return the most recent one if multiple exist
				matchingFiles.sort((a, b) => b.createdAt - a.createdAt);
				// Need to get the full file with content
				return await this.getFile(matchingFiles[0].id);
			}
			
			return null;
		} catch (error) {
			console.error('Error in findFileByName:', error);
			throw error;
		}
	},

	/**
	 * Convert stored file to a File object
	 * @param {Object} fileRecord - The file record from IndexedDB
	 * @returns {Promise<File>} - A File object
	 */
	async fileRecordToFile(fileRecord) {
		try {
			const { content, filename, type } = fileRecord;
			return new File([content], filename, { type });
		} catch (error) {
			console.error('Error converting file record:', error);
			throw error;
		}
	}
};

/**
 * Analysis Storage Operations
 */
export const analysisStorage = {
	/**
	 * Save an analysis to IndexedDB
	 * @param {Object} analysis - The analysis object to save
	 * @returns {Promise<string>} - The ID of the saved analysis
	 */
	async saveAnalysis(analysis) {
		try {
			const db = await initDB();
			const id = analysis.id || crypto.randomUUID();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([ANALYSES_STORE], 'readwrite');
				const store = transaction.objectStore(ANALYSES_STORE);

				const analysisRecord = {
					...analysis,
					id,
					createdAt: analysis.createdAt || new Date().getTime(),
					updatedAt: new Date().getTime()
				};

				const request = store.put(analysisRecord);

				request.onsuccess = () => {
					resolve(id);
				};

				request.onerror = (event) => {
					console.error('Error saving analysis:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in saveAnalysis:', error);
			throw error;
		}
	},

	/**
	 * Get an analysis from IndexedDB by ID
	 * @param {string} id - The ID of the analysis to retrieve
	 * @returns {Promise<Object>} - The analysis object
	 */
	async getAnalysis(id) {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([ANALYSES_STORE], 'readonly');
				const store = transaction.objectStore(ANALYSES_STORE);
				const request = store.get(id);

				request.onsuccess = (event) => {
					if (event.target.result) {
						resolve(event.target.result);
					} else {
						reject(new Error('Analysis not found'));
					}
				};

				request.onerror = (event) => {
					console.error('Error retrieving analysis:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in getAnalysis:', error);
			throw error;
		}
	},

	/**
	 * Get all analyses from IndexedDB
	 * @returns {Promise<Array>} - Array of analysis objects
	 */
	async getAllAnalyses() {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([ANALYSES_STORE], 'readonly');
				const store = transaction.objectStore(ANALYSES_STORE);
				const request = store.getAll();

				request.onsuccess = (event) => {
					resolve(event.target.result);
				};

				request.onerror = (event) => {
					console.error('Error retrieving analyses:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in getAllAnalyses:', error);
			throw error;
		}
	},

	/**
	 * Get analyses for a specific file
	 * @param {string} fileId - The ID of the file
	 * @returns {Promise<Array>} - Array of analysis objects for the file
	 */
	async getAnalysesByFileId(fileId) {
		try {
			const allAnalyses = await this.getAllAnalyses();
			return allAnalyses.filter(analysis => analysis.fileId === fileId);
		} catch (error) {
			console.error('Error in getAnalysesByFileId:', error);
			throw error;
		}
	},

	/**
	 * Delete an analysis from IndexedDB
	 * @param {string} id - The ID of the analysis to delete
	 * @returns {Promise<boolean>} - True if successful
	 */
	async deleteAnalysis(id) {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([ANALYSES_STORE], 'readwrite');
				const store = transaction.objectStore(ANALYSES_STORE);
				const request = store.delete(id);

				request.onsuccess = () => {
					resolve(true);
				};

				request.onerror = (event) => {
					console.error('Error deleting analysis:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in deleteAnalysis:', error);
			throw error;
		}
	},

	/**
	 * Clear all analyses from IndexedDB
	 * @returns {Promise<boolean>} - True if successful
	 */
	async clearAllAnalyses() {
		try {
			const db = await initDB();

			return new Promise((resolve, reject) => {
				const transaction = db.transaction([ANALYSES_STORE], 'readwrite');
				const store = transaction.objectStore(ANALYSES_STORE);
				const request = store.clear();

				request.onsuccess = () => {
					resolve(true);
				};

				request.onerror = (event) => {
					console.error('Error clearing all analyses:', event.target.error);
					reject(event.target.error);
				};
			});
		} catch (error) {
			console.error('Error in clearAllAnalyses:', error);
			throw error;
		}
	}
};

export default {
	fileStorage,
	analysisStorage
};
