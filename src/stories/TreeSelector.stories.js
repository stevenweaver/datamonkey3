// src/stories/TreeSelector.stories.js
import TreeSelector from '../lib/TreeSelector.svelte';
import '../app.css';

export default {
	title: 'TreeSelector',
	component: TreeSelector,
	argTypes: {
		onChange: { action: 'treeChanged' }
	}
};

const Template = (args) => ({
	Component: TreeSelector,
	props: args
});

export const Default = Template.bind({});
Default.args = {
	trees: {
		nj: '(((((HUMAN:0.0007094811175330963,CHIMP:0.001097999950788399):0.01636505170584718,(BABOON:0.002228135311756104,RHMONKEY:0.003208158699156509):0.02669224056226239):0.1104329651335271,(MOUSE:0.1083853380447001,RAT:0.08033684101813202):0.269861493006827):0.02554526101244153,CAT:0.2324473165131622):0.009523377372626096,(COW:0.2190208699215655,PIG:0.1954998868609751):0.07189141490205825,HORSE:0.1953515445825866)',
		usertree:
			'((((PIG:0.147969,COW:0.213430):0.085099,HORSE:0.165787,CAT:0.264806):0.058611,((RHMONKEY{PR}:0.002015,BABOON{PR}:0.003108){PR}:0.022733,(HUMAN{PR}:0.004349,CHIMP{PR}:0.000799){PR}:0.011873){PR}:0.101856){PR}:0.340802,RAT:0.050958,MOUSE:0.097950)',
		ml: '(((HUMAN:0.00432,CHIMP:0.00789):0.01243,(BABOON:0.00321,RHMONKEY:0.00219):0.02814):0.09531,((MOUSE:0.09127,RAT:0.08316):0.27392,(COW:0.19151,PIG:0.17324,HORSE:0.18962):0.06317):0.03215,CAT:0.22376)'
	},
	selectedTree: 'nj',
	onChange: (selected, taggedNewick) => {
		if (taggedNewick) {
			console.log(`Tree selected: ${selected} with tagged branches: ${taggedNewick}`);
		} else {
			console.log(`Tree selected: ${selected}`);
		}
	}
};

export const SingleTree = Template.bind({});
SingleTree.args = {
	trees: {
		nj: '(((((HUMAN:0.0007094811175330963,CHIMP:0.001097999950788399):0.01636505170584718,(BABOON:0.002228135311756104,RHMONKEY:0.003208158699156509):0.02669224056226239):0.1104329651335271,(MOUSE:0.1083853380447001,RAT:0.08033684101813202):0.269861493006827):0.02554526101244153,CAT:0.2324473165131622):0.009523377372626096,(COW:0.2190208699215655,PIG:0.1954998868609751):0.07189141490205825,HORSE:0.1953515445825866)'
	},
	selectedTree: 'nj',
	onChange: (selected, taggedNewick) => {
		if (taggedNewick) {
			console.log(`Tree selected: ${selected} with tagged branches: ${taggedNewick}`);
		} else {
			console.log(`Tree selected: ${selected}`);
		}
	}
};

export const ManyTrees = Template.bind({});
ManyTrees.args = {
	trees: {
		nj: '(((((HUMAN:0.0007094811175330963,CHIMP:0.001097999950788399):0.01636505170584718,(BABOON:0.002228135311756104,RHMONKEY:0.003208158699156509):0.02669224056226239):0.1104329651335271,(MOUSE:0.1083853380447001,RAT:0.08033684101813202):0.269861493006827):0.02554526101244153,CAT:0.2324473165131622):0.009523377372626096,(COW:0.2190208699215655,PIG:0.1954998868609751):0.07189141490205825,HORSE:0.1953515445825866)',
		usertree:
			'((((PIG:0.147969,COW:0.213430):0.085099,HORSE:0.165787,CAT:0.264806):0.058611,((RHMONKEY{PR}:0.002015,BABOON{PR}:0.003108){PR}:0.022733,(HUMAN{PR}:0.004349,CHIMP{PR}:0.000799){PR}:0.011873){PR}:0.101856){PR}:0.340802,RAT:0.050958,MOUSE:0.097950)',
		ml: '(((HUMAN:0.00432,CHIMP:0.00789):0.01243,(BABOON:0.00321,RHMONKEY:0.00219):0.02814):0.09531,((MOUSE:0.09127,RAT:0.08316):0.27392,(COW:0.19151,PIG:0.17324,HORSE:0.18962):0.06317):0.03215,CAT:0.22376)',
		parsimony: '((HUMAN,CHIMP),(BABOON,RHMONKEY),((MOUSE,RAT),((COW,PIG),HORSE),CAT))',
		custom:
			'((HUMAN:0.001,CHIMP:0.001):0.01,[BABOON:0.002,RHMONKEY:0.003]:0.02,MOUSE:0.05,RAT:0.04,(COW:0.02,PIG:0.01,HORSE:0.015):0.03,CAT:0.02)'
	},
	selectedTree: 'ml',
	onChange: (selected, taggedNewick) => {
		if (taggedNewick) {
			console.log(`Tree selected: ${selected} with tagged branches: ${taggedNewick}`);
		} else {
			console.log(`Tree selected: ${selected}`);
		}
	}
};

export const WithBranchTesting = Template.bind({});
WithBranchTesting.args = {
	trees: {
		nj: '(((((HUMAN:0.0007094811175330963,CHIMP:0.001097999950788399):0.01636505170584718,(BABOON:0.002228135311756104,RHMONKEY:0.003208158699156509):0.02669224056226239):0.1104329651335271,(MOUSE:0.1083853380447001,RAT:0.08033684101813202):0.269861493006827):0.02554526101244153,CAT:0.2324473165131622):0.009523377372626096,(COW:0.2190208699215655,PIG:0.1954998868609751):0.07189141490205825,HORSE:0.1953515445825866)'
	},
	selectedTree: 'nj',
	onChange: (selected, taggedNewick) => {
		if (taggedNewick) {
			console.log(`Tree selected: ${selected} with tagged branches: ${taggedNewick}`);
		} else {
			console.log(`Tree selected: ${selected}`);
		}
	}
};

export const WithBranchTestingInitiallyEnabled = Template.bind({});
WithBranchTestingInitiallyEnabled.args = {
	trees: {
		nj: '(((((HUMAN:0.0007094811175330963,CHIMP:0.001097999950788399):0.01636505170584718,(BABOON:0.002228135311756104,RHMONKEY:0.003208158699156509):0.02669224056226239):0.1104329651335271,(MOUSE:0.1083853380447001,RAT:0.08033684101813202):0.269861493006827):0.02554526101244153,CAT:0.2324473165131622):0.009523377372626096,(COW:0.2190208699215655,PIG:0.1954998868609751):0.07189141490205825,HORSE:0.1953515445825866)'
	},
	selectedTree: 'nj',
	initialBranchTestMode: true,
	onChange: (selected, taggedNewick) => {
		if (taggedNewick) {
			console.log(`Tree selected: ${selected} with tagged branches: ${taggedNewick}`);
		} else {
			console.log(`Tree selected: ${selected}`);
		}
	}
};
