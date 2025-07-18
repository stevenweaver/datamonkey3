import { writable } from 'svelte/store';

// Initialize with an empty object to avoid null checks
export const treeStore = writable({});

// Helper functions for tree store management
export const addTree = (treeId, newickString, trees = {}) => {
	if (treeId && newickString) {
		trees[treeId] = newickString;
		treeStore.set(trees);
	}
	return trees;
};

export const removeTree = (treeId, trees = {}) => {
	if (treeId && trees[treeId]) {
		delete trees[treeId];
		treeStore.set(trees);
	}
	return trees;
};

export const updateTaggedTree = (treeId, taggedNewick, trees = {}) => {
	if (treeId && taggedNewick) {
		trees[treeId] = taggedNewick;
		treeStore.set(trees);
	}
	return trees;
};
