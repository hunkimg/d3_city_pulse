<script lang="ts">
  import { onMount } from "svelte";

  // Public props
  export let minWidth = 300;
  export let minHeight = 300;
  export let maxWidth = 600;
  export let maxHeight = 600;

  let container: HTMLDivElement;
  let width = 0;
  let height = 0;

  let resizeObserver: ResizeObserver;

  function updateDimensions() {
    if (container) {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerHeight = rect.height;

      width = Math.max(minWidth, Math.min(containerWidth, maxWidth));
      height = Math.max(minHeight, Math.min(containerHeight, maxHeight));
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
  <div
    class="chart-content"
    style="
      width: {width}px;
      height: {height}px;
      max-width: {maxWidth}px;
      max-height: {maxHeight}px;
    "
  >
    <slot {width} {height} />
  </div>
</div>
