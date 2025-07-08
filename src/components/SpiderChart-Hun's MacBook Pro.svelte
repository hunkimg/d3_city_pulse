<script lang="ts">
  import { onMount } from "svelte";
  import colors from "../data/colors.json";
  import Tooltip from "./Tooltip.svelte";
  import * as d3 from "d3";
  import type { CityPulseDataType } from "../types/cityPulseData";

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
  let legendGroup: d3.Selection<SVGGElement, unknown, null, undefined>;

  let tooltipComponent: Tooltip;
  let showTooltip = false;
  let tooltipX = 0;
  let tooltipY = 0;
  let tooltipCity = "";

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  let radius = 0;

  function initializeChart() {
    if (!svg) return;
    const svgSel = d3.select(svg);
    svgSel.selectAll("*").remove();

    svg.setAttribute(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
    );

    chartGroup = svgSel
      .append("g")
      .attr(
        "transform",
        `translate(${width / 2 + margin.left},${height / 2 + margin.top})`
      );

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
    frontPolygonLayer = chartGroup
      .append("g")
      .attr("class", "front-polygon-layer");
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
      .attr("stroke", "#CDCDCD")
      .attr("stroke-width", 0.5);

    // Draw axes lines
    metrics.forEach((_, i) => {
      backgroundAxesLayer
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", radius * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("stroke", "#CDCDCD")
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
      .attr(
        "fill",
        (d: CityPulseDataType) =>
          colors[d.Region as keyof typeof colors] || "#999"
      )
      .attr("fill-opacity", 0.2);

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
      .attr("fill", "none")
      .attr("stroke-width", 1)
      .attr(
        "stroke",
        (d: CityPulseDataType) =>
          colors[d.Region as keyof typeof colors] || "#999"
      )
      .attr("points", metrics.map(() => "0,0").join(" "));

    // Update all polygons
    (frontPolygons as any)
      .merge(frontEnter)
      .attr("stroke-width", 1)
      .attr(
        "stroke",
        (d: CityPulseDataType) =>
          colors[d.Region as keyof typeof colors] || "#999"
      )
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

    // Touch layer (invisible larger stroke for better interaction)
    const touchPolygons = frontPolygonLayer
      .selectAll(".touch-polygon")
      .data(selectedCities);

    // Remove old touch polygons
    touchPolygons
      .exit()
      .transition()
      .duration(500)
      .attr("points", metrics.map(() => "0,0").join(" "))
      .remove();

    // Add new touch polygons
    const touchEnter = touchPolygons
      .enter()
      .append("polygon")
      .attr("class", "touch-polygon")
      .attr("fill", "none")
      .attr("stroke", "transparent")
      .attr("stroke-width", 10) // Much larger stroke for touch
      .attr("points", metrics.map(() => "0,0").join(" "))
      .on("mouseenter", () => (showTooltip = true))
      .on("mouseleave", () => (showTooltip = false))
      .on("mousemove", (event: MouseEvent, d: CityPulseDataType) => {
        tooltipX = event.clientX;
        tooltipY = event.clientY;
        tooltipCity = d.City;
      });

    // Update all touch polygons
    (touchPolygons as any)
      .merge(touchEnter)
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
    height: 100%;
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
