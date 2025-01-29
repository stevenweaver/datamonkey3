import dataReaderResults from "../lib/dataReaderResults.svelte";

export default {
  title: "dataReaderResults",
  component: dataReaderResults,
};

const validData = {
  "FILE_INFO": {
    "gencodeid": 0,
    "goodtree": 1,
    "nj":
      "(((((HUMAN:0.0007094811175330963,CHIMP:0.001097999950788399):0.01636505170584718,(BABOON:0.002228135311756104,RHMONKEY:0.003208158699156509):0.02669224056226239):0.1104329651335271,(MOUSE:0.1083853380447001,RAT:0.08033684101813202):0.269861493006827):0.02554526101244153,CAT:0.2324473165131622):0.009523377372626096,(COW:0.2190208699215655,PIG:0.1954998868609751):0.07189141490205825,HORSE:0.1953515445825866)",
    "partitions": 1,
    "rawsites": 561,
    "sequences": 10,
    "sites": 187,
    "timestamp": "          1738188391",
  },
  "SEQUENCES": {
    "0": {
      "name": "HUMAN",
      "seqindex": 0,
    },
    "1": {
      "name": "CHIMP",
      "seqindex": 1,
    },
    "2": {
      "name": "BABOON",
      "seqindex": 2,
    },
    "3": {
      "name": "RHMONKEY",
      "seqindex": 3,
    },
    "4": {
      "name": "COW",
      "seqindex": 4,
    },
    "5": {
      "name": "PIG",
      "seqindex": 5,
    },
    "6": {
      "name": "HORSE",
      "seqindex": 6,
    },
    "7": {
      "name": "CAT",
      "seqindex": 7,
    },
    "8": {
      "name": "MOUSE",
      "seqindex": 8,
    },
    "9": {
      "name": "RAT",
      "seqindex": 9,
    },
  },
  "FILE_PARTITION_INFO": {
    "0": {
      "endcodon": 560,
      "partition": 1,
      "span": 561,
      "startcodon": 0,
      "usertree":
        "((((PIG:0.147969,COW:0.213430):0.085099,HORSE:0.165787,CAT:0.264806):0.058611,((RHMONKEY{PR}:0.002015,BABOON{PR}:0.003108){PR}:0.022733,(HUMAN{PR}:0.004349,CHIMP{PR}:0.000799){PR}:0.011873){PR}:0.101856){PR}:0.340802,RAT:0.050958,MOUSE:0.097950)",
    },
  },
};

const errorData = {
  error:
    "This doesn't seem to be a nucleotide alignment. It had 20 character states, whereas we expected 4. Perhaps you uploaded an amino-acid alignment by mistake?",
};

export const Default = {
  args: { jsonData: validData },
};

export const ErrorCase = {
  args: { jsonData: errorData },
};
