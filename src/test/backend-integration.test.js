import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { backendAnalysisRunner } from '../lib/services/BackendAnalysisRunner.js';
import { analysisStore } from '../stores/analyses.js';

// Mock socket.io-client
const mockSocket = {
	connected: false,
	connect: vi.fn(),
	disconnect: vi.fn(),
	emit: vi.fn(),
	on: vi.fn(),
	off: vi.fn()
};

vi.mock('socket.io-client', () => ({
	default: vi.fn(() => mockSocket)
}));

// Mock the analysisStore
vi.mock('../stores/analyses.js', () => ({
	analysisStore: {
		createAnalysis: vi.fn(),
		updateAnalysis: vi.fn(),
		startAnalysisProgress: vi.fn(),
		updateAnalysisProgress: vi.fn(),
		completeAnalysisProgress: vi.fn(),
		cancelAnalysis: vi.fn()
	}
}));

describe('BackendAnalysisRunner', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSocket.connected = false;
		if (mockSocket.emit && mockSocket.emit.mockClear) {
			mockSocket.emit.mockClear();
		}
		if (mockSocket.on && mockSocket.on.mockClear) {
			mockSocket.on.mockClear();
		}
		backendAnalysisRunner.activeAnalyses.clear();
		backendAnalysisRunner.socket = null;
	});

	afterEach(() => {
		backendAnalysisRunner.disconnect();
	});

	describe('Connection Management', () => {
		it('should connect to backend server', async () => {
			mockSocket.connected = true;

			// Mock successful connection
			mockSocket.on.mockImplementation((event, callback) => {
				if (event === 'connect') {
					setTimeout(() => callback(), 10);
				}
			});

			const socket = await backendAnalysisRunner.connect();

			expect(socket).toBe(mockSocket);
			expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
		});

		it('should handle connection errors', async () => {
			// Mock connection error
			mockSocket.on.mockImplementation((event, callback) => {
				if (event === 'connect_error') {
					setTimeout(() => callback(new Error('Connection failed')), 10);
				}
			});

			await expect(backendAnalysisRunner.connect()).rejects.toThrow('Backend connection failed');
		});

		it('should handle connection timeout', async () => {
			// Don't trigger any callbacks to simulate timeout
			mockSocket.on.mockImplementation(() => {});

			await expect(backendAnalysisRunner.connect()).rejects.toThrow('Backend connection timeout');
		}, 15000);
	});

	describe('Analysis Submission', () => {
		beforeEach(async () => {
			// Setup connected state
			mockSocket.connected = true;
			mockSocket.on.mockImplementation((event, callback) => {
				if (event === 'connect') {
					setTimeout(() => callback(), 1);
				}
			});

			// Mock analysisStore.createAnalysis to return a mock analysis
			analysisStore.createAnalysis.mockResolvedValue('test-analysis-id');
		});

		it('should submit FEL analysis successfully', async () => {
			const mockFastaData = '>seq1\nACGT\n>seq2\nACGT';
			const mockTreeData = '(seq1:0.1,seq2:0.1);';
			const mockConfig = {
				geneticCode: 'Universal',
				pValueThreshold: 0.1,
				executionMode: 'backend'
			};

			const result = await backendAnalysisRunner.runAnalysis(
				'FEL',
				mockConfig,
				mockFastaData,
				mockTreeData,
				'test-file-id'
			);

			expect(result).toEqual({
				analysisId: expect.any(String),
				jobId: expect.stringMatching(/^FEL-\d+-\w+$/i), // Case insensitive to handle both fel/FEL
				message: 'Analysis submitted to backend server'
			});

			expect(mockSocket.emit).toHaveBeenCalledWith('fel:spawn', {
				alignment: mockFastaData,
				tree: mockTreeData,
				job: expect.objectContaining({
					analysis_type: 'fel',
					code: 'Universal',
					pvalue: 0.1,
					branches: 'All',
					samples: 100
				})
			});

			// Verify createAnalysis was called with correct fileId
			expect(analysisStore.createAnalysis).toHaveBeenCalledWith('test-file-id', 'FEL');
		});

		it('should submit SLAC analysis successfully', async () => {
			const mockFastaData = '>seq1\nACGT\n>seq2\nACGT';
			const mockTreeData = '(seq1:0.1,seq2:0.1);';
			const mockConfig = {
				geneticCode: 'Universal',
				pValueThreshold: 0.05,
				executionMode: 'backend'
			};

			const result = await backendAnalysisRunner.runAnalysis(
				'SLAC',
				mockConfig,
				mockFastaData,
				mockTreeData,
				'test-file-id'
			);

			expect(mockSocket.emit).toHaveBeenCalledWith('slac:spawn', {
				alignment: mockFastaData,
				tree: mockTreeData,
				job: expect.objectContaining({
					analysis_type: 'slac',
					code: 'Universal',
					pvalue: 0.05,
					branches: 'All',
					samples: 100
				})
			});
		});

		it('should validate input data before submission', async () => {
			await expect(
				backendAnalysisRunner.runAnalysis('FEL', {}, '', 'tree', 'test-file-id')
			).rejects.toThrow('FASTA data is empty or invalid');

			await expect(
				backendAnalysisRunner.runAnalysis('FEL', {}, 'fasta', '', 'test-file-id')
			).rejects.toThrow('Tree data is empty or invalid');

			await expect(
				backendAnalysisRunner.runAnalysis('FEL', {}, '   ', 'tree', 'test-file-id')
			).rejects.toThrow('FASTA data is empty or invalid');
		});

		it('should track analysis in activeAnalyses map', async () => {
			const mockFastaData = '>seq1\nACGT';
			const mockTreeData = '(seq1:0.1);';
			const mockConfig = { executionMode: 'backend' };

			const result = await backendAnalysisRunner.runAnalysis(
				'FEL',
				mockConfig,
				mockFastaData,
				mockTreeData,
				'test-file-id'
			);

			expect(backendAnalysisRunner.activeAnalyses.has(result.jobId)).toBe(true);
			expect(backendAnalysisRunner.activeAnalyses.get(result.jobId)).toBe(result.analysisId);
		});
	});

	describe('Parameter Preparation', () => {
		it('should prepare FEL parameters correctly', () => {
			const config = {
				geneticCode: 'Universal',
				pValueThreshold: 0.05,
				confidenceLevel: 0.99,
				rateClasses: 4
			};

			const params = backendAnalysisRunner.prepareAnalysisParameters('FEL', config);

			expect(params).toEqual({
				analysis_type: 'fel',
				code: 'Universal',
				pvalue: 0.05,
				branches: 'All',
				samples: 100
			});
		});

		it('should prepare SLAC parameters correctly', () => {
			const config = {
				geneticCode: 'Vertebrate mitochondrial',
				pValueThreshold: 0.1,
				samples: 200
			};

			const params = backendAnalysisRunner.prepareAnalysisParameters('SLAC', config);

			expect(params).toEqual({
				analysis_type: 'slac',
				code: 'Vertebrate mitochondrial',
				pvalue: 0.1,
				branches: 'All',
				samples: 200
			});
		});

		it('should use default values for missing config', () => {
			const params = backendAnalysisRunner.prepareAnalysisParameters('FEL', {});

			expect(params).toEqual({
				analysis_type: 'fel',
				code: 'Universal',
				pvalue: 0.1,
				branches: 'All',
				samples: 100
			});
		});
	});

	describe('Event Handling', () => {
		beforeEach(async () => {
			mockSocket.connected = true;
			await backendAnalysisRunner.connect();
		});

		it('should handle status updates', () => {
			// Get the status update handler
			const statusHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === 'status update'
			)?.[1];
			expect(statusHandler).toBeDefined();

			// Mock an active analysis
			const jobId = 'test-job-id';
			const analysisId = 'test-analysis-id';
			backendAnalysisRunner.activeAnalyses.set(jobId, analysisId);

			// Simulate status update
			statusHandler({
				jobId,
				progress: 50,
				phase: 'Processing',
				msg: 'Analysis in progress'
			});

			expect(analysisStore.updateAnalysisProgress).toHaveBeenCalledWith(
				'running',
				50,
				'Analysis in progress'
			);
		});

		it('should handle completed analysis', () => {
			const completedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === 'completed'
			)?.[1];
			expect(completedHandler).toBeDefined();

			const jobId = 'test-job-id';
			const analysisId = 'test-analysis-id';
			backendAnalysisRunner.activeAnalyses.set(jobId, analysisId);

			completedHandler({
				jobId,
				results: { test: 'data' },
				analysisTime: 120
			});

			expect(analysisStore.completeAnalysisProgress).toHaveBeenCalledWith(true, expect.any(String));
			expect(backendAnalysisRunner.activeAnalyses.has(jobId)).toBe(false);
		});

		it('should handle analysis errors', () => {
			const errorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'script error')?.[1];
			expect(errorHandler).toBeDefined();

			const jobId = 'test-job-id';
			const analysisId = 'test-analysis-id';
			backendAnalysisRunner.activeAnalyses.set(jobId, analysisId);

			errorHandler({
				message: 'Analysis failed with error'
			});

			expect(analysisStore.completeAnalysisProgress).toHaveBeenCalledWith(
				false,
				expect.stringContaining('failed')
			);
		});
	});

	describe('Analysis Cancellation', () => {
		it('should cancel analysis and emit cancel event', async () => {
			const analysisId = 'test-analysis-id';
			const jobId = 'test-job-id';

			mockSocket.connected = true;
			backendAnalysisRunner.socket = mockSocket;
			backendAnalysisRunner.activeAnalyses.set(jobId, analysisId);

			await backendAnalysisRunner.cancelAnalysis(analysisId);

			expect(mockSocket.emit).toHaveBeenCalledWith('cancel', { jobId });
			expect(analysisStore.cancelAnalysis).toHaveBeenCalledWith(analysisId);
			expect(backendAnalysisRunner.activeAnalyses.has(jobId)).toBe(false);
		});
	});

	describe('Parameter Validation', () => {
		it('should validate parameters via backend', async () => {
			mockSocket.connected = true;
			backendAnalysisRunner.socket = mockSocket;

			// Mock validation response
			const validationPromise = backendAnalysisRunner.validateParameters('FEL', {
				geneticCode: 'Universal'
			});

			// Simulate validation response
			const validatedHandler = mockSocket.on.mock.calls.find(
				(call) => call[0] === 'validated'
			)?.[1];
			setTimeout(() => {
				validatedHandler({ valid: true, message: 'Parameters are valid' });
			}, 10);

			const result = await validationPromise;

			expect(result).toEqual({ valid: true, message: 'Parameters are valid' });
			expect(mockSocket.emit).toHaveBeenCalledWith('fel:check', {
				job: expect.objectContaining({
					analysis_type: 'fel',
					code: 'Universal'
				})
			});
		});

		it('should handle validation timeout', async () => {
			mockSocket.connected = true;
			backendAnalysisRunner.socket = mockSocket;

			// Don't trigger validation response to simulate timeout
			await expect(backendAnalysisRunner.validateParameters('FEL', {})).rejects.toThrow(
				'Parameter validation timeout'
			);
		}, 15000);
	});

	describe('Connection Status', () => {
		it('should report connection status correctly', () => {
			expect(backendAnalysisRunner.isConnected()).toBe(false);

			mockSocket.connected = true;
			backendAnalysisRunner.socket = mockSocket;

			expect(backendAnalysisRunner.isConnected()).toBe(true);
		});

		it('should disconnect cleanly', () => {
			mockSocket.connected = true;
			backendAnalysisRunner.socket = mockSocket;
			backendAnalysisRunner.activeAnalyses.set('job1', 'analysis1');

			backendAnalysisRunner.disconnect();

			expect(mockSocket.disconnect).toHaveBeenCalled();
			expect(backendAnalysisRunner.socket).toBe(null);
			expect(backendAnalysisRunner.activeAnalyses.size).toBe(0);
		});
	});
});

describe('Integration with AnalysisStore', () => {
	it('should use correct analysisStore API', () => {
		// Verify that the methods we expect to use exist
		expect(analysisStore.createAnalysis).toBeDefined();
		expect(analysisStore.updateAnalysis).toBeDefined();
		expect(analysisStore.startAnalysisProgress).toBeDefined();
		expect(analysisStore.updateAnalysisProgress).toBeDefined();
		expect(analysisStore.completeAnalysisProgress).toBeDefined();
		expect(analysisStore.cancelAnalysis).toBeDefined();
	});
});
