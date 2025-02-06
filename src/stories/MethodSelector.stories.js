// src/stories/MethodSelector.stories.js
import MethodSelector from '../lib/MethodSelector.svelte';
import '../app.css';

export default {
  title: 'MethodSelector',
  component: MethodSelector
};

const Template = (args) => ({
  Component: MethodSelector,
  props: args
});

export const Default = Template.bind({});
Default.args = {
  methods: [
    'aBSREL',
    'BGM',
    'BUSTED',
    'Contrast-FEL',
    'FADE',
    'FEL',
    'FUBAR',
    'GARD',
    'HIV-TRACE',
    'MEME',
    'MULTI-HIT',
    'NRM',
    'RELAX',
    'SLAC'
  ],
  runMethod: () => console.log('Method run')
};
