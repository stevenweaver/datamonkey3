import FastaExport from '$lib/FastaExport.svelte';
import '../app.css';

export default {
	title: 'Export/FastaExport',
	component: FastaExport,
	argTypes: {
		fileMetricsJSON: { control: 'object' },
		showExport: { control: 'boolean' }
	},
	parameters: {
		docs: {
			description: {
				component:
					'Specialized export component for sequence data. Supports FASTA, CSV, and JSON export formats with options for line wrapping and gap character handling. Designed for use with DataReader analysis results.'
			}
		}
	}
};

// Mock sequence data
const mockFileMetricsWithSequences = {
	FILE_INFO: {
		name: 'hiv_sequences.fasta',
		type: 'FASTA nucleotide alignment',
		sequences: 12,
		sites: 450
	},
	FILE_PARTITION_INFO: {
		0: {
			sites: 450,
			sequences: {
				'HIV-1_A1_U455': 'ATGGCAGATGATTTGTTAGTAGATGGAGGGGTTAACGAAAGCCCAATAAATTTGGGAAAGCTGGGTTATAATGATAAAGTGTTAATAAACGTTTGTGATTCAAAGCTTAATTGCTTAGAGGATATAAATTATAAGGCATTGAAAGAGGCAATAAAAAAATTAGGAGAACTTTTCTATAACATGGCAGTT',
				'HIV-1_B_HXB2': 'ATGGCAGATGATTTGTTAGTAGATGGAGGGGTTAACGAAAGCCCAATAAATTTGGGAAAGCTGGGTTATAATGATAAAGTGTTAATAAACGTTTGTGATTCAAAGCTTAATTGCTTAGAGGATATAAATTATAAGGCATTGAAAGAGGCAATAAAAAAATTAGGAGAACTTTTCTATAACATGGCAGTT',
				'HIV-1_C_ETH222': 'ATGGCAGATGATTTGTTAGTAGATGGAGGGGTTAACGAAAGCCCAATAAATTTGGGAAAGCTGGGTTATAATGATAAAGTGTTAATAAACGTTTGTGATTCAAAGCTTAATTGCTTAGAGGATATAAATTATAAGGCATTGAAAGAGGCAATAAAAAAATTAGGAGAACTTTTCTATAACATGGCAGTT',
				'HIV-1_D_84ZR085': 'ATGGCAGATGATTTGTTAGTAGATGGAGGGGTTAACGAAAGCCCAATAAATTTGGGAAAGCTGGGTTATAATGATAAAGTGTTAATAAACGTTTGTGATTCAAAGCTTAATTGCTTAGAGGATATAAATTATAAGGCATTGAAAGAGGCAATAAAAAAATTAGGAGAACTTTTCTATAACATGGCAGTT',
				'HIV-1_F1_VI850': 'ATGGCAGATGATTTGTTAGTAGATGGAGGGGTTAACGAAAGCCCAATAAATTTGGGAAAGCTGGGTTATAATGATAAAGTGTTAATAAACGTTTGTGATTCAAAGCTTAATTGCTTAGAGGATATAAATTATAAGGCATTGAAAGAGGCAATAAAAAAATTAGGAGAACTTTTCTATAACATGGCAGTT'
			}
		}
	}
};

const mockFileMetricsMultiPartition = {
	FILE_INFO: {
		name: 'multi_gene_alignment.fasta',
		type: 'FASTA nucleotide alignment',
		sequences: 8,
		sites: 900
	},
	FILE_PARTITION_INFO: {
		0: {
			sites: 300,
			sequences: {
				'Seq_A': 'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG',
				'Seq_B': 'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG',
				'Seq_C': 'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG'
			}
		},
		1: {
			sites: 300,
			sequences: {
				'Seq_A': 'GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA',
				'Seq_B': 'GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA',
				'Seq_C': 'GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA'
			}
		},
		2: {
			sites: 300,
			sequences: {
				'Seq_A': 'TACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT',
				'Seq_B': 'TACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT',
				'Seq_C': 'TACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT'
			}
		}
	}
};

