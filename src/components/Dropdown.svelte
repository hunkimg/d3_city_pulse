<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CityPulseDataType } from "../types/cityPulseData";

  // Props
  export let citiesData: CityPulseDataType[] = [];
  export let selectedCities: Array<CityPulseDataType> = [];

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Group cities by region
  $: regions = [...new Set(citiesData.map((city: any) => city.Region))];
  $: citiesByRegion = regions.reduce(
    (acc, region) => {
      acc[region] = citiesData.filter((city: any) => city.Region === region);
      return acc;
    },
    {} as Record<string, CityPulseDataType[]>
  );

  // Helper function to get selected city names
  $: selectedCityNames = selectedCities.map((city) => city.City);

  // Handle checkbox change
  function handleCityToggle(cityName: string, checked: boolean) {
    let newSelectedCities: Array<(typeof citiesData)[0]>;

    if (checked) {
      const cityData = citiesData.find((city) => city.City === cityName);
      if (cityData && !selectedCities.find((city) => city.City === cityName)) {
        newSelectedCities = [...selectedCities, cityData];
      } else {
        newSelectedCities = selectedCities;
      }
    } else {
      newSelectedCities = selectedCities.filter(
        (city) => city.City !== cityName
      );
    }

    dispatch("citySelect", newSelectedCities);
  }

  // Handle region toggle
  function handleRegionToggle(region: string, checked: boolean) {
    const citiesInRegion: Array<CityPulseDataType> = citiesByRegion[region];
    let newSelectedCities: Array<CityPulseDataType>;

    if (checked) {
      // Add all cities in region that aren't already selected
      const citiesToAdd = citiesInRegion.filter(
        (city: CityPulseDataType) =>
          !selectedCities.find((selected) => selected.City === city.City)
      );
      newSelectedCities = [...selectedCities, ...citiesToAdd];
    } else {
      // Remove all cities in region
      newSelectedCities = selectedCities.filter(
        (city) =>
          !citiesInRegion.find((regionCity) => regionCity.City === city.City)
      );
    }

    dispatch("citySelect", newSelectedCities);
  }

  // Check if all cities in a region are selected
  function isRegionFullySelected(region: string): boolean {
    const citiesInRegion = citiesByRegion[region].map((city: any) => city.City);
    return citiesInRegion.every((city: string) =>
      selectedCityNames.includes(city)
    );
  }

  // Check if some cities in a region are selected
  function isRegionPartiallySelected(region: string): boolean {
    const citiesInRegion = citiesByRegion[region].map((city: any) => city.City);
    const selectedInRegion = citiesInRegion.filter((city: string) =>
      selectedCityNames.includes(city)
    );
    return (
      selectedInRegion.length > 0 &&
      selectedInRegion.length < citiesInRegion.length
    );
  }
</script>

<div class="dropdown-container">
  <label>Select Cities:</label>
  <div class="multi-select">
    {#each regions as region}
      <div class="region-group">
        <div class="region-header">
          <input
            type="checkbox"
            id="region-{region}"
            checked={isRegionFullySelected(region)}
            indeterminate={isRegionPartiallySelected(region)}
            on:change={(e) =>
              handleRegionToggle(
                region,
                (e.target as HTMLInputElement).checked
              )}
          />
          <label for="region-{region}" class="region-label">{region}</label>
        </div>
        <div class="cities-list">
          {#each citiesByRegion[region] as city}
            <div class="city-item">
              <input
                type="checkbox"
                id="city-{city.City}"
                checked={selectedCityNames.includes(city.City)}
                on:change={(e) =>
                  handleCityToggle(
                    city.City,
                    (e.target as HTMLInputElement).checked
                  )}
              />
              <label for="city-{city.City}" class="city-label"
                >{city.City}</label
              >
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  @import "../styles/gensler_global.css";
  @import "../styles/global_style.css";
  @import "../styles/style.css";

  .dropdown-container {
    margin: 20px 0;
  }

  label {
    display: block;
    margin-bottom: 10px;
    font-weight: bold;
  }

  .multi-select {
    border: 1px solid #ccc;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
  }

  .region-group {
    margin-bottom: 15px;
  }

  .region-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .region-label {
    margin-left: 8px;
    font-weight: bold;
    color: #333;
  }

  .cities-list {
    margin-left: 20px;
  }

  .city-item {
    display: flex;
    align-items: center;
    margin: 3px 0;
  }

  .city-label {
    margin-left: 8px;
    font-size: 14px;
    color: #666;
  }

  input[type="checkbox"] {
    margin: 0;
  }
</style>
