<!-- src/lib/FelVisualization.svelte -->
<script>
	import { onMount } from 'svelte';

	// Props
	export let resultData = null;

	let chart;
	let chartContainer;
	let sites = [];
	let alphaValues = [];
	let betaValues = [];
	let pValues = [];
	let significantSites = [];

	// Process data for visualization when resultData changes
	$: if (resultData && resultData.tested && resultData.tested.sites) {
		processData(resultData);
	}

	function processData(data) {
		sites = [];
		alphaValues = [];
		betaValues = [];
		pValues = [];
		significantSites = [];

		// Extract data from sites
		if (data.tested && data.tested.sites) {
			data.tested.sites.forEach((site, index) => {
				const siteIndex = site.site_index || site.site || index + 1;
				sites.push(siteIndex);

				// Alpha (synonymous rate)
				alphaValues.push(site.alpha || 0);

				// Beta (non-synonymous rate)
				betaValues.push(site.beta || 0);

				// P-values
				pValues.push(site.p || 1);

				// Track significant sites (p <= 0.1)
				if (site.p <= 0.1) {
					significantSites.push({
						index: siteIndex,
						alpha: site.alpha || 0,
						beta: site.beta || 0,
						p: site.p,
						selection: site.beta > site.alpha ? 'positive' : 'negative'
					});
				}
			});
		}

		// If chart already exists, update it
		if (chart) {
			updateChart();
		}
	}

	function createChart() {
		if (!chartContainer || !resultData || !resultData.tested || !resultData.tested.sites) return;

		// Create SVG element
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '400');
		svg.setAttribute('viewBox', '0 0 800 400');

		// Clear container
		chartContainer.innerHTML = '';
		chartContainer.appendChild(svg);

		// Set up chart dimensions
		const margin = { top: 40, right: 80, bottom: 60, left: 60 };
		const width = 800 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		// Create group for chart content
		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
		svg.appendChild(g);

		// Find max values for scales
		const maxAlpha = Math.max(...alphaValues, 2);
		const maxBeta = Math.max(...betaValues, 2);
		const maxRate = Math.max(maxAlpha, maxBeta);

		// X scale (sites)
		const xScale = (index) => (index - 1) * (width / (sites.length - 1));

		// Y scale (rates)
		const yScale = (value) => height - (value / maxRate) * height;

		// Create x-axis
		const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		xAxis.setAttribute('class', 'x-axis');
		xAxis.setAttribute('transform', `translate(0,${height})`);
		g.appendChild(xAxis);

		// Create x-axis line
		const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		xAxisLine.setAttribute('x1', 0);
		xAxisLine.setAttribute('y1', 0);
		xAxisLine.setAttribute('x2', width);
		xAxisLine.setAttribute('y2', 0);
		xAxisLine.setAttribute('stroke', 'black');
		xAxis.appendChild(xAxisLine);

		// Create x-axis label
		const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		xLabel.setAttribute('x', width / 2);
		xLabel.setAttribute('y', 40);
		xLabel.setAttribute('text-anchor', 'middle');
		xLabel.textContent = 'Codon Site';
		xAxis.appendChild(xLabel);

		// Create tick marks for x-axis (every 5 sites)
		const tickInterval = Math.max(1, Math.floor(sites.length / 10));
		for (let i = 0; i < sites.length; i += tickInterval) {
			const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			tick.setAttribute('x1', xScale(i + 1));
			tick.setAttribute('y1', 0);
			tick.setAttribute('x2', xScale(i + 1));
			tick.setAttribute('y2', 6);
			tick.setAttribute('stroke', 'black');
			xAxis.appendChild(tick);

			const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			tickLabel.setAttribute('x', xScale(i + 1));
			tickLabel.setAttribute('y', 20);
			tickLabel.setAttribute('text-anchor', 'middle');
			tickLabel.textContent = sites[i];
			xAxis.appendChild(tickLabel);
		}

		// Create y-axis
		const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		yAxis.setAttribute('class', 'y-axis');
		g.appendChild(yAxis);

		// Create y-axis line
		const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		yAxisLine.setAttribute('x1', 0);
		yAxisLine.setAttribute('y1', 0);
		yAxisLine.setAttribute('x2', 0);
		yAxisLine.setAttribute('y2', height);
		yAxisLine.setAttribute('stroke', 'black');
		yAxis.appendChild(yAxisLine);

		// Create y-axis label
		const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		yLabel.setAttribute('transform', 'rotate(-90)');
		yLabel.setAttribute('x', -height / 2);
		yLabel.setAttribute('y', -40);
		yLabel.setAttribute('text-anchor', 'middle');
		yLabel.textContent = 'Substitution Rate';
		yAxis.appendChild(yLabel);

		// Create tick marks for y-axis
		const yTickCount = 5;
		for (let i = 0; i <= yTickCount; i++) {
			const value = (i / yTickCount) * maxRate;
			const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			tick.setAttribute('x1', 0);
			tick.setAttribute('y1', yScale(value));
			tick.setAttribute('x2', -6);
			tick.setAttribute('y2', yScale(value));
			tick.setAttribute('stroke', 'black');
			yAxis.appendChild(tick);

			const tickLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			tickLabel.setAttribute('x', -10);
			tickLabel.setAttribute('y', yScale(value));
			tickLabel.setAttribute('text-anchor', 'end');
			tickLabel.setAttribute('dominant-baseline', 'middle');
			tickLabel.textContent = value.toFixed(1);
			yAxis.appendChild(tickLabel);
		}

		// Create group for paths
		const pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		pathGroup.setAttribute('class', 'paths');
		g.appendChild(pathGroup);

		// Create alpha rate path (synonymous)
		let alphaPath = 'M';
		for (let i = 0; i < sites.length; i++) {
			alphaPath += `${xScale(i + 1)},${yScale(alphaValues[i])} `;
		}

		const alphaPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		alphaPathElement.setAttribute('d', alphaPath);
		alphaPathElement.setAttribute('fill', 'none');
		alphaPathElement.setAttribute('stroke', 'blue');
		alphaPathElement.setAttribute('stroke-width', '2');
		pathGroup.appendChild(alphaPathElement);

		// Create beta rate path (non-synonymous)
		let betaPath = 'M';
		for (let i = 0; i < sites.length; i++) {
			betaPath += `${xScale(i + 1)},${yScale(betaValues[i])} `;
		}

		const betaPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		betaPathElement.setAttribute('d', betaPath);
		betaPathElement.setAttribute('fill', 'none');
		betaPathElement.setAttribute('stroke', 'red');
		betaPathElement.setAttribute('stroke-width', '2');
		pathGroup.appendChild(betaPathElement);

		// Create points for significant sites
		for (let i = 0; i < sites.length; i++) {
			if (pValues[i] <= 0.1) {
				// Create point for alpha rate
				const alphaPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				alphaPoint.setAttribute('cx', xScale(i + 1));
				alphaPoint.setAttribute('cy', yScale(alphaValues[i]));
				alphaPoint.setAttribute('r', '4');
				alphaPoint.setAttribute('fill', 'blue');
				pathGroup.appendChild(alphaPoint);

				// Create point for beta rate
				const betaPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				betaPoint.setAttribute('cx', xScale(i + 1));
				betaPoint.setAttribute('cy', yScale(betaValues[i]));
				betaPoint.setAttribute('r', '4');
				betaPoint.setAttribute('fill', 'red');
				pathGroup.appendChild(betaPoint);

				// Create a vertical line connecting the points
				const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				line.setAttribute('x1', xScale(i + 1));
				line.setAttribute('y1', yScale(alphaValues[i]));
				line.setAttribute('x2', xScale(i + 1));
				line.setAttribute('y2', yScale(betaValues[i]));
				line.setAttribute('stroke', betaValues[i] > alphaValues[i] ? '#ff000080' : '#0000ff80');
				line.setAttribute('stroke-width', '2');
				line.setAttribute('stroke-dasharray', '3,3');
				pathGroup.appendChild(line);

				// Add label for site
				const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				label.setAttribute('x', xScale(i + 1));
				label.setAttribute('y', Math.min(yScale(alphaValues[i]), yScale(betaValues[i])) - 10);
				label.setAttribute('text-anchor', 'middle');
				label.setAttribute('font-size', '10');
				label.textContent = sites[i];
				pathGroup.appendChild(label);
			}
		}

		// Create legend
		const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		legend.setAttribute('class', 'legend');
		legend.setAttribute('transform', `translate(${width + 20}, 20)`);
		g.appendChild(legend);

		// Alpha legend item
		const alphaLegend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		alphaLegend.setAttribute('transform', 'translate(0, 0)');
		legend.appendChild(alphaLegend);

		const alphaLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		alphaLine.setAttribute('x1', 0);
		alphaLine.setAttribute('y1', 0);
		alphaLine.setAttribute('x2', 20);
		alphaLine.setAttribute('y2', 0);
		alphaLine.setAttribute('stroke', 'blue');
		alphaLine.setAttribute('stroke-width', '2');
		alphaLegend.appendChild(alphaLine);

		const alphaLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		alphaLabel.setAttribute('x', 25);
		alphaLabel.setAttribute('y', 5);
		alphaLabel.textContent = 'Alpha (synonymous)';
		alphaLegend.appendChild(alphaLabel);

		// Beta legend item
		const betaLegend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		betaLegend.setAttribute('transform', 'translate(0, 20)');
		legend.appendChild(betaLegend);

		const betaLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		betaLine.setAttribute('x1', 0);
		betaLine.setAttribute('y1', 0);
		betaLine.setAttribute('x2', 20);
		betaLine.setAttribute('y2', 0);
		betaLine.setAttribute('stroke', 'red');
		betaLine.setAttribute('stroke-width', '2');
		betaLegend.appendChild(betaLine);

		const betaLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		betaLabel.setAttribute('x', 25);
		betaLabel.setAttribute('y', 5);
		betaLabel.textContent = 'Beta (non-synonymous)';
		betaLegend.appendChild(betaLabel);

		// Add title
		const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		title.setAttribute('x', width / 2);
		title.setAttribute('y', -20);
		title.setAttribute('text-anchor', 'middle');
		title.setAttribute('font-size', '16');
		title.setAttribute('font-weight', 'bold');
		title.textContent = 'FEL Analysis: Site-Specific Selection Rates';
		g.appendChild(title);

		chart = { svg, g, xScale, yScale };
	}

	function updateChart() {
		// Not needed for now as we recreate the chart on data change
		createChart();
	}

	onMount(() => {
		if (resultData) {
			createChart();
		}
	});
