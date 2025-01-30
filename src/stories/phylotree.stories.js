import PhyloTree from "../lib/PhyloTree.svelte";

export default {
  title: "PhyloTree",
  component: PhyloTree,
};

const validNJString =
  "(((((HUMAN:0.0007094811175330963,CHIMP:0.001097999950788399):0.01636505170584718,(BABOON:0.002228135311756104,RHMONKEY:0.003208158699156509):0.02669224056226239):0.1104329651335271,(MOUSE:0.1083853380447001,RAT:0.08033684101813202):0.269861493006827):0.02554526101244153,CAT:0.2324473165131622):0.009523377372626096,(COW:0.2190208699215655,PIG:0.1954998868609751):0.07189141490205825,HORSE:0.1953515445825866)";

export const Default = {
  args: {
    newickString: validNJString, // Pass the NJ string as an argument
    height: 600, // Optional height property
    width: 800, // Optional width property
  },
};