const mockFileMetricsWithGaps = {
	FILE_INFO: {
		name: 'gapped_alignment.fasta',
		type: 'FASTA nucleotide alignment',
		sequences: 4,
		sites: 120
	},
	FILE_PARTITION_INFO: {
		0: {
			sites: 120,
			sequences: {
				'Sequence_1': 'ATGCGA---TCGATCGATCGATCGATCGATCG---ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG---ATCGATCGATCG',
				'Sequence_2': 'ATGCGATCG---ATCGATCGATCGATCGATCGATCG---ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG---ATCGATCG',
				'Sequence_3': 'ATGCGATCGATCG---ATCGATCGATCGATCGATCGATCG---ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG---ATCG',
				'Sequence_4': 'ATGCGATCGATCGATCG---ATCGATCGATCGATCGATCGATCG---ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG---'
			}
		}
	}
};

const Template = (args) => ({
	Component: FastaExport,
	props: args
});

export const Default = Template.bind({});
Default.args = {
	fileMetricsJSON: mockFileMetricsWithSequences,
	showExport: true
};
Default.parameters = {
	docs: {
		description: {
			story: 'Default FASTA export panel showing format selection (FASTA, CSV, JSON) and export options.'
		}
	}
};

export const WithGappedSequences = Template.bind({});
WithGappedSequences.args = {
	fileMetricsJSON: mockFileMetricsWithGaps,
	showExport: true
};
WithGappedSequences.parameters = {
	docs: {
		description: {
			story: 'Export panel with sequences containing gap characters (---). The "Include gap characters" checkbox controls whether gaps are preserved in the export.'
		}
	}
};

export const MultiPartitionAlignment = Template.bind({});
MultiPartitionAlignment.args = {
	fileMetricsJSON: mockFileMetricsMultiPartition,
	showExport: true
};
MultiPartitionAlignment.parameters = {
	docs: {
		description: {
			story: 'Export panel for a multi-partition alignment file. Sequences from all partitions will be included in the export.'
		}
	}
};

export const LargeAlignment = Template.bind({});
LargeAlignment.args = {
	fileMetricsJSON: {
		FILE_INFO: {
			name: 'large_dataset.fasta',
			type: 'FASTA nucleotide alignment',
			sequences: 50,
			sites: 1500
		},
		FILE_PARTITION_INFO: {
			0: {
				sites: 1500,
				sequences: Object.fromEntries(
					Array.from({ length: 50 }, (_, i) => [
						`Taxon_${String(i + 1).padStart(3, '0')}`,
						'ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG'
					])
				)
			}
		}
	},
	showExport: true
};
LargeAlignment.parameters = {
	docs: {
		description: {
			story: 'Export panel for a larger alignment with 50 sequences. Line wrap option becomes important for readability.'
		}
	}
};

export const Hidden = Template.bind({});
Hidden.args = {
	fileMetricsJSON: mockFileMetricsWithSequences,
	showExport: false
};
Hidden.parameters = {
	docs: {
		description: {
			story: 'Export panel with showExport set to false - component is not rendered.'
		}
	}
};

export const NoData = Template.bind({});
NoData.args = {
	fileMetricsJSON: null,
	showExport: true
};
NoData.parameters = {
	docs: {
		description: {
			story: 'Export panel when no file metrics data is available. Component will not render.'
		}
	}
};

export const EmptyPartitions = Template.bind({});
EmptyPartitions.args = {
	fileMetricsJSON: {
		FILE_INFO: {
			name: 'empty_file.fasta',
			type: 'FASTA nucleotide alignment',
			sequences: 0,
			sites: 0
		},
		FILE_PARTITION_INFO: {}
	},
	showExport: true
};
EmptyPartitions.parameters = {
	docs: {
		description: {
			story: 'Export panel with file metrics but no actual sequence data in partitions.'
		}
	}
};
