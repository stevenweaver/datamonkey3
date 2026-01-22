#!/usr/bin/env node
/**
 * Generate synthetic test alignments for WASM benchmarking
 *
 * Creates NEXUS files with varying numbers of sequences and sites
 * to cover the range needed for paper benchmarks.
 *
 * Usage: node generate-alignments.js
 */

const fs = require('fs');
const path = require('path');

// Codons for generating realistic-looking coding sequences (NO STOP CODONS)
const CODONS = [
  // Common amino acids (multiple codons)
  'ATG', 'TGG',  // Met, Trp (single codon)
  'TTT', 'TTC',  // Phe
  'TTA', 'TTG', 'CTT', 'CTC', 'CTA', 'CTG',  // Leu
  'ATT', 'ATC', 'ATA',  // Ile
  'GTT', 'GTC', 'GTA', 'GTG',  // Val
  'TCT', 'TCC', 'TCA', 'TCG', 'AGT', 'AGC',  // Ser
  'CCT', 'CCC', 'CCA', 'CCG',  // Pro
  'ACT', 'ACC', 'ACA', 'ACG',  // Thr
  'GCT', 'GCC', 'GCA', 'GCG',  // Ala
  'TAT', 'TAC',  // Tyr
  'CAT', 'CAC',  // His
  'CAA', 'CAG',  // Gln
  'AAT', 'AAC',  // Asn
  'AAA', 'AAG',  // Lys
  'GAT', 'GAC',  // Asp
  'GAA', 'GAG',  // Glu
  'TGT', 'TGC',  // Cys
  'CGT', 'CGC', 'CGA', 'CGG', 'AGA', 'AGG',  // Arg
  'GGT', 'GGC', 'GGA', 'GGG'   // Gly
];

// Stop codons - NOT used to avoid HyPhy errors
const STOP_CODONS = ['TAA', 'TAG', 'TGA'];

// Mutation rate for introducing variation
const MUTATION_RATE = 0.05;

// Seeded random for reproducibility
let seed = 12345;
function seededRandom() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function randomCodon() {
  return CODONS[Math.floor(seededRandom() * CODONS.length)];
}

function isStopCodon(codon) {
  return STOP_CODONS.includes(codon);
}

function mutateCodon(codon) {
  const bases = ['A', 'T', 'G', 'C'];
  let mutated;
  let attempts = 0;
  do {
    const chars = codon.split('');
    const pos = Math.floor(seededRandom() * 3);
    chars[pos] = bases[Math.floor(seededRandom() * 4)];
    mutated = chars.join('');
    attempts++;
  } while (isStopCodon(mutated) && attempts < 10);

  // If we couldn't avoid a stop codon, return a safe codon
  if (isStopCodon(mutated)) {
    return randomCodon();
  }
  return mutated;
}

function generateAncestorSequence(numCodons) {
  let seq = 'ATG'; // Start codon
  for (let i = 1; i < numCodons; i++) {
    seq += randomCodon();
  }
  // Do NOT end with stop codon - HyPhy selection analyses don't accept them
  return seq;
}

function evolveSequence(ancestor, distance = 0.05) {
  let seq = '';
  for (let i = 0; i < ancestor.length; i += 3) {
    const codon = ancestor.substring(i, i + 3);
    if (seededRandom() < distance) {
      seq += mutateCodon(codon);
    } else {
      seq += codon;
    }
  }
  return seq;
}

function generateTree(taxa, depth = 0) {
  if (taxa.length === 1) {
    return { name: taxa[0], branchLength: seededRandom() * 0.1 + 0.01 };
  }
  if (taxa.length === 2) {
    return {
      left: { name: taxa[0], branchLength: seededRandom() * 0.1 + 0.01 },
      right: { name: taxa[1], branchLength: seededRandom() * 0.1 + 0.01 },
      branchLength: depth > 0 ? seededRandom() * 0.1 + 0.01 : 0
    };
  }

  // Split taxa randomly
  const shuffled = [...taxa].sort(() => seededRandom() - 0.5);
  const mid = Math.floor(shuffled.length / 2);
  const left = shuffled.slice(0, mid);
  const right = shuffled.slice(mid);

  return {
    left: generateTree(left, depth + 1),
    right: generateTree(right, depth + 1),
    branchLength: depth > 0 ? seededRandom() * 0.1 + 0.01 : 0
  };
}

