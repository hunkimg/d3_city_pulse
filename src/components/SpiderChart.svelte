<script lang="ts">
  import { onMount } from "svelte";
  import colors from "../data/colors.json";
  import Tooltip from "./Tooltip.svelte";
  import * as d3 from "d3";
  import type { CityPulseDataType } from "../types/cityPulseData";
  import kdTree from "kd-tree-javascript";

  export let width: number;
  export let height: number;
  export let quantitativeColumns: Set<string> = new Set();
  export const citiesData: Array<CityPulseDataType> = [];
  export let selectedCities: Array<(typeof citiesData)[0]> = [];

  let container: HTMLDivElement;
  let svg: SVGSVGElement;
  let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let backgroundLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let backgroundGridLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let backgroundAxesLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let backgroundPolygonLayer: d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  >;
  let frontLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let frontPolygonLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let frontCircleLayer: d3.Selection<SVGGElement, unknown, null, undefined>;
  let legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  let tooltipComponent: Tooltip;
  let showTooltip = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipCity = "";

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  let radius = 0;

  const distance = (
    a: {
      x: number;
      y: number;
    },
    b: { x: number; y: number },
  ) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  function initializeChart() {
    if (!svg) return;
    const svgSel = d3.select(svg);
    svgSel.selectAll("*").remove();

    // svg.setAttribute(
    //   "viewBox",
    //   `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
    // );
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);

    chartGroup = svgSel
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    backgroundLayer = chartGroup.append("g").attr("class", "background-layer");
    backgroundAxesLayer = backgroundLayer
      .append("g")
      .attr("class", "background-axes-layer");
    backgroundGridLayer = backgroundLayer
      .append("g")
      .attr("class", "background-grid-layer");
    backgroundPolygonLayer = backgroundLayer
      .append("g")
      .attr("class", "background-polygon-layer");
    frontLayer = chartGroup.append("g").attr("class", "front-layer");
    frontPolygonLayer = frontLayer
      .append("g")
      .attr("class", "front-polygon-layer");
    frontCircleLayer = frontLayer
      .append("g")
      .attr("class", "front-circle-layer");
    legendGroup = chartGroup.append("g").attr("class", "legend-group");
  }
  function drawStaticElements() {
    if (!chartGroup || quantitativeColumns.size === 0) return;

    const metrics = [...quantitativeColumns];
    const angleSlice = (Math.PI * 2) / metrics.length;
    const levels = 5;

    // Calculate radius based on width/height
    radius = Math.min(width, height) / 2 - margin.top;

    // Draw circular grid lines
    backgroundGridLayer
      .selectAll("circle")
      .data(Array.from({ length: levels }, (_, i) => (i + 1) / levels))
      .join("circle")
      .attr("r", (d: number) => radius * d)
      .attr("fill", "none")
      .attr("stroke", "#888888")
      .attr("stroke-width", 0.5);

    // Draw axes lines
    metrics.forEach((_, i) => {
      backgroundAxesLayer
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", radius * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("stroke", "#888888")
        .attr("stroke-width", 0.5);
    });
  }

  function updateCityPolygons() {
    if (!backgroundLayer || !frontLayer || quantitativeColumns.size === 0)
      return;
    const metrics = [...quantitativeColumns];
    const angleSlice = (Math.PI * 2) / metrics.length;

    // Background polygons
    const backgroundPolygons = backgroundPolygonLayer
      .selectAll("polygon")
      .data(selectedCities);

    // Remove old polygons
    backgroundPolygons
      .exit()
      .transition()
      .duration(500)
      .attr("points", metrics.map(() => "0,0").join(" "))
      .remove();

    // Add new polygons
    const backgroundEnter = backgroundPolygons
      .enter()
      .append("polygon")
      .attr("class", "background-city-polygon")
      .attr("points", metrics.map(() => "0,0").join(" "))
      .attr("fill", "none");
    // .attr(
    //   "fill",
    //   (d: CityPulseDataType) =>
    //     colors[d.Region as keyof typeof colors] || "#999",
    // )
    // .attr("fill-opacity", 0.2);

    // Update all polygons

    (backgroundPolygons as any)
      .merge(backgroundEnter)
      .transition()
      .duration(1000)
      .attr("points", (d: CityPulseDataType) => {
        return metrics
          .map((metric, i) => {
            const value =
              Number(d[metric as keyof CityPulseDataType] || 0) / 100;
            return [
              radius * value * Math.cos(angleSlice * i - Math.PI / 2),
              radius * value * Math.sin(angleSlice * i - Math.PI / 2),
            ].join(",");
          })
          .join(" ");
      });

    // Front polygons
    const frontPolygons = frontPolygonLayer
      .selectAll("polygon")
      .data(selectedCities);

    // Remove old polygons
    frontPolygons
      .exit()
      .transition()
      .duration(500)
      .attr("points", metrics.map(() => "0,0").join(" "))
      .remove();

    // Remove mouse events from front polygons since touch layer handles them
    const frontEnter = frontPolygons
      .enter()
      .append("polygon")
      .attr("class", "front-city-polygon")
      .attr("points", metrics.map(() => "0,0").join(" "))
      .attr("fill", "none")
      .attr(
        "stroke",
        (d: CityPulseDataType) =>
          colors[d.Region as keyof typeof colors] || "#999",
      )
      .attr("stroke-width", 3);

    // Update all polygons
    (frontPolygons as any)
      .merge(frontEnter)
      // .attr("stroke-width", 3)
      .transition()
      .duration(1000)
      .attr("points", (d: CityPulseDataType) => {
        return metrics
          .map((metric, i) => {
            const value =
              Number(d[metric as keyof CityPulseDataType] || 0) / 100;
            return [
              radius * value * Math.cos(angleSlice * i - Math.PI / 2),
              radius * value * Math.sin(angleSlice * i - Math.PI / 2),
            ].join(",");
          })
          .join(" ");
      });

    const frontCirclesData = selectedCities.flatMap((d) =>
      metrics.map((metric, i) => {
        const value = Number(d[metric as keyof CityPulseDataType] || 0) / 100;
        return {
          city: d.City,
          metric,
          x: radius * value * Math.cos(angleSlice * i - Math.PI / 2),
          y: radius * value * Math.sin(angleSlice * i - Math.PI / 2),
          color: colors[d.Region as keyof typeof colors] || "#999",
        };
      }),
    );

    const frontCircles = frontCircleLayer
      .selectAll("circle")
      .data(frontCirclesData);

    // Remove old circles
    frontCircles
      .exit()
      .transition()
      .duration(500)
      .attr("r", 0)
      .attr(
        // make it go to center
        "cx",
        0,
      )
      .attr("cy", 0)
      .remove();

    // Add new circles
    const circlesEnter = frontCircles
      .enter()
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d) => d.color)
      .attr("cx", 0)
      .attr("cy", 0);

    // Update all circles
    (frontCircles as any)
      .merge(circlesEnter)
      .transition()
      .duration(1000)
      .attr("r", 8)
      // Place each circle at the last metric's position (polygon endpoint)
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y);
  }

  $: if (svg && width > 0 && height > 0) {
    radius = Math.min(width, height) / 2 - 60;
    initializeChart();
    drawStaticElements();
    updateCityPolygons();
  }

  // Add a separate reactive statement for selectedCities changes
  $: if (svg && selectedCities) {
    updateCityPolygons();
  }
</script>

<div bind:this={container} class="chart-container">
  <svg bind:this={svg} class="chart-svg" {width} {height}></svg>
  {#if showTooltip}
    <div class="tooltip" style="left: {tooltipX}px; top: {tooltipY}px;">
      <Tooltip cityName={tooltipCity} />
    </div>
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
    height: auto;
    position: relative;
  }

  .chart-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .tooltip {
    position: fixed;
    pointer-events: none;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
</style>
