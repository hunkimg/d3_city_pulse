<script lang="ts">
  export let cityName: string;
  export let metricName: string;
  export let metricValue: number;
  import colors from "../data/colors.json";
</script>

<div class="tooltip">
  <p>{cityName}</p>
  <p>{metricName}</p>
  <p>{Math.round(metricValue * 100)}</p>
</div>

<style>
</style>
