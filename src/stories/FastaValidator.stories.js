export default {
	title: 'Components/FastaValidator',
	component: null,
	parameters: {
		docs: {
			description: {
				component: 'A comprehensive FASTA file validation component with repair functionality.'
			}
		}
	},
	argTypes: {
		file: { control: 'object' },
		autoValidate: { control: 'boolean' },
		showRepair: { control: 'boolean' }
	}
};

// Mock file objects for different validation scenarios
const validFastaContent = `>sequence1
ATGCGTACGTACGTACGTACGTACGTACGTACGTACG
>sequence2
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
>sequence3
TACGTACGTACGTACGTACGTACGTACGTACGTACG`;

const invalidFastaContent = `sequence1_no_header
ATGCGTACGTACGTACGTACGTACGTACGTACGTACG
>sequence2
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
>sequence3_invalid_chars
TACGTACXYZACGTACGTACGTACGTACGTACGTACG`;

const mixedLengthFastaContent = `>sequence1
ATGCGTACGTACGTACGTACGTACGTACGTACGTACG
>sequence2_short
GCTAGCTA
>sequence3_long
TACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACGTACG`;

const createMockFile = (name, content) => ({
	name,
	text: () => Promise.resolve(content),
	size: content.length,
	type: 'text/plain'
});

const Template = ({ file, autoValidate, showRepair }) => ({
	Component: () => import('../lib/FastaValidator.svelte'),
	props: {
		file,
		autoValidate,
		showRepair
	}
});

export const NoFile = Template.bind({});
NoFile.args = {
	file: null,
	autoValidate: true,
	showRepair: true
};

export const ValidFile = Template.bind({});
ValidFile.args = {
	file: createMockFile('valid.fasta', validFastaContent),
	autoValidate: true,
	showRepair: true
};

export const InvalidFile = Template.bind({});
InvalidFile.args = {
	file: createMockFile('invalid.fasta', invalidFastaContent),
	autoValidate: true,
	showRepair: true
};

export const MixedLengthFile = Template.bind({});
MixedLengthFile.args = {
	file: createMockFile('mixed_length.fasta', mixedLengthFastaContent),
	autoValidate: true,
	showRepair: true
};

export const WithoutAutoValidation = Template.bind({});
WithoutAutoValidation.args = {
	file: createMockFile('manual.fasta', invalidFastaContent),
	autoValidate: false,
	showRepair: true
};

export const WithoutRepairOption = Template.bind({});
WithoutRepairOption.args = {
	file: createMockFile('no_repair.fasta', invalidFastaContent),
	autoValidate: true,
	showRepair: false
};

export const ProteinSequence = Template.bind({});
ProteinSequence.args = {
	file: createMockFile('protein.fasta', `>protein1
MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKAL
>protein2
PDGLAVLGIFLKVGSAKPGLQKVVDVLDSIKTKGKSADFTNFDPRGLLPESLDYWTYPGSLTT`),
	autoValidate: true,
	showRepair: true
};

export const EmptyFile = Template.bind({});
EmptyFile.args = {
	file: createMockFile('empty.fasta', ''),
	autoValidate: true,
	showRepair: true
};

export const LargeFile = Template.bind({});
LargeFile.args = {
	file: createMockFile('large.fasta', 
		Array.from({ length: 100 }, (_, i) => 
			`>sequence${i + 1}\n${'ATGC'.repeat(250)}`
		).join('\n')
	),
	autoValidate: true,
	showRepair: true
};