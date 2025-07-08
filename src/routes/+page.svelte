<script lang="ts">
  import Dropdown from "../components/Dropdown.svelte";
  import SpiderChart from "../components/SpiderChart.svelte";

  import { select, selectAll } from "d3-selection";
  import { onMount } from "svelte";
  // JSON files can be imported directly in Svelte/Vite
  // The path is relative to this file's location
  import citiesData from "../data/2025citiesspiderdata.json";
  import colors from "../data/colors.json";
  import ChartResizer from "../components/ChartResizer.svelte";

  // I would like to use the dropdown to select a city from the citiesData
  const quantitativeColumns = new Set<string>();
  for (const city of citiesData) {
    for (const key in city) {
      if (typeof city[key as keyof typeof city] === "number") {
        quantitativeColumns.add(key);
      }
    }
  }
  const globalData = citiesData.find((city) => city.Region === "Global");
  const regions = [...new Set(citiesData.map((city) => city.Region))];
  const regionalData = citiesData.filter((city) => city.Region !== "Global");
  let selectedCities: Array<(typeof citiesData)[0]> = regionalData.filter(
    (el) => el.visible,
  );

  // Handle city selection from dropdown
  function handleCitySelect(event: CustomEvent) {
    console.log("Dropdown selection changed:", event.detail);
    selectedCities = event.detail;
  }
</script>

<!-- Add correct components -->
<div class="app-container">
  <Dropdown {citiesData} {selectedCities} on:citySelect={handleCitySelect} />
  <div class="chart-container">
    <ChartResizer minWidth={400} minHeight={400}>
      <svelte:fragment let:width let:height>
        <SpiderChart
          {quantitativeColumns}
          {selectedCities}
          {citiesData}
          {width}
          height={width}
        />
      </svelte:fragment>
    </ChartResizer>
  </div>
</div>

<style>
  @import "../styles/gensler_global.css";
  @import "../styles/global_style.css";
  @import "../styles/style.css";

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 20px;
    gap: 20px;
  }

  .chart-container {
    flex: 1;
    min-height: 0;
    height: auto;
  }
</style>
