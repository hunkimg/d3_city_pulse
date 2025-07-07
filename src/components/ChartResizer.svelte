<script lang="ts">
  import { onMount } from "svelte";

  // Public props
  export let minWidth = 300;
  export let minHeight = 300;

  let container: HTMLDivElement;
  let width = 0;
  let height = 0;

  let resizeObserver: ResizeObserver;

  function updateDimensions() {
    if (container) {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      width = Math.max(containerWidth, minWidth);
      height = Math.max(containerHeight, minHeight);
    }
  }

  onMount(() => {
    updateDimensions();

    resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (resizeObserver && container) {
        resizeObserver.unobserve(container);
      }
    };
  });
</script>

<div bind:this={container} class="chart-resizer-container">
  <div class="chart-content" style="width: {width}px; height: {height}px;">
    <slot {width} {height} />
  </div>
</div>

<style>
  .chart-resizer-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    min-width: 300px;
  }

  .chart-content {
    position: relative;
    transition:
      width 0.3s ease,
      height 0.3s ease;
  }
</style>
