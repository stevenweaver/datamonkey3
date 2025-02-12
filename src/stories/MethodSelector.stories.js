// src/stories/MethodSelector.stories.js
import MethodSelector from "../lib/MethodSelector.svelte";
import "../app.css";

export default {
  title: "MethodSelector",
  component: MethodSelector,
};

const Template = (args) => ({
  Component: MethodSelector,
  props: args,
});

export const Default = Template.bind({});
Default.args = {
  methodConfig: {
    aBSREL: {
      command: "absrel",
      outputSuffix: "ABSREL.json",
      url: "absrel",
      args: [],
      description: "A method for assessing the presence of positive selection.",
    },
    BGM: {
      command: "bgm",
      outputSuffix: "BGM.json",
      url: "bgm",
      args: [],
      description: "Bayesian graphical models for comparative analysis.",
    },
    BUSTED: {
      command: "busted",
      outputSuffix: "BUSTED.json",
      url: "busted",
      args: [],
      description: "A method for testing positive selection in gene families.",
    },
    "Contrast-FEL": {
      command: "contrast-fel",
      outputSuffix: "CFEL.json",
      url: "contrast-fel",
      args: [],
      description: "Estimates selection pressure on branches.",
    },
    FADE: {
      command: "fade",
      outputSuffix: "FADE.json",
      url: "fade",
      args: [],
      description: "Detects positive selection and adaptive evolution.",
    },
    FEL: {
      command: "fel",
      outputSuffix: "FEL.json",
      url: "fel",
      args: [],
      description: "Fixed Effects Likelihood for testing selection.",
    },
    FUBAR: {
      command: "fubar",
      outputSuffix: "FUBAR.json",
      url: "fubar",
      args: [],
      description: "Identifies positively selected sites.",
    },
    GARD: {
      command: "gard",
      outputSuffix: "GARD.json",
      url: "gard",
      args: [],
      description: "Detects recombination in sequences.",
    },
    MEME: {
      command: "meme",
      outputSuffix: "MEME.json",
      url: "meme",
      args: [],
      description: "Identifies episodic evolution.",
    },
    "MULTI-HIT": {
      command: "fmm",
      outputSuffix: "FMM.json",
      url: "multhit",
      args: [],
      description: "Analyzes multiple hits in evolution.",
    },
    NRM: {
      command: null,
      outputSuffix: "NRM.json",
      url: "nrm",
      args: [],
      description: "Nonstationary rate mixture model.",
    },
    RELAX: {
      command: "relax",
      outputSuffix: "RELAX.json",
      url: "relax",
      args: [],
      description: "Tests for heterogeneous selection.",
    },
    SLAC: {
      command: "slac",
      outputSuffix: "SLAC.json",
      url: "slac",
      args: [],
      description: "Estimation of selection pressure.",
    },
  },
  runMethod: () => console.log("Method run"),
};
