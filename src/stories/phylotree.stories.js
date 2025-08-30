import PhyloTree from '../lib/phylotree.svelte';

export default {
	title: 'PhyloTree',
	component: PhyloTree
};

const validNJString =
	'((((PIG:0.147969,COW:0.213430):0.085099,HORSE:0.165787,CAT:0.264806):0.058611,((RHMONKEY{PR}:0.002015,BABOON{PR}:0.003108){PR}:0.022733,(HUMAN{PR}:0.004349,CHIMP{PR}:0.000799){PR}:0.011873){PR}:0.101856){PR}:0.340802,RAT:0.050958,MOUSE:0.097950)';

export const Default = {
	args: {
		newickString: validNJString,
		height: 600,
		width: 800,
		branchTestMode: false,
		viewerType: 'hyphy-scope'
	}
};

export const HyphyScopeViewer = {
	args: {
		newickString: validNJString,
		height: 600,
		width: 800,
		branchTestMode: false,
		viewerType: 'hyphy-scope'
	}
};

export const PhylotreeViewer = {
	args: {
		newickString: validNJString,
		height: 600,
		width: 800,
		branchTestMode: false,
		viewerType: 'phylotree'
	}
};

export const WithBranchTesting = {
	args: {
		newickString: validNJString,
		height: 600,
		width: 800,
		branchTestMode: true,
		viewerType: 'hyphy-scope'
	}
};