</script>

<div class="fel-visualization">
	{#if resultData && resultData.tested && resultData.tested.sites && resultData.tested.sites.length > 0}
		<div bind:this={chartContainer} style="width: 100%; height: 400px; border: 1px solid #e2e8f0; border-radius: 0.5rem; overflow: hidden; background-color: #fff;"></div>
	{/if}

	{#if significantSites.length > 0}
		<div class="significant-sites mt-6">
			<h3 class="mb-2 text-lg font-semibold">Significant Sites (p ≤ 0.1)</h3>
			<div class="overflow-x-auto">
				<table class="min-w-full border border-gray-300 bg-white">
					<thead class="bg-gray-100">
						<tr>
							<th class="px-4 py-2 text-left">Site</th>
							<th class="px-4 py-2 text-left">Alpha (α)</th>
							<th class="px-4 py-2 text-left">Beta (β)</th>
							<th class="px-4 py-2 text-left">p-value</th>
							<th class="px-4 py-2 text-left">Selection</th>
						</tr>
					</thead>
					<tbody>
						{#each significantSites as site}
							<tr class="border-t border-gray-300">
								<td class="px-4 py-2">{site.index}</td>
								<td class="px-4 py-2">{site.alpha.toFixed(3)}</td>
								<td class="px-4 py-2">{site.beta.toFixed(3)}</td>
								<td class="px-4 py-2">{site.p.toExponential(2)}</td>
								<td class="px-4 py-2">
									<span
										class={site.selection === 'positive'
											? 'font-semibold text-red-600'
											: 'font-semibold text-blue-600'}
									>
										{site.selection === 'positive' ? 'Positive' : 'Negative'}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{:else if resultData && resultData.tested && resultData.tested.sites}
		<div class="mt-6 rounded-md bg-yellow-50 p-4">
			<p class="text-yellow-700">No significant sites detected at p ≤ 0.1 threshold.</p>
		</div>
	{/if}
</div>

<style>
	/* SVG styles */
	:global(.fel-visualization svg) {
		font-family: sans-serif;
	}

	:global(.fel-visualization .x-axis text, .fel-visualization .y-axis text) {
		font-size: 12px;
	}
</style>