function treeToNewick(node) {
  if (node.name) {
    return `${node.name}:${node.branchLength.toFixed(6)}`;
  }
  const leftStr = treeToNewick(node.left);
  const rightStr = treeToNewick(node.right);
  if (node.branchLength > 0) {
    return `(${leftStr},${rightStr}):${node.branchLength.toFixed(6)}`;
  }
  return `(${leftStr},${rightStr})`;
}

function generateAlignment(numSeq, numCodons) {
  const sequences = {};
  const taxaNames = [];

  // Generate taxa names
  for (let i = 1; i <= numSeq; i++) {
    const name = `Seq${String(i).padStart(4, '0')}`;
    taxaNames.push(name);
  }

  // Generate ancestor and evolve sequences
  const ancestor = generateAncestorSequence(numCodons);

  // Create tree structure for evolution simulation
  const tree = generateTree(taxaNames);

  // Evolve sequences along tree (simplified - just vary from ancestor)
  for (let i = 0; i < numSeq; i++) {
    const distance = 0.01 + (seededRandom() * 0.15); // 1-16% divergence
    sequences[taxaNames[i]] = evolveSequence(ancestor, distance);
  }

  // Generate Newick tree
  const newickTree = treeToNewick(tree);

  return { sequences, taxaNames, newickTree, numSites: numCodons * 3 };
}

function generateNexusFile(numSeq, numCodons, filename) {
  const { sequences, taxaNames, newickTree, numSites } = generateAlignment(numSeq, numCodons);

  // Calculate max name length for padding
  const maxNameLen = Math.max(...taxaNames.map(n => n.length));

  let nexus = '#NEXUS\n';
  nexus += `[Generated for WASM benchmarking - ${numSeq} sequences, ${numCodons} codons (${numSites} sites)]\n\n`;

  nexus += 'BEGIN TAXA;\n';
  nexus += `    DIMENSIONS NTAX=${numSeq};\n`;
  nexus += '    TAXLABELS\n';
  for (const name of taxaNames) {
    nexus += `        ${name}\n`;
  }
  nexus += '    ;\n';
  nexus += 'END;\n\n';

  nexus += 'BEGIN CHARACTERS;\n';
  nexus += `    DIMENSIONS NCHAR=${numSites};\n`;
  nexus += '    FORMAT DATATYPE=DNA GAP=- MISSING=?;\n';
  nexus += '    MATRIX\n';

  for (const name of taxaNames) {
    const padding = ' '.repeat(maxNameLen - name.length);
    nexus += `        ${name}${padding}   ${sequences[name]}\n`;
  }

  nexus += '    ;\n';
  nexus += 'END;\n\n';

  nexus += 'BEGIN TREES;\n';
  nexus += `    TREE tree = ${newickTree};\n`;
  nexus += 'END;\n';

  return nexus;
}

// Test alignment configurations
const ALIGNMENTS = [
  { id: 'tiny', sequences: 10, codons: 50, description: 'Tiny (10 seq, 150 sites)' },
  { id: 'small', sequences: 25, codons: 100, description: 'Small (25 seq, 300 sites)' },
  { id: 'medium-narrow', sequences: 50, codons: 67, description: 'Medium Narrow (50 seq, ~200 sites)' },
  { id: 'medium', sequences: 50, codons: 167, description: 'Medium (50 seq, ~500 sites)' },
  { id: 'medium-wide', sequences: 25, codons: 333, description: 'Medium Wide (25 seq, ~1000 sites)' },
  { id: 'large-narrow', sequences: 100, codons: 100, description: 'Large Narrow (100 seq, 300 sites)' },
  { id: 'large', sequences: 100, codons: 200, description: 'Large (100 seq, 600 sites)' },
  { id: 'xlarge', sequences: 200, codons: 150, description: 'X-Large (200 seq, 450 sites)' }
];

// Main execution
const outputDir = path.dirname(__filename);

console.log('Generating test alignments for WASM benchmarking...\n');

for (const config of ALIGNMENTS) {
  // Reset seed for each alignment for reproducibility
  seed = 12345 + config.sequences + config.codons;

  const filename = `${config.id}.nex`;
  const filepath = path.join(outputDir, filename);
  const nexus = generateNexusFile(config.sequences, config.codons, filename);

  fs.writeFileSync(filepath, nexus);
  console.log(`Created ${filename}: ${config.description}`);
  console.log(`  - ${config.sequences} sequences x ${config.codons * 3} sites`);
  console.log(`  - File size: ${(nexus.length / 1024).toFixed(1)} KB`);
  console.log('');
}

console.log('Done! Generated', ALIGNMENTS.length, 'test alignment files.');
